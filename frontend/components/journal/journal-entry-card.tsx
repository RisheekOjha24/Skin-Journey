import * as React from "react";
import { format } from "date-fns";
import { Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { JournalEntry } from "@/types";
import { parseUTCDate } from "@/lib/utils";

interface JournalEntryCardProps {
  entry: JournalEntry;
  selected?: boolean;
  onSelectChange?: (selected: boolean) => void;
  onDelete: (id: string) => void;
}

export function JournalEntryCard({
  entry,
  selected = false,
  onSelectChange,
  onDelete,
}: JournalEntryCardProps) {
  return (
    <Card
      className={`group relative transition-shadow hover:shadow-raised ${selected ? "ring-2 ring-primary" : ""}`}
    >
      <CardContent className="p-5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            {onSelectChange && (
              <Checkbox
                checked={selected}
                onCheckedChange={(v) => onSelectChange(Boolean(v))}
                onClick={(e) => e.stopPropagation()}
                className="h-5 w-5 border-2 border-primary/60 bg-background shadow-sm data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                aria-label="Select entry"
              />
            )}
            <p className="text-sm font-medium">
              {format(parseUTCDate(entry.entryDate), "EEEE, MMM d, yyyy")}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0 text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100 focus-visible:opacity-100"
            onClick={() => onDelete(entry.id)}
            aria-label="Delete entry"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>

        {entry.productsUsed.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {entry.productsUsed.map((p) => (
              <Badge key={p} variant="outline">
                {p}
              </Badge>
            ))}
          </div>
        )}

        <div className="mt-3 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
          {entry.sleepHours !== null && <p>Sleep: {entry.sleepHours}h</p>}
          {entry.waterIntakeLiters !== null && (
            <p>Water: {entry.waterIntakeLiters}L</p>
          )}
        </div>

        {entry.routineMorning && (
          <p className="mt-2 text-sm">
            <span className="font-medium">Morning: </span>
            {entry.routineMorning}
          </p>
        )}
        {entry.routineEvening && (
          <p className="mt-1 text-sm">
            <span className="font-medium">Evening: </span>
            {entry.routineEvening}
          </p>
        )}
        {entry.notes && (
          <p className="mt-2 text-sm text-muted-foreground">{entry.notes}</p>
        )}
      </CardContent>
    </Card>
  );
}
