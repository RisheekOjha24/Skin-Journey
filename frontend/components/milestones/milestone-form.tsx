"use client";
import * as React from "react";
import { Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { MILESTONE_CATEGORIES, MILESTONE_CATEGORY_LABELS, MilestoneCategory } from "@/config/milestones.config";
import { MilestoneInput } from "@/services/milestone.service";

import { ApiClientError } from "@/lib/api-client";

export function MilestoneForm({ onSubmit }: { onSubmit: (input: MilestoneInput) => Promise<unknown> }) {
  const [open, setOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [category, setCategory] = React.useState<MilestoneCategory>("product_started");
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string | null>>({});
  const [formError, setFormError] = React.useState<string | null>(null);

  const containerRef = React.useRef<HTMLDivElement>(null);

  const reset = () => {
    setTitle("");
    setDescription("");
    setCategory("product_started");
    setFieldErrors({});
    setFormError(null);
  };

  const scrollToFirstError = (errors: Record<string, string | null>, mainError?: string | null) => {
    setTimeout(() => {
      if (mainError && containerRef.current) {
        containerRef.current.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }

      const errorKeys = Object.keys(errors).filter((k) => Boolean(errors[k]));
      if (errorKeys.length === 0) return;

      const firstKey = errorKeys[0];
      const element = document.getElementById(firstKey);
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
    if (!title.trim()) {
      errors.title = "Title is required.";
    } else if (title.trim().length > 160) {
      errors.title = "Title must not exceed 160 characters.";
    }

    if (description && description.length > 2000) {
      errors.description = "Description must not exceed 2000 characters.";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      scrollToFirstError(errors);
      setIsSubmitting(false);
      return;
    }

    try {
      await onSubmit({ category, title: title.trim(), description: description.trim() || undefined });
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
        const msg = err instanceof Error ? err.message : "Failed to add milestone";
        setFormError(msg);
        scrollToFirstError({}, msg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => {
      setOpen(v);
      if (!v) reset();
    }}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" /> Add milestone
        </Button>
      </DialogTrigger>
      <DialogContent ref={containerRef} className="max-h-[85vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New milestone</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {formError && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm font-medium text-destructive">
              {formError}
            </div>
          )}
          <div>
            <Label id="category-label">Category</Label>
            <Select value={category} onValueChange={(v) => {
              setCategory(v as MilestoneCategory);
              setFieldErrors((f) => ({ ...f, category: null }));
            }}>
              <SelectTrigger id="category" className="mt-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MILESTONE_CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {MILESTONE_CATEGORY_LABELS[c]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {fieldErrors.category && (
              <p className="mt-1 text-sm text-destructive">{fieldErrors.category}</p>
            )}
          </div>
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setFieldErrors((f) => ({ ...f, title: null }));
              }}
              placeholder="e.g. Started retinol"
              className="mt-1.5"
            />
            {fieldErrors.title && (
              <p className="mt-1 text-sm text-destructive">{fieldErrors.title}</p>
            )}
          </div>
          <div>
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                setFieldErrors((f) => ({ ...f, description: null }));
              }}
              className="mt-1.5"
            />
            {fieldErrors.description && (
              <p className="mt-1 text-sm text-destructive">{fieldErrors.description}</p>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting} className="gap-2">
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Add milestone
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
