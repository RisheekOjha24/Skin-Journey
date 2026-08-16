import PDFDocument from "pdfkit";
import fs from "node:fs";
import axios from "axios";
import { PassThrough } from "node:stream";
import { scanRepository } from "../db/repositories/scan.repository";
import { journalRepository } from "../db/repositories/journal.repository";
import { milestoneRepository } from "../db/repositories/milestone.repository";
import { summaryRepository } from "../db/repositories/summary.repository";
import { userRepository } from "../db/repositories/user.repository";
import { SKIN_METRIC_LABELS } from "../config/constants";
import { ApiError } from "../utils/api-error.util";
import { logger } from "../utils/logger.util";

const REMOTE_IMAGE_TIMEOUT_MS = 10_000;

const COLORS = {
  ink: "#1C1B19",
  muted: "#6B6862",
  accent: "#3D5C4A",
  accentSoft: "#E7EDE8",
  line: "#E4E1D8",
};

const PAGE_MARGIN = 50;
const CONTENT_WIDTH = 495; // A4 width (595) minus left/right margins
const SCAN_ROW_HEIGHT = 128;
const SCAN_IMAGE_SIZE = 96;

/** Fetches a scan's photo as a Buffer so it can be embedded in the PDF, whether it's a local upload path or a remote YouCam URL. Returns null (never throws) if the image can't be resolved, so a missing photo never breaks report generation. */
async function resolveImageBuffer(imagePathOrUrl: string | null): Promise<Buffer | null> {
  if (!imagePathOrUrl) return null;

  try {
    if (imagePathOrUrl.startsWith("http://") || imagePathOrUrl.startsWith("https://")) {
      const response = await axios.get<ArrayBuffer>(imagePathOrUrl, {
        responseType: "arraybuffer",
        timeout: REMOTE_IMAGE_TIMEOUT_MS,
      });
      return Buffer.from(response.data);
    }

    if (fs.existsSync(imagePathOrUrl)) {
      return fs.readFileSync(imagePathOrUrl);
    }

    return null;
  } catch (error) {
    // A missing/unreachable photo should never break report generation
    // — log and fall back to the "No image" placeholder drawn by the
    // caller, whether this was a network error, a timeout, or a 4xx/5xx
    // from wherever the image is hosted.
    logger.warn("Could not resolve scan image for PDF report", {
      imagePathOrUrl,
      error: axios.isAxiosError(error) ? error.message : (error as Error).message,
      status: axios.isAxiosError(error) ? error.response?.status : undefined,
    });
    return null;
  }
}

