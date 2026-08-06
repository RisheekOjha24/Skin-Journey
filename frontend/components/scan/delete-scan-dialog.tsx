"use client";
import * as React from "react";
import { Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { SCAN_DELETE_COPY } from "@/config/scan.config";

interface DeleteScanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  count: number;
  isDeleting: boolean;
  onConfirm: () => void;
}

/**
 * Shared confirmation dialog for both single-scan and bulk-scan
 * deletion. Controlled by the parent (rather than owning its own
 * trigger) so it can be opened from a hover action, a detail-page
 * button, or a bulk-selection bar with the same component.
 */
export function DeleteScanDialog({ open, onOpenChange, count, isDeleting, onConfirm }: DeleteScanDialogProps) {
  const copy = count === 1 ? SCAN_DELETE_COPY.single : SCAN_DELETE_COPY.bulk(count);

  return (
    <AlertDialog open={open} onOpenChange={(next) => !isDeleting && onOpenChange(next)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{copy.title}</AlertDialogTitle>
          <AlertDialogDescription>{copy.description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            disabled={isDeleting}
            className="gap-2"
          >
            {isDeleting && <Loader2 className="h-4 w-4 animate-spin" />}
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
