import { useEffect, useState } from "react";

import { Body, Page, Row, SectionTitle } from "@/src/kit";
import { loadEvaluations, watchRegister, type DeskEvaluation } from "@/src/queries";

export default function ScoresScreen() {
  const [rows, setRows] = useState<DeskEvaluation[]>([]);
  useEffect(() => {
    const load = () => {
      void loadEvaluations().then(setRows);
    };
    load();
    return watchRegister(load);
  }, []);

  return (
    <Page>
      <SectionTitle>Scores</SectionTitle>
      <Body>Assigned bids only. Scores stay off the public record.</Body>
      {rows.map((item) => (
        <Row
          key={item.id}
          href={`/score/${item.id}`}
          title={item.contractor}
          meta={item.title}
          aside={item.score === null ? "Unscored" : String(item.score)}
        />
      ))}
    </Page>
  );
}
