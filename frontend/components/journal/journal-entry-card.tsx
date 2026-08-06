import * as React from "react";
import { format } from "date-fns";
import { Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { JournalEntry } from "@/types";

export function JournalEntryCard({ entry, onDelete }: { entry: JournalEntry; onDelete: (id: string) => void }) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <p className="text-sm font-medium">{format(new Date(entry.entryDate), "EEEE, MMM d, yyyy")}</p>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => onDelete(entry.id)}>
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
          {entry.waterIntakeLiters !== null && <p>Water: {entry.waterIntakeLiters}L</p>}
        </div>

        {entry.routineMorning && <p className="mt-2 text-sm"><span className="font-medium">Morning: </span>{entry.routineMorning}</p>}
        {entry.routineEvening && <p className="mt-1 text-sm"><span className="font-medium">Evening: </span>{entry.routineEvening}</p>}
        {entry.notes && <p className="mt-2 text-sm text-muted-foreground">{entry.notes}</p>}
      </CardContent>
    </Card>
  );
}
