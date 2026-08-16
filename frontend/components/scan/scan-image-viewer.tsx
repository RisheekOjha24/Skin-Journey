"use client";

import * as React from "react";
import { Maximize2, X, Frame, Expand } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ScanImageViewerProps {
  src: string;
  alt?: string;
  className?: string;
  allowRemove?: boolean;
  onRemove?: () => void;
  showControls?: boolean;
  title?: string;
  isDisabled?: boolean;
}

export function ScanImageViewer({
  src,
  alt = "Scan image",
  className,
  allowRemove = false,
  onRemove,
  showControls = true,
  title = "Scan Image View",
  isDisabled = false,
}: ScanImageViewerProps) {
  const [objectFit, setObjectFit] = React.useState<"contain" | "cover">("contain");
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [fullscreenFit, setFullscreenFit] = React.useState<"contain" | "cover">("contain");

  const toggleFit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setObjectFit((prev) => (prev === "contain" ? "cover" : "contain"));
  };

  const openFullscreen = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFullscreen(true);
  };

  return (
    <>
      <div
        className={cn(
          "group relative aspect-square w-full overflow-hidden rounded-md bg-muted/40 border border-border flex items-center justify-center transition-all",
          className
        )}
      >
        <img
          src={src}
          alt={alt}
          className={cn(
            "transition-all duration-300",
            objectFit === "contain"
              ? "max-h-full max-w-full object-contain"
              : "h-full w-full object-cover"
          )}
        />

        {showControls && (
          <div className="absolute right-3 top-3 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            {/* View Mode Toggle (Fit vs Fill) */}
            <button
              type="button"
              onClick={toggleFit}
              title={objectFit === "contain" ? "Fill frame (Crop to fit)" : "Fit complete (Show full image)"}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-black/75 text-white ring-1 ring-white/20 shadow-md backdrop-blur-md transition-all hover:bg-black hover:scale-105 active:scale-95"
              aria-label={objectFit === "contain" ? "Fill frame" : "Fit complete"}
            >
              {objectFit === "contain" ? (
                <Expand className="h-3.5 w-3.5 stroke-[2.5]" />
              ) : (
                <Frame className="h-3.5 w-3.5 stroke-[2.5]" />
              )}
            </button>

            {/* Fullscreen Maximize */}
            <button
              type="button"
              onClick={openFullscreen}
              title="Maximize / Fullscreen"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-black/75 text-white ring-1 ring-white/20 shadow-md backdrop-blur-md transition-all hover:bg-black hover:scale-105 active:scale-95"
              aria-label="Maximize image"
            >
              <Maximize2 className="h-3.5 w-3.5 stroke-[2.5]" />
            </button>

            {/* Optional Remove button (for upload preview) */}
            {allowRemove && onRemove && (
              <button
                type="button"
                disabled={isDisabled}
                onClick={(e) => {
                  if (isDisabled) return;
                  e.stopPropagation();
                  onRemove();
                }}
                title={isDisabled ? "Cannot remove while analysis is in progress" : "Remove photo"}
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full bg-destructive/80 text-destructive-foreground ring-1 ring-white/20 shadow-md backdrop-blur-md transition-all",
                  isDisabled
                    ? "opacity-50 cursor-not-allowed pointer-events-none"
                    : "hover:bg-destructive hover:scale-105 active:scale-95"
                )}
                aria-label="Remove photo"
              >
                <X className="h-4 w-4 stroke-[2.5]" />
              </button>
            )}
          </div>
        )}

        {/* Subtle view indicator tag on bottom-left hover */}
        {showControls && (
          <div className="absolute bottom-2 left-2 rounded bg-black/60 px-2 py-0.5 text-[10px] font-medium text-white/90 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            {objectFit === "contain" ? "Fit (Complete)" : "Fill (Cover)"}
          </div>
        )}
      </div>

      {/* Fullscreen Lightbox Modal */}
      <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
        <DialogContent className="max-w-6xl w-[94vw] h-[90vh] max-h-[90vh] p-4 bg-slate-950/95 border-slate-800 text-slate-100 flex flex-col justify-between overflow-hidden backdrop-blur-xl">
          <DialogTitle className="sr-only">{title}</DialogTitle>
          <DialogDescription className="sr-only">Full screen expanded view of skin scan</DialogDescription>
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 pl-2 pr-12">
            <span className="text-sm font-medium tracking-wide text-slate-300">{title}</span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1.5 border-slate-700 bg-slate-900/80 text-xs text-slate-200 hover:bg-slate-800 hover:text-white"
                onClick={() => setFullscreenFit((prev) => (prev === "contain" ? "cover" : "contain"))}
              >
                {fullscreenFit === "contain" ? (
                  <>
                    <Expand className="h-3.5 w-3.5" /> Fill Frame
                  </>
                ) : (
                  <>
                    <Frame className="h-3.5 w-3.5" /> Fit Complete
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="relative flex-1 w-full h-full my-2 overflow-hidden flex items-center justify-center bg-black/40 rounded-lg border border-slate-800/60">
            <img
              src={src}
              alt={alt}
              className={cn(
                "transition-all duration-200",
                fullscreenFit === "contain"
                  ? "max-h-full max-w-full object-contain"
                  : "w-full h-full object-cover"
              )}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
