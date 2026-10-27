"use client";

import { useEffect, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { loadScoreBoard, saveScoreForBid, type ScoreCard } from "@/lib/desk-ops";

export default function EvaluationsPage() {
  const [cards, setCards] = useState<ScoreCard[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    void loadScoreBoard().then((result) => {
      setCards(result.cards);
      setMessage(result.error);
    });
  }, []);

  return (
    <div>
      <h1 className="font-display text-balance text-4xl font-semibold">Scores</h1>
      <p className="mt-3 max-w-[62ch] text-pretty text-muted-foreground">
        Scores stay on the desk. They are not copied to the public awards page.
      </p>
      {message ? (
        <Alert className="mt-4">
          <AlertTitle>Scores</AlertTitle>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      ) : null}
      {cards.length === 0 ? (
        <p className="mt-8 text-muted-foreground">No assigned bids to score.</p>
      ) : (
        <ul className="mt-8 grid gap-10">
          {cards.map((card) => (
            <ScoreForm
              key={card.bidId}
              card={card}
              onSaved={async (error) => {
                setMessage(error);
                if (!error) {
                  const result = await loadScoreBoard();
                  setCards(result.cards);
                }
              }}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function ScoreForm({
  card,
  onSaved,
}: {
  card: ScoreCard;
  onSaved: (error: string | null) => Promise<void>;
}) {
  const [score, setScore] = useState(card.score === null ? "" : String(card.score));
  const [comments, setComments] = useState(card.comments);
  const [error, setError] = useState<string | null>(null);

  return (
    <li className="border-y border-border py-6">
      <h2 className="font-display text-2xl font-semibold">{card.contractor}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{card.title}</p>
      <form
        className="mt-4 grid max-w-lg gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          const value = Number(score);
          if (!Number.isInteger(value) || value < 0 || value > 100) {
            setError("Enter a whole score from 0 to 100.");
            return;
          }
          void saveScoreForBid(card.bidId, value, comments).then(async (saveError) => {
            setError(saveError);
            await onSaved(saveError);
          });
        }}
      >
        <div className="grid gap-2">
          <Label htmlFor={`score-${card.bidId}`}>Score</Label>
          <Input
            id={`score-${card.bidId}`}
            inputMode="numeric"
            value={score}
            onChange={(event) => setScore(event.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor={`comments-${card.bidId}`}>Notes</Label>
          <Textarea
            id={`comments-${card.bidId}`}
            value={comments}
            rows={3}
            onChange={(event) => setComments(event.target.value)}
          />
        </div>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <Button type="submit" className="h-11 w-fit">
          Save score
        </Button>
      </form>
    </li>
  );
}
