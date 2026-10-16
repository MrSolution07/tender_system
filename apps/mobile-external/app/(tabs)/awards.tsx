import { PROJECT_STATUS_LABEL, sampleAwards } from "@tender/fixtures";

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

function parts(iso: string) {
  const date = new Date(iso);
  return {
    day: String(date.getDate()),
    weekday: date.toLocaleDateString("en-ZA", { weekday: "short" }),
    month: date.toLocaleDateString("en-ZA", { month: "short" }),
    monthYear: date.toLocaleDateString("en-ZA", {
      month: "short",
      year: "numeric",
    }),
  };
}

export default function AwardsScreen() {
  const awards = [...sampleAwards].sort(
    (left, right) =>
      new Date(right.awardedAt).getTime() - new Date(left.awardedAt).getTime(),
  );
  const latest = awards[0];

  if (!latest) {
    return (
      <Page>
        <SectionTitle>Awards</SectionTitle>
        <Meta>No awards on the sample register.</Meta>
      </Page>
    );
  }

  const hero = parts(latest.awardedAt);

  return (
    <Page>
      <SectionTitle>Awards</SectionTitle>
      <SectionSub>
        Contractor, place, and progress. Bids stay off this list.
      </SectionSub>
      <DateHero day={hero.day} weekday={hero.weekday} month={hero.monthYear} />
      <ColumnHead left="Date" right="Project" />
      {awards.map((award, index) => {
        const when = parts(award.awardedAt);
        return (
          <ScheduleRow key={award.id} primary={when.day} secondary={when.month}>
            <LessonCard
              title={award.projectTitle}
              detail={`${award.contractor}, ${PROJECT_STATUS_LABEL[award.projectStatus]}`}
              highlighted={index === 0}
              href={`/award/${award.id}`}
            />
          </ScheduleRow>
        );
      })}
    </Page>
  );
}
