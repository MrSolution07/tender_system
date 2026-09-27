"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useStore } from "@/lib/store";

type FieldErrors = {
  title?: string;
  department?: string;
  category?: string;
  budget?: string;
  closingAt?: string;
};

export default function NewTenderPage() {
  const { session, createTender } = useStore();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [department, setDepartment] = useState("");
  const [category, setCategory] = useState("");
  const [budget, setBudget] = useState("");
  const [closingAt, setClosingAt] = useState("");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const canSave =
    session?.role === "procurement_officer" || session?.role === "super_admin";

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaveError(null);
    const next: FieldErrors = {};
    if (title.trim().length < 8) next.title = "Use a title of at least 8 characters.";
    if (department.trim().length === 0) next.department = "Name the department.";
    if (category.trim().length === 0) next.category = "Name the category.";
    const rands = Number(budget);
    if (budget.trim() === "" || !Number.isFinite(rands) || rands < 0) {
      next.budget = "Enter a budget of zero or more, in rands.";
    }
    if (!closingAt) {
      next.closingAt = "Choose a closing date.";
    } else if (new Date(`${closingAt}T16:00:00`).getTime() < Date.now()) {
      next.closingAt = "Choose a closing date that is still ahead.";
    }
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    if (!canSave) {
      setSaveError("This preview role cannot save a draft. Switch to a procurement officer.");
      return;
    }

    setSaving(true);
    window.setTimeout(() => {
      try {
        const tender = createTender({
          title: title.trim(),
          department: department.trim(),
          category: category.trim(),
          description: description.trim(),
          budgetCents: Math.round(rands * 100),
          closingAt: new Date(`${closingAt}T16:00:00`).toISOString(),
        });
        router.push(`/desk/tenders/${tender.id}`);
      } catch {
        setSaving(false);
        setSaveError("Could not save this tender. Check the fields and try again.");
      }
    }, 400);
  }

  return (
    <div className="max-w-xl">
      <h1 className="font-display text-balance text-4xl font-semibold">New tender</h1>
      <p className="mt-3 text-pretty text-muted-foreground">
        Saves a draft in this browser only. Nothing is published until you
        change the status on the tender.
      </p>
      {!canSave ? (
        <Alert className="mt-6">
          <AlertTitle>This role cannot save a draft</AlertTitle>
          <AlertDescription>
            Switch the preview to a procurement officer or a super admin.
          </AlertDescription>
        </Alert>
      ) : null}
      <form className="mt-8 grid gap-5" onSubmit={onSubmit} noValidate>
        <Field
          id="title"
          label="Title"
          error={errors.title}
          value={title}
          onChange={setTitle}
        />
        <Field
          id="department"
          label="Department"
          error={errors.department}
          value={department}
          onChange={setDepartment}
        />
        <Field
          id="category"
          label="Category"
          error={errors.category}
          value={category}
          onChange={setCategory}
        />
        <Field
          id="budget"
          label="Budget in rands"
          error={errors.budget}
          value={budget}
          onChange={setBudget}
          inputMode="decimal"
        />
        <div className="grid gap-2">
          <Label htmlFor="closing">Closing date</Label>
          <Input
            id="closing"
            type="date"
            value={closingAt}
            aria-invalid={errors.closingAt ? true : undefined}
            aria-describedby={errors.closingAt ? "closing-error" : undefined}
            onChange={(event) => setClosingAt(event.target.value)}
          />
          {errors.closingAt ? (
            <p id="closing-error" className="text-sm text-destructive">
              {errors.closingAt}
            </p>
          ) : null}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={5}
          />
        </div>
        {saveError ? (
          <Alert>
            <AlertTitle>Not saved</AlertTitle>
            <AlertDescription>{saveError}</AlertDescription>
          </Alert>
        ) : null}
        <div className="flex gap-3">
          <Button type="submit" className="h-11" disabled={saving || !canSave}>
            {saving ? "Saving draft…" : "Save draft"}
          </Button>
          <Button asChild variant="ghost" className="h-11" static>
            <Link href="/desk/tenders">Cancel</Link>
          </Button>
        </div>
      </form>
    </div>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  error,
  inputMode,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  inputMode?: "decimal";
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        value={value}
        inputMode={inputMode}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        onChange={(event) => onChange(event.target.value)}
      />
      {error ? (
        <p id={`${id}-error`} className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
