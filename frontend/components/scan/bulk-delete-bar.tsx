"use client";
import * as React from "react";
import { Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BulkDeleteBarProps {
  selectedCount: number;
  onDelete: () => void;
  onClear: () => void;
}

export function BulkDeleteBar({ selectedCount, onDelete, onClear }: BulkDeleteBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed inset-x-0 bottom-6 z-40 flex justify-center px-4">
      <div className="flex items-center gap-3 rounded-pill border border-border bg-card px-4 py-2.5 shadow-raised animate-in fade-in-0 slide-in-from-bottom-2">
        <span className="text-sm font-medium">
          {selectedCount} scan{selectedCount === 1 ? "" : "s"} selected
        </span>
        <Button size="sm" variant="destructive" className="gap-1.5" onClick={onDelete}>
          <Trash2 className="h-3.5 w-3.5" />
          Delete
        </Button>
        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={onClear} aria-label="Clear selection">
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
