"use client";
import * as React from "react";
import { Camera, ImagePlus, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SCAN_CAPTURE_TIPS, ScanType } from "@/config/scan.config";
import { cn } from "@/lib/utils";
import { validateScanImage } from "@/lib/image-validation";
import { toast } from "sonner";

import { ScanImageViewer } from "@/components/scan/scan-image-viewer";
import sampleImage from "@/assets/sample_image.png";
import Image from "next/image";

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
    if (!selected) {
      setFile(null);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
      return;
    }

    const validation = validateScanImage(selected);
    if (!validation.valid) {
      toast.error(validation.error);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
      return;
    }

    setFile(selected);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(selected));
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
            <ScanImageViewer
              src={previewUrl}
              alt="Scan preview"
              allowRemove
              isDisabled={isSubmitting}
              onRemove={() => handleFile(null)}
              title="Uploaded Scan Preview"
            />
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
              <span className="text-xs">JPG, JPEG, or PNG (max 10 MB)</span>
            </button>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png"
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

      <Card className="bg-accent-soft/40 flex flex-col justify-between">
        <CardContent className="p-6 flex flex-col justify-between h-full">
          <div>
            <h3 className="font-display text-base font-medium">For a comparable result</h3>
            <ul className="mt-3 space-y-3">
              {SCAN_CAPTURE_TIPS.map((tip) => (
                <li key={tip} className="flex gap-2.5 text-sm text-muted-foreground">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  {tip}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-6 pt-4 border-t border-border/60">
            <span className="block text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">
              Sample Photo Reference
            </span>
            <div className="relative aspect-[4/3] overflow-hidden rounded-lg border border-border/60 bg-background/50 shadow-sm">
              <Image
                src={sampleImage}
                alt="Sample scan reference"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

