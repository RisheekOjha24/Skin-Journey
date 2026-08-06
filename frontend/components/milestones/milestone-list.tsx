import * as React from "react";
import { format } from "date-fns";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Milestone } from "@/types";
import { MILESTONE_CATEGORY_LABELS } from "@/config/milestones.config";

export function MilestoneList({ milestones, onDelete }: { milestones: Milestone[]; onDelete: (id: string) => void }) {
  return (
    <div className="space-y-3">
      {milestones
        .slice()
        .reverse()
        .map((m) => (
          <div key={m.id} className="flex items-start justify-between rounded-md border border-border bg-card p-4">
            <div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{MILESTONE_CATEGORY_LABELS[m.category]}</Badge>
                <span className="text-xs text-muted-foreground">{format(new Date(m.occurredAt), "MMM d, yyyy")}</span>
              </div>
              <p className="mt-1.5 text-sm font-medium">{m.title}</p>
              {m.description && <p className="mt-0.5 text-sm text-muted-foreground">{m.description}</p>}
            </div>
            <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive" onClick={() => onDelete(m.id)}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        ))}
    </div>
  );
}
