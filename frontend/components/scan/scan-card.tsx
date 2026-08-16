"use client";
import * as React from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Scan } from "@/types";
import { SCAN_TYPE_LABELS } from "@/config/scan.config";
import { API_CONFIG } from "@/config/api.config";
import { ROUTES } from "@/config/routes.config";
import { cn, parseUTCDate } from "@/lib/utils";

interface ScanCardProps {
  scan: Scan;
  selected?: boolean;
  onSelectChange?: (selected: boolean) => void;
  onDeleteRequest?: () => void;
}

export function ScanCard({ scan, selected = false, onSelectChange, onDeleteRequest }: ScanCardProps) {
  return (
    <Card className={cn("group relative overflow-hidden transition-shadow hover:shadow-raised", selected && "ring-2 ring-primary")}>
      {onSelectChange && (
        <div className="absolute left-2 top-2 z-10">
          <Checkbox
            checked={selected}
            onCheckedChange={(v) => onSelectChange(Boolean(v))}
            onClick={(e) => e.stopPropagation()}
            className="h-5 w-5 border-white bg-card/90 shadow-soft data-[state=checked]:bg-primary"
            aria-label="Select scan"
          />
        </div>
      )}

      {onDeleteRequest && (
        <Button
          type="button"
          variant="secondary"
          size="icon"
          className="absolute right-2 top-2 z-10 h-7 w-7 opacity-0 shadow-soft transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onDeleteRequest();
          }}
          aria-label="Delete scan"
        >
          <Trash2 className="h-3.5 w-3.5 text-destructive" />
        </Button>
      )}

      <Link href={ROUTES.scanDetail(scan.id)}>
        <div className="aspect-square overflow-hidden bg-muted/40 flex items-center justify-center">
          <img
            src={`${API_CONFIG.baseUrl}${scan.imageUrl}`}
            alt="Skin scan"
            className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <Badge variant="secondary">{SCAN_TYPE_LABELS[scan.scanType]}</Badge>
            <span className="font-mono text-sm font-medium">{scan.overallScore ?? "—"}</span>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">{format(parseUTCDate(scan.capturedAt), "MMM d, yyyy · h:mm a")}</p>
        </CardContent>
      </Link>
    </Card>
  );
}
