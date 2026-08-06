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

export function MilestoneForm({ onSubmit }: { onSubmit: (input: MilestoneInput) => Promise<unknown> }) {
  const [open, setOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [category, setCategory] = React.useState<MilestoneCategory>("product_started");
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");

  const handleSubmit = async () => {
    if (!title.trim()) return;
    setIsSubmitting(true);
    try {
      await onSubmit({ category, title, description: description || undefined });
      setTitle("");
      setDescription("");
      setCategory("product_started");
      setOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" /> Add milestone
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New milestone</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Category</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as MilestoneCategory)}>
              <SelectTrigger className="mt-1.5">
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
          </div>
          <div>
            <Label htmlFor="title">Title</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Started retinol" className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1.5" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || !title.trim()} className="gap-2">
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Add milestone
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
