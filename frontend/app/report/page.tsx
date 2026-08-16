"use client";
import * as React from "react";
import { format } from "date-fns";
import { Download, Loader2, Sparkles } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/common/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useSummary } from "@/hooks/use-summary";
import { useScans } from "@/hooks/use-scans";
import { reportService } from "@/services/report.service";
import { toast } from "sonner";

interface ParsedAiSummary {
  headline?: string;
  scoreChange?: string;
  biggestImprovements?: string[];
  whatChanged?: string;
  focusNext?: string;
}

function parseSummaryText(text: string): ParsedAiSummary | null {
  try {
    const cleaned = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
    const parsed = JSON.parse(cleaned);
    if (parsed && typeof parsed === "object") {
      return {
        headline: parsed.headline,
        scoreChange: parsed.scoreChange,
        biggestImprovements: Array.isArray(parsed.biggestImprovements) ? parsed.biggestImprovements : [],
        whatChanged: parsed.whatChanged,
        focusNext: parsed.focusNext,
      };
    }
  } catch {
    // fallback if legacy plain text
  }
  return null;
}

export default function ReportPage() {
  const { summary, isLoading, isGenerating, error, generate } = useSummary();
  const { scans } = useScans();
  const [isDownloading, setIsDownloading] = React.useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const blob = await reportService.downloadDermatologistReport();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "skin-journey-report.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not generate the report.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <AppShell>
      <PageHeader title="Report" description="An AI-generated summary of your measured trends, and a full dermatologist-ready PDF." />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="h-4 w-4 text-primary" />
              AI Progress Summary
            </CardTitle>
            <CardDescription>
              A concise, 5-second takeaway generated from your stored scan history — factual, clear, and actionable.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 flex-1 flex flex-col justify-between">
            {scans.length < 2 ? (
              <Alert>
                <AlertDescription>Add at least two scans before generating an AI summary.</AlertDescription>
              </Alert>
            ) : (
              <>
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                {summary ? (() => {
                  const parsed = parseSummaryText(summary.summaryText);
                  return (
                    <div className="space-y-4">
                      {parsed ? (
                        <div className="rounded-xl border border-primary/20 bg-gradient-to-b from-card via-card to-primary/[0.02] p-6 space-y-6 shadow-sm">
                          {/* Header Badge */}
                          <div className="flex items-center justify-between border-b border-border/50 pb-3.5">
                            <div className="flex items-center gap-2">
                              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary">
                                <Sparkles className="h-3.5 w-3.5" />
                              </div>
                              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                Executive Takeaway
                              </span>
                            </div>
                            <span className="text-[11px] font-medium uppercase tracking-wider text-primary bg-primary/10 px-2.5 py-0.5 rounded-full">
                              5-sec Summary
                            </span>
                          </div>

                          {/* Headline & Score change */}
                          <div className="space-y-1.5">
                            {parsed.headline && (
                              <h3 className="font-display text-2xl font-bold tracking-tight text-foreground">
                                {parsed.headline}
                              </h3>
                            )}
                            {parsed.scoreChange && (
                              <p className="text-sm font-medium text-muted-foreground leading-relaxed">
                                {parsed.scoreChange}
                              </p>
                            )}
                          </div>

                          {/* Vertical Sections Stack */}
                          <div className="space-y-5 pt-2">
                            {/* 1. Biggest improvements */}
                            {parsed.biggestImprovements && parsed.biggestImprovements.length > 0 && (
                              <div className="space-y-2 rounded-lg bg-emerald-500/[0.04] dark:bg-emerald-500/[0.08] border border-emerald-500/20 p-3.5">
                                <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                                  Biggest Improvements
                                </p>
                                <div className="flex flex-wrap items-center gap-2">
                                  {parsed.biggestImprovements.map((imp, idx) => (
                                    <span
                                      key={idx}
                                      className="inline-flex items-center rounded-md bg-card border border-emerald-500/30 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300 shadow-2xs"
                                    >
                                      {imp}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* 2. What changed */}
                            {parsed.whatChanged && (
                              <div className="space-y-1.5 border-l-2 border-primary/50 pl-4 py-0.5">
                                <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                                  What Changed
                                </p>
                                <p className="text-sm text-foreground/90 leading-relaxed">
                                  {parsed.whatChanged}
                                </p>
                              </div>
                            )}

                            {/* 3. Focus next */}
                            {parsed.focusNext && (
                              <div className="space-y-1.5 rounded-lg bg-accent/40 border border-border/60 p-3.5">
                                <p className="text-[11px] font-bold uppercase tracking-wider text-primary">
                                  Focus Next
                                </p>
                                <p className="text-sm text-foreground/90 leading-relaxed font-normal">
                                  {parsed.focusNext}
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Footer Info */}
                          <div className="pt-3 border-t border-border/40 text-[11px] text-muted-foreground flex items-center justify-between">
                            <span>Based on {summary.scanCount} scans</span>
                            <span>Generated {format(new Date(summary.generatedAt), "MMM d, yyyy 'at' h:mm a")}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="rounded-md bg-accent-soft/50 p-4 text-sm leading-relaxed">
                          <p>{summary.summaryText}</p>
                          <p className="mt-3 text-xs text-muted-foreground">
                            Based on {summary.scanCount} scans · generated {format(new Date(summary.generatedAt), "MMM d, yyyy 'at' h:mm a")}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })() : null}
                <div>
                  <Button onClick={generate} disabled={isGenerating} className="gap-2 mt-2">
                    {isGenerating && <Loader2 className="h-4 w-4 animate-spin" />}
                    {summary ? "Regenerate summary" : "Generate summary"}
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Dermatologist Report</CardTitle>
            <CardDescription>
              A complete PDF with your scan history, overlays, comparisons, AI summary, and journal notes — ready to
              share with a professional.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {scans.length === 0 ? (
              <Alert>
                <AlertDescription>Add at least one scan before generating a report.</AlertDescription>
              </Alert>
            ) : (
              <Button onClick={handleDownload} disabled={isDownloading} className="gap-2">
                {isDownloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                Download PDF report
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
