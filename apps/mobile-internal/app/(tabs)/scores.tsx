import { useEffect, useState } from "react";

import { Body, Page, Row, SectionTitle } from "@/src/kit";
import { loadScoreBoard, type ScoreCard } from "@/src/operate";
import { watchRegister } from "@/src/queries";

export default function ScoresScreen() {
  const [rows, setRows] = useState<ScoreCard[]>([]);
  useEffect(() => {
    const load = () => {
      void loadScoreBoard().then(setRows);
    };
    load();
    return watchRegister(load);
  }, []);

  return (
    <Page>
      <SectionTitle>Scores</SectionTitle>
      <Body>Assigned bids, plus scores already on the register. Scores stay off the public record.</Body>
      {rows.length === 0 ? <Body>No assigned bids to score.</Body> : null}
      {rows.map((item) => (
        <Row
          key={item.bidId}
          href={`/score/${item.bidId}`}
          title={item.contractor}
          meta={item.title}
          aside={item.score === null ? "Unscored" : String(item.score)}
        />
      ))}
    </Page>
  );
}
