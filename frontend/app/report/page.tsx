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
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="h-4 w-4 text-primary" />
              AI Progress Summary
            </CardTitle>
            <CardDescription>
              Generated only from your stored scan history — every sentence restates a measured trend, never a
              prediction or medical claim.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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
                {summary ? (
                  <div className="rounded-md bg-accent-soft/50 p-4 text-sm leading-relaxed">
                    <p>{summary.summaryText}</p>
                    <p className="mt-3 text-xs text-muted-foreground">
                      Based on {summary.scanCount} scans · generated {format(new Date(summary.generatedAt), "MMM d, yyyy 'at' h:mm a")}
                    </p>
                  </div>
                ) : (
                  !isLoading && <p className="text-sm text-muted-foreground">No summary generated yet.</p>
                )}
                <Button onClick={generate} disabled={isGenerating} className="gap-2">
                  {isGenerating && <Loader2 className="h-4 w-4 animate-spin" />}
                  {summary ? "Regenerate summary" : "Generate summary"}
                </Button>
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
