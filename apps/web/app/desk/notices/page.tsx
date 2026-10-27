"use client";

import { useEffect, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { loadNotifications, markNotificationRead, type Notice } from "@/lib/desk-ops";
import { formatDate } from "@/lib/format";

export default function NoticesPage() {
  const [items, setItems] = useState<Notice[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    void loadNotifications().then((result) => {
      setItems(result.items);
      setMessage(result.error);
    });
  }, []);

  return (
    <div>
      <h1 className="font-display text-balance text-4xl font-semibold">Notices</h1>
      <p className="mt-3 max-w-[62ch] text-pretty text-muted-foreground">
        Messages for your account, including bids submitted on tenders you created.
      </p>
      {message ? (
        <Alert className="mt-4">
          <AlertTitle>Notices</AlertTitle>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      ) : null}
      {items.length === 0 ? (
        <p className="mt-8 text-muted-foreground">No notices yet.</p>
      ) : (
        <ul className="mt-8 divide-y divide-border border-y border-border">
          {items.map((item) => (
            <li key={item.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <div>
                <p className="font-medium">{item.title}</p>
                <p className="text-sm text-muted-foreground">
                  {item.body}
                  {item.createdAt ? ` · ${formatDate(item.createdAt)}` : ""}
                  {item.readAt ? " · Read" : ""}
                </p>
              </div>
              {item.readAt ? null : (
                <Button
                  type="button"
                  variant="outline"
                  className="h-11"
                  onClick={() => {
                    void markNotificationRead(item.id).then(async (error) => {
                      setMessage(error);
                      if (!error) {
                        const result = await loadNotifications();
                        setItems(result.items);
                      }
                    });
                  }}
                >
                  Mark read
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
