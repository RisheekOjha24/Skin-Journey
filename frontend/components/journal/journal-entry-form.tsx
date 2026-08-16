"use client";
import * as React from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  JOURNAL_FIELD_LABELS,
  JOURNAL_PLACEHOLDERS,
} from "@/config/journal.config";
import { JournalEntryInput } from "@/services/journal.service";
import { ApiClientError } from "@/lib/api-client";
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
  const [fieldErrors, setFieldErrors] = React.useState<
    Record<string, string | null>
  >({});
  const [formError, setFormError] = React.useState<string | null>(null);

  const reset = () => {
    setProductsUsed("");
    setRoutineMorning("");
    setRoutineEvening("");
    setSleepHours("");
    setWaterIntake("");
    setDietNotes("");
    setNotes("");
    setFieldErrors({});
    setFormError(null);
  };

  const containerRef = React.useRef<HTMLDivElement>(null);

  const scrollToFirstError = (errors: Record<string, string | null>, mainError?: string | null) => {
    setTimeout(() => {
      if (mainError && containerRef.current) {
        containerRef.current.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }

      const errorFieldKeys = Object.keys(errors).filter((k) => Boolean(errors[k]));
      if (errorFieldKeys.length === 0) return;

      const firstKey = errorFieldKeys[0];
      const targetId = firstKey === "waterIntakeLiters" ? "waterIntake" : firstKey;
      const element = document.getElementById(targetId);

      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
        element.focus({ preventScroll: true });
      }
    }, 50);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setFieldErrors({});
    setFormError(null);

    const errors: Record<string, string> = {};
    if (sleepHours !== "") {
      const num = Number(sleepHours);
      if (isNaN(num) || num < 0 || num > 24) {
        errors.sleepHours = "Sleep hours must be between 0 and 24.";
      }
    }
    if (waterIntake !== "") {
      const num = Number(waterIntake);
      if (isNaN(num) || num < 0 || num > 20) {
        errors.waterIntakeLiters = "Water intake must be between 0 and 20 liters.";
      }
    }
    if (routineMorning.length > 2000) {
      errors.routineMorning = "Morning routine must not exceed 2000 characters.";
    }
    if (routineEvening.length > 2000) {
      errors.routineEvening = "Evening routine must not exceed 2000 characters.";
    }
    if (dietNotes.length > 2000) {
      errors.dietNotes = "Diet notes must not exceed 2000 characters.";
    }
    if (notes.length > 4000) {
      errors.notes = "Notes must not exceed 4000 characters.";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      scrollToFirstError(errors);
      setIsSubmitting(false);
      return;
    }

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
    } catch (err) {
      if (
        err instanceof ApiClientError &&
        err.code === "VALIDATION_ERROR" &&
        err.details
      ) {
        const details = err.details as Record<string, any>;
        const mapped: Record<string, string | null> = {};

        const targetObj = details.body || details;
        if (targetObj && typeof targetObj === "object") {
          Object.entries(targetObj).forEach(([key, val]) => {
            if (Array.isArray(val)) mapped[key] = val.join(" ");
            else if (typeof val === "string") mapped[key] = val;
          });
        }
        if (Object.keys(mapped).length > 0) {
          setFieldErrors(mapped);
          scrollToFirstError(mapped);
        } else {
          setFormError(err.message);
          scrollToFirstError({}, err.message);
        }
      } else {
        const msg = err instanceof Error ? err.message : "Failed to save entry";
        setFormError(msg);
        scrollToFirstError({}, msg);
      }
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
      <DialogContent ref={containerRef} className="max-h-[85vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New journal entry</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {formError && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm font-medium text-destructive">
              {formError}
            </div>
          )}
          <div>
            <Label htmlFor="productsUsed">
              {JOURNAL_FIELD_LABELS.productsUsed}
            </Label>
            <Input
              id="productsUsed"
              value={productsUsed}
              onChange={(e) => {
                setProductsUsed(e.target.value);
                setFieldErrors((f) => ({ ...f, productsUsed: null }));
              }}
              placeholder={JOURNAL_PLACEHOLDERS.productsUsed}
              className="mt-1.5"
            />
            {fieldErrors.productsUsed && (
              <p className="mt-1 text-sm text-destructive">
                {fieldErrors.productsUsed}
              </p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="sleepHours">
                {JOURNAL_FIELD_LABELS.sleepHours}
              </Label>
              <Input
                id="sleepHours"
                type="number"
                step="0.5"
                min={0}
                max={24}
                value={sleepHours}
                onChange={(e) => {
                  setSleepHours(e.target.value);
                  setFieldErrors((f) => ({ ...f, sleepHours: null }));
                }}
                className="mt-1.5"
              />
              {fieldErrors.sleepHours && (
                <p className="mt-1 text-sm text-destructive">
                  {fieldErrors.sleepHours}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="waterIntake">
                {JOURNAL_FIELD_LABELS.waterIntakeLiters}
              </Label>
              <Input
                id="waterIntake"
                type="number"
                step="0.1"
                min={0}
                value={waterIntake}
                onChange={(e) => {
                  setWaterIntake(e.target.value);
                  setFieldErrors((f) => ({ ...f, waterIntakeLiters: null, waterIntake: null }));
                }}
                className="mt-1.5"
              />
              {fieldErrors.waterIntakeLiters && (
                <p className="mt-1 text-sm text-destructive">
                  {fieldErrors.waterIntakeLiters}
                </p>
              )}
            </div>
          </div>
          <div>
            <Label htmlFor="routineMorning">
              {JOURNAL_FIELD_LABELS.routineMorning}
            </Label>
            <Textarea
              id="routineMorning"
              value={routineMorning}
              onChange={(e) => {
                setRoutineMorning(e.target.value);
                setFieldErrors((f) => ({ ...f, routineMorning: null }));
              }}
              placeholder={JOURNAL_PLACEHOLDERS.routineMorning}
              className="mt-1.5"
            />
            {fieldErrors.routineMorning && (
              <p className="mt-1 text-sm text-destructive">
                {fieldErrors.routineMorning}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="routineEvening">
              {JOURNAL_FIELD_LABELS.routineEvening}
            </Label>
            <Textarea
              id="routineEvening"
              value={routineEvening}
              onChange={(e) => {
                setRoutineEvening(e.target.value);
                setFieldErrors((f) => ({ ...f, routineEvening: null }));
              }}
              placeholder={JOURNAL_PLACEHOLDERS.routineEvening}
              className="mt-1.5"
            />
            {fieldErrors.routineEvening && (
              <p className="mt-1 text-sm text-destructive">
                {fieldErrors.routineEvening}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="dietNotes">{JOURNAL_FIELD_LABELS.dietNotes}</Label>
            <Textarea
              id="dietNotes"
              value={dietNotes}
              onChange={(e) => {
                setDietNotes(e.target.value);
                setFieldErrors((f) => ({ ...f, dietNotes: null }));
              }}
              placeholder={JOURNAL_PLACEHOLDERS.dietNotes}
              className="mt-1.5"
            />
            {fieldErrors.dietNotes && (
              <p className="mt-1 text-sm text-destructive">
                {fieldErrors.dietNotes}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="notes">{JOURNAL_FIELD_LABELS.notes}</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => {
                setNotes(e.target.value);
                setFieldErrors((f) => ({ ...f, notes: null }));
              }}
              placeholder={JOURNAL_PLACEHOLDERS.notes}
              className="mt-1.5"
            />
            {fieldErrors.notes && (
              <p className="mt-1 text-sm text-destructive">
                {fieldErrors.notes}
              </p>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="gap-2"
          >
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Save entry
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
