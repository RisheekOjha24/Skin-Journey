import * as React from "react";
import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  body: string;
  ctaLabel?: string;
  onCta?: () => void;
  className?: string;
}

export function EmptyState({ icon: Icon, title, body, ctaLabel, onCta, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center rounded-card border border-dashed border-border bg-card px-6 py-14 text-center", className)}>
      {Icon && (
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-accent-soft text-primary">
          <Icon className="h-6 w-6" />
        </div>
      )}
      <h3 className="font-display text-lg font-medium">{title}</h3>
      <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">{body}</p>
      {ctaLabel && onCta && (
        <Button className="mt-5" onClick={onCta}>
          {ctaLabel}
        </Button>
      )}
    </div>
  );
}
