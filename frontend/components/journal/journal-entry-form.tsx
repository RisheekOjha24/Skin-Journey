"use client";
import * as React from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { JOURNAL_FIELD_LABELS, JOURNAL_PLACEHOLDERS } from "@/config/journal.config";
import { JournalEntryInput } from "@/services/journal.service";
import { Plus } from "lucide-react";

interface JournalEntryFormProps {
  onSubmit: (input: JournalEntryInput) => Promise<unknown>;
}

export function JournalEntryForm({ onSubmit }: JournalEntryFormProps) {
  const [open, setOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [productsUsed, setProductsUsed] = React.useState("");
  const [routineMorning, setRoutineMorning] = React.useState("");
  const [routineEvening, setRoutineEvening] = React.useState("");
  const [sleepHours, setSleepHours] = React.useState("");
  const [waterIntake, setWaterIntake] = React.useState("");
  const [dietNotes, setDietNotes] = React.useState("");
  const [notes, setNotes] = React.useState("");

  const reset = () => {
    setProductsUsed("");
    setRoutineMorning("");
    setRoutineEvening("");
    setSleepHours("");
    setWaterIntake("");
    setDietNotes("");
    setNotes("");
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onSubmit({
        productsUsed: productsUsed
          .split(",")
          .map((p) => p.trim())
          .filter(Boolean),
        routineMorning: routineMorning || undefined,
        routineEvening: routineEvening || undefined,
        sleepHours: sleepHours ? Number(sleepHours) : undefined,
        waterIntakeLiters: waterIntake ? Number(waterIntake) : undefined,
        dietNotes: dietNotes || undefined,
        notes: notes || undefined,
      });
      reset();
      setOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" /> Add entry
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New journal entry</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="productsUsed">{JOURNAL_FIELD_LABELS.productsUsed}</Label>
            <Input
              id="productsUsed"
              value={productsUsed}
              onChange={(e) => setProductsUsed(e.target.value)}
              placeholder={JOURNAL_PLACEHOLDERS.productsUsed}
              className="mt-1.5"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="sleepHours">{JOURNAL_FIELD_LABELS.sleepHours}</Label>
              <Input
                id="sleepHours"
                type="number"
                step="0.5"
                min={0}
                max={24}
                value={sleepHours}
                onChange={(e) => setSleepHours(e.target.value)}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="waterIntake">{JOURNAL_FIELD_LABELS.waterIntakeLiters}</Label>
              <Input
                id="waterIntake"
                type="number"
                step="0.1"
                min={0}
                value={waterIntake}
                onChange={(e) => setWaterIntake(e.target.value)}
                className="mt-1.5"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="routineMorning">{JOURNAL_FIELD_LABELS.routineMorning}</Label>
            <Textarea
              id="routineMorning"
              value={routineMorning}
              onChange={(e) => setRoutineMorning(e.target.value)}
              placeholder={JOURNAL_PLACEHOLDERS.routineMorning}
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="routineEvening">{JOURNAL_FIELD_LABELS.routineEvening}</Label>
            <Textarea
              id="routineEvening"
              value={routineEvening}
              onChange={(e) => setRoutineEvening(e.target.value)}
              placeholder={JOURNAL_PLACEHOLDERS.routineEvening}
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="notes">{JOURNAL_FIELD_LABELS.notes}</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={JOURNAL_PLACEHOLDERS.notes}
              className="mt-1.5"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting} className="gap-2">
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Save entry
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