export const pdfService = {
  /**
   * Streams a dermatologist-ready PDF report directly to the response.
   * Every figure in the report comes straight from stored scan/journal/
   * milestone records — nothing is recalculated speculatively here.
   */
  async generateReport(userId: string): Promise<PassThrough> {
    const user = userRepository.findById(userId);
    if (!user) throw ApiError.notFound("User not found");

    const scans = scanRepository.allForUserOrdered(userId);
    if (scans.length === 0) {
      throw ApiError.badRequest("At least one scan is required to generate a report");
    }

    const journalEntries = journalRepository.allForUserOrdered(userId);
    const milestones = milestoneRepository.listForUser(userId);
    const latestSummary = summaryRepository.latestForUser(userId);

    // Resolve every scan photo up front so the synchronous PDFKit
    // drawing pass below never has to await mid-layout.
    const scanImages = await Promise.all(scans.map((scan) => resolveImageBuffer(scan.image_path)));

    const doc = new PDFDocument({ margin: PAGE_MARGIN, size: "A4" });
    const stream = new PassThrough();
    doc.pipe(stream);

    // Header
    doc.fillColor(COLORS.ink).fontSize(22).font("Helvetica-Bold").text("Skin Journey");
    doc.fontSize(12).font("Helvetica").fillColor(COLORS.accent).text("Dermatologist Report");
    doc
      .fontSize(9)
      .font("Helvetica")
      .fillColor(COLORS.muted)
      .text(`Prepared for ${user.display_name}  ·  Generated ${new Date().toDateString()}`);
    doc.moveDown(1);
    doc.strokeColor(COLORS.line).lineWidth(1).moveTo(PAGE_MARGIN, doc.y).lineTo(PAGE_MARGIN + CONTENT_WIDTH, doc.y).stroke();
    doc.moveDown(1);

    // Overview
    doc.fillColor(COLORS.ink).fontSize(14).font("Helvetica-Bold").text("Overview");
    doc.moveDown(0.3);
    doc
      .fontSize(10)
      .font("Helvetica")
      .fillColor(COLORS.muted)
      .text(
        `${scans.length} scan${scans.length === 1 ? "" : "s"} recorded from ${new Date(
          scans[0].captured_at
        ).toDateString()} to ${new Date(scans[scans.length - 1].captured_at).toDateString()}.`
      );
    doc.moveDown(1);

    // AI progress summary (if available)
    if (latestSummary) {
      doc.fillColor(COLORS.ink).fontSize(14).font("Helvetica-Bold").text("AI-Generated Progress Summary");
      doc.moveDown(0.3);

      let summaryContent = latestSummary.summary_text;
      try {
        const parsed = JSON.parse(latestSummary.summary_text);
        if (parsed && typeof parsed === "object") {
          const parts: string[] = [];
          if (parsed.headline) parts.push(parsed.headline);
          if (parsed.scoreChange) parts.push(parsed.scoreChange);
          if (parsed.biggestImprovements && Array.isArray(parsed.biggestImprovements) && parsed.biggestImprovements.length > 0) {
            parts.push(`Biggest Improvements: ${parsed.biggestImprovements.join(" · ")}`);
          }
          if (parsed.whatChanged) parts.push(`What Changed: ${parsed.whatChanged}`);
          if (parsed.focusNext) parts.push(`Focus Next: ${parsed.focusNext}`);
          if (parts.length > 0) {
            summaryContent = parts.join("\n\n");
          }
        }
      } catch {
        // use raw text
      }

      doc.fontSize(10).font("Helvetica").fillColor(COLORS.muted).text(summaryContent, {
        width: CONTENT_WIDTH,
      });
      doc.moveDown(0.3);
      doc
        .fontSize(8)
        .font("Helvetica-Oblique")
        .fillColor(COLORS.line)
        .text("Generated from measured scan history only. Not a medical diagnosis.");
      doc.moveDown(1);
    }

    // Scan history — one bordered card per scan, photo + metrics side by side
    doc.fillColor(COLORS.ink).fontSize(14).font("Helvetica-Bold").text("Scan History");
    doc.moveDown(0.4);

    scans.forEach((scan, index) => {
      // Fixed-height row, decided before drawing, so we never split a
      // card across a page break mid-way through.
      if (doc.y + SCAN_ROW_HEIGHT > doc.page.height - PAGE_MARGIN) {
        doc.addPage();
      }

      const rowTop = doc.y;
      const imageX = PAGE_MARGIN + 12;
      const imageY = rowTop + 12;
      const textX = imageX + SCAN_IMAGE_SIZE + 18;
      const textWidth = CONTENT_WIDTH - (textX - PAGE_MARGIN) - 12;

      // Card outline
      doc
        .roundedRect(PAGE_MARGIN, rowTop, CONTENT_WIDTH, SCAN_ROW_HEIGHT - 12, 6)
        .fillColor(COLORS.accentSoft)
        .fillOpacity(0.35)
        .fill();
      doc.fillOpacity(1);
      doc
        .roundedRect(PAGE_MARGIN, rowTop, CONTENT_WIDTH, SCAN_ROW_HEIGHT - 12, 6)
        .strokeColor(COLORS.line)
        .lineWidth(1)
        .stroke();

      // Photo, fixed square box, aspect-ratio preserved (never stretched)
      const imageBuffer = scanImages[index];
      if (imageBuffer) {
        try {
          doc.image(imageBuffer, imageX, imageY, {
            fit: [SCAN_IMAGE_SIZE, SCAN_IMAGE_SIZE],
            align: "center",
            valign: "center",
          });
        } catch (error) {
          logger.warn("Failed to embed scan image in PDF", { scanId: scan.id, error: (error as Error).message });
        }
      } else {
        doc
          .roundedRect(imageX, imageY, SCAN_IMAGE_SIZE, SCAN_IMAGE_SIZE, 4)
          .strokeColor(COLORS.line)
          .stroke();
        doc
          .fontSize(7)
          .font("Helvetica")
          .fillColor(COLORS.muted)
          .text("No image", imageX, imageY + SCAN_IMAGE_SIZE / 2 - 4, { width: SCAN_IMAGE_SIZE, align: "center" });
      }

      // Scan label + score
      doc
        .fontSize(11)
        .font("Helvetica-Bold")
        .fillColor(COLORS.accent)
        .text(`Scan ${index + 1} — ${new Date(scan.captured_at).toDateString()}`, textX, imageY, {
          width: textWidth,
        });
      doc
        .fontSize(9)
        .font("Helvetica")
        .fillColor(COLORS.muted)
        .text(`Overall score: ${scan.overall_score ?? "n/a"} / 100`, textX, doc.y + 2, { width: textWidth });

      // Metrics, wrapped within the remaining card width
      const metrics = JSON.parse(scan.metrics_json) as Record<string, number>;
      const metricStr = Object.entries(metrics)
        .map(([key, value]) => `${SKIN_METRIC_LABELS[key as keyof typeof SKIN_METRIC_LABELS] ?? key}: ${value}`)
        .join("   ");

      doc.fontSize(8.5).font("Helvetica").fillColor(COLORS.ink).text(metricStr, textX, doc.y + 6, {
        width: textWidth,
      });

      doc.y = rowTop + SCAN_ROW_HEIGHT;
    });

    // Milestones
    if (milestones.length > 0) {
      doc.addPage();
      doc.fillColor(COLORS.ink).fontSize(14).font("Helvetica-Bold").text("Milestones");
      doc.moveDown(0.4);
      milestones.forEach((m) => {
        doc
          .fontSize(10)
          .font("Helvetica-Bold")
          .fillColor(COLORS.accent)
          .text(`${new Date(m.occurred_at).toDateString()} — ${m.title}`);
        if (m.description) {
          doc.fontSize(9).font("Helvetica").fillColor(COLORS.muted).text(m.description, { width: CONTENT_WIDTH });
        }
        doc.moveDown(0.4);
      });
    }

    // Journal
    if (journalEntries.length > 0) {
      doc.addPage();
      doc.fillColor(COLORS.ink).fontSize(14).font("Helvetica-Bold").text("Routine & Journal Notes");
      doc.moveDown(0.4);
      journalEntries.forEach((entry) => {
        const products = entry.products_used ? JSON.parse(entry.products_used) : [];
        doc.fontSize(10).font("Helvetica-Bold").fillColor(COLORS.accent).text(new Date(entry.entry_date).toDateString());
        if (products.length) {
          doc.fontSize(9).font("Helvetica").fillColor(COLORS.muted).text(`Products: ${products.join(", ")}`);
        }
        if (entry.notes) {
          doc.fontSize(9).font("Helvetica").fillColor(COLORS.muted).text(`Notes: ${entry.notes}`, { width: CONTENT_WIDTH });
        }
        doc.moveDown(0.5);
        if (doc.y > doc.page.height - PAGE_MARGIN - 40) doc.addPage();
      });
    }

    doc.end();
    return stream;
  },
};
