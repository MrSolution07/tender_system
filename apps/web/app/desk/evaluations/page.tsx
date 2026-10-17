"use client";

import { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useStore } from "@/lib/store";

export default function EvaluationsPage() {
  const { evaluations, tenders, saveScore } = useStore();

  return (
    <div>
      <h1 className="font-display text-balance text-4xl font-semibold">Scores</h1>
      <p className="mt-3 max-w-[62ch] text-pretty text-muted-foreground">
        Scores stay on the desk. They are not copied to the public awards page.
      </p>
      <ul className="mt-8 grid gap-10">
        {evaluations.map((evaluation) => {
          const tender = tenders.find((item) => item.id === evaluation.tenderId);
          return (
            <ScoreCard
              key={evaluation.id}
              id={evaluation.id}
              title={tender?.title ?? "Tender"}
              contractor={evaluation.contractor}
              initialScore={evaluation.score}
              initialComments={evaluation.comments}
              onSave={saveScore}
            />
          );
        })}
      </ul>
    </div>
  );
}

function ScoreCard({
  id,
  title,
  contractor,
  initialScore,
  initialComments,
  onSave,
}: {
  id: string;
  title: string;
  contractor: string;
  initialScore: number | null;
  initialComments: string;
  onSave: (id: string, score: number, comments: string) => void;
}) {
  const [score, setScore] = useState(initialScore === null ? "" : String(initialScore));
  const [comments, setComments] = useState(initialComments);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  return (
    <li className="border-y border-border py-6">
      <h2 className="font-display text-2xl font-semibold">{contractor}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{title}</p>
      <form
        className="mt-4 grid max-w-lg gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          const value = Number(score);
          if (!Number.isInteger(value) || value < 0 || value > 100) {
            setSaved(false);
            setError("Enter a whole score from 0 to 100.");
            return;
          }
          onSave(id, value, comments.trim());
          setError(null);
          setSaved(true);
        }}
      >
        <div className="grid gap-2">
          <Label htmlFor={`score-${id}`}>Score</Label>
          <Input
            id={`score-${id}`}
            inputMode="numeric"
            value={score}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? `score-${id}-error` : undefined}
            onChange={(event) => setScore(event.target.value)}
          />
          {error ? (
            <p id={`score-${id}-error`} className="text-sm text-destructive">
              {error}
            </p>
          ) : null}
        </div>
        <div className="grid gap-2">
          <Label htmlFor={`comments-${id}`}>Notes</Label>
          <Textarea
            id={`comments-${id}`}
            value={comments}
            rows={3}
            onChange={(event) => setComments(event.target.value)}
          />
        </div>
        <Button type="submit" className="h-11 w-fit">
          Save score
        </Button>
        {saved ? (
          <Alert>
            <AlertTitle>Score saved</AlertTitle>
            <AlertDescription>
              {Number(score) >= 50 ? "Marked compliant." : "Marked not compliant."}{" "}
              The public site does not show this.
            </AlertDescription>
          </Alert>
        ) : null}
      </form>
    </li>
  );
}
