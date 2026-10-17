import { PROJECT_STATUS_LABEL } from "@tender/fixtures";
import { useEffect, useState } from "react";

import {
  ColumnHead,
  DateHero,
  LessonCard,
  Meta,
  Page,
  ScheduleRow,
  SectionSub,
  SectionTitle,
} from "@/src/kit";
import { loadAwards, watchRegister, type LiveAward } from "@/src/queries";

function parts(iso: string) {
  const date = new Date(iso);
  return {
    day: String(date.getDate()),
    weekday: date.toLocaleDateString("en-ZA", { weekday: "short" }),
    month: date.toLocaleDateString("en-ZA", { month: "short" }),
    monthYear: date.toLocaleDateString("en-ZA", { month: "short", year: "numeric" }),
  };
}

export default function AwardsScreen() {
  const [awards, setAwards] = useState<LiveAward[]>([]);

  useEffect(() => {
    const load = () => {
      void loadAwards().then(setAwards);
    };
    load();
    return watchRegister(load);
  }, []);

  const latest = awards[0];
  if (!latest) {
    return (
      <Page>
        <SectionTitle>Awards</SectionTitle>
        <Meta>No awards on the register.</Meta>
      </Page>
    );
  }

  const hero = parts(latest.awardedAt);
  return (
    <Page>
      <SectionTitle>Awards</SectionTitle>
      <SectionSub>Contractor, place, and progress. Bids stay off this list.</SectionSub>
      <DateHero day={hero.day} weekday={hero.weekday} month={hero.monthYear} />
      <ColumnHead left="Date" right="Project" />
      {awards.map((award, index) => {
        const when = parts(award.awardedAt);
        const status =
          PROJECT_STATUS_LABEL[award.projectStatus as keyof typeof PROJECT_STATUS_LABEL] ??
          award.projectStatus;
        return (
          <ScheduleRow key={award.id} primary={when.day} secondary={when.month}>
            <LessonCard
              title={award.projectTitle}
              detail={`${award.contractor}, ${status}`}
              highlighted={index === 0}
              href={`/award/${award.id}`}
            />
          </ScheduleRow>
        );
      })}
    </Page>
  );
}
