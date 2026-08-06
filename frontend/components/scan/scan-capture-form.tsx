"use client";
import * as React from "react";
import { Camera, ImagePlus, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SCAN_CAPTURE_TIPS, ScanType } from "@/config/scan.config";
import { cn } from "@/lib/utils";

interface ScanCaptureFormProps {
  scanType: ScanType;
  isSubmitting: boolean;
  onSubmit: (file: File) => void;
}

export function ScanCaptureForm({ scanType, isSubmitting, onSubmit }: ScanCaptureFormProps) {
  const [file, setFile] = React.useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleFile = (selected: File | null) => {
    setFile(selected);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(selected ? URL.createObjectURL(selected) : null);
  };

  React.useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="grid gap-6 md:grid-cols-[1.1fr_0.9fr]">
      <Card>
        <CardContent className="p-6">
          {previewUrl ? (
            <div className="relative">
              <img src={previewUrl} alt="Scan preview" className="aspect-square w-full rounded-md object-cover" />
              <button
                type="button"
                onClick={() => handleFile(null)}
                className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-ink/60 text-white backdrop-blur-sm hover:bg-ink/80"
                aria-label="Remove photo"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className={cn(
                "flex aspect-square w-full flex-col items-center justify-center gap-3 rounded-md border-2 border-dashed border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
              )}
            >
              <ImagePlus className="h-10 w-10" />
              <span className="text-sm font-medium">Click to add a photo</span>
              <span className="text-xs">JPEG, PNG, or WEBP</span>
            </button>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
          />

          <Button
            className="mt-4 w-full gap-2"
            disabled={!file || isSubmitting}
            onClick={() => file && onSubmit(file)}
          >
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
            {isSubmitting ? "Analyzing your scan..." : "Analyze scan"}
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-accent-soft/40">
        <CardContent className="p-6">
          <h3 className="font-display text-base font-medium">For a comparable result</h3>
          <ul className="mt-3 space-y-3">
            {SCAN_CAPTURE_TIPS.map((tip) => (
              <li key={tip} className="flex gap-2.5 text-sm text-muted-foreground">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                {tip}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
