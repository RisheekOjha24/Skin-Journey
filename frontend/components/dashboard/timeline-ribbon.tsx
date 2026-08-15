"use client";
import * as React from "react";
import { format } from "date-fns";
import { MILESTONE_CATEGORY_COLORS, MILESTONE_CATEGORY_LABELS } from "@/config/milestones.config";
import { Milestone } from "@/types";

interface TimelineRibbonProps {
  scoreHistory: { date: string; score: number; scanId: string }[];
  milestones: Milestone[];
}

const WIDTH = 960;
const HEIGHT = 180;
const PADDING_X = 32;
const PADDING_Y = 36;

function buildSmoothPath(points: { x: number; y: number }[]): string {
  if (points.length === 0) return "";
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i];
    const p1 = points[i + 1];
    const midX = (p0.x + p1.x) / 2;
    d += ` C ${midX} ${p0.y}, ${midX} ${p1.y}, ${p1.x} ${p1.y}`;
  }
  return d;
}

/**
 * The product's signature visual: scans are plotted as nodes on a
 * continuous "lab timeline" ribbon (score = height), with milestones
 * shown as flags along the same axis — so a routine change and its
 * measured effect sit in the same visual line, not two separate charts.
 */
export function TimelineRibbon({ scoreHistory, milestones }: TimelineRibbonProps) {
  if (scoreHistory.length === 0) {
    return (
      <div className="flex h-44 items-center justify-center rounded-card border border-dashed border-border text-sm text-muted-foreground">
        Your timeline will appear here after your first scan.
      </div>
    );
  }

  const dates = scoreHistory.map((s) => new Date(s.date).getTime());
  const minDate = Math.min(...dates, ...milestones.map((m) => new Date(m.occurredAt).getTime()));
  const maxDate = Math.max(...dates, ...milestones.map((m) => new Date(m.occurredAt).getTime()));
  const dateRange = Math.max(maxDate - minDate, 1);

  const xScale = (date: number) =>
    PADDING_X + ((date - minDate) / dateRange) * (WIDTH - PADDING_X * 2);
  const yScale = (score: number) =>
    HEIGHT - PADDING_Y - (score / 100) * (HEIGHT - PADDING_Y * 2);

  const points = scoreHistory.map((s) => ({
    x: xScale(new Date(s.date).getTime()),
    y: yScale(s.score),
    ...s,
  }));

  const path = buildSmoothPath(points);
  const areaPath = `${path} L ${points[points.length - 1].x} ${HEIGHT - 8} L ${points[0].x} ${HEIGHT - 8} Z`;

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full min-w-[640px]" role="img" aria-label="Skin score timeline">
        <defs>
          <linearGradient id="ribbonFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.16} />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
          </linearGradient>
        </defs>

        {/* Baseline grid */}
        {[0, 25, 50, 75, 100].map((tick) => (
          <line
            key={tick}
            x1={PADDING_X}
            x2={WIDTH - PADDING_X}
            y1={yScale(tick)}
            y2={yScale(tick)}
            stroke="hsl(var(--border))"
            strokeDasharray="2 4"
            strokeWidth={1}
          />
        ))}

        <path d={areaPath} fill="url(#ribbonFill)" />
        <path d={path} fill="none" stroke="hsl(var(--primary))" strokeWidth={2.5} strokeLinecap="round" />

        {points.map((p, idx) => {
          // Adjust label position to avoid overlap when points are close horizontally
          const prevP = points[idx - 1];
          const nextP = points[idx + 1];
          const isCloseToPrev = prevP && Math.abs(p.x - prevP.x) < 32;
          const isCloseToNext = nextP && Math.abs(p.x - nextP.x) < 32;
          
          let yOffset = -12; // default position above node
          if (isCloseToPrev || isCloseToNext) {
            // Alternate label offset or place below node if Y position is high
            if (idx % 2 === 1) {
              yOffset = p.y < 35 ? 20 : -22;
            } else {
              yOffset = p.y > HEIGHT - 55 ? -14 : 20;
            }
          }

          return (
            <g key={p.scanId}>
              <circle cx={p.x} cy={p.y} r={5} fill="hsl(var(--card))" stroke="hsl(var(--primary))" strokeWidth={2.5} />
              <text
                x={p.x}
                y={p.y + yOffset}
                textAnchor="middle"
                className="fill-foreground font-mono"
                fontSize={10}
                fontWeight={500}
              >
                {p.score}
              </text>
            </g>
          );
        })}

        {/* Milestone flags along the bottom axis */}
        {milestones.map((m) => {
          const x = xScale(new Date(m.occurredAt).getTime());
          const color = MILESTONE_CATEGORY_COLORS[m.category];
          return (
            <g key={m.id}>
              <line x1={x} x2={x} y1={HEIGHT - PADDING_Y + 6} y2={HEIGHT - 10} stroke={color} strokeWidth={2} />
              <circle cx={x} cy={HEIGHT - 8} r={3.5} fill={color} />
              <title>{`${MILESTONE_CATEGORY_LABELS[m.category]}: ${m.title} — ${format(new Date(m.occurredAt), "MMM d, yyyy")}`}</title>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
