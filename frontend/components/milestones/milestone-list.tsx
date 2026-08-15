import * as React from "react";
import { format } from "date-fns";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Milestone } from "@/types";
import { MILESTONE_CATEGORY_LABELS } from "@/config/milestones.config";
import { parseUTCDate } from "@/lib/utils";

interface MilestoneListProps {
  milestones: Milestone[];
  onDelete: (id: string) => void;
  selectedIds?: Set<string>;
  onSelectChange?: (id: string, selected: boolean) => void;
}

export function MilestoneList({ milestones, onDelete, selectedIds, onSelectChange }: MilestoneListProps) {
  return (
    <div className="space-y-3 pb-20">
      {milestones
        .slice()
        .reverse()
        .map((m) => {
          const isSelected = selectedIds?.has(m.id) ?? false;
          return (
            <div
              key={m.id}
              className={`group flex items-start justify-between rounded-md border bg-card p-4 transition-shadow hover:shadow-raised ${
                isSelected ? "border-primary ring-2 ring-primary" : "border-border"
              }`}
            >
              <div className="flex items-start gap-3 min-w-0">
                {onSelectChange && (
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={(v) => onSelectChange(m.id, Boolean(v))}
                    className="mt-0.5 h-5 w-5 shrink-0 data-[state=checked]:bg-primary"
                    aria-label="Select milestone"
                  />
                )}
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{MILESTONE_CATEGORY_LABELS[m.category]}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {format(parseUTCDate(m.occurredAt), "MMM d, yyyy")}
                    </span>
                  </div>
                  <p className="mt-1.5 text-sm font-medium">{m.title}</p>
                  {m.description && <p className="mt-0.5 text-sm text-muted-foreground">{m.description}</p>}
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 shrink-0 text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100 focus-visible:opacity-100"
                onClick={() => onDelete(m.id)}
                aria-label="Delete milestone"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          );
        })}
    </div>
  );
}
