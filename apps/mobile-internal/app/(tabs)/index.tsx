import { TENDER_STATUSES } from "@tender/shared";
import {
  sampleEvaluations,
  sampleTenders,
  TENDER_STATUS_LABEL,
} from "@tender/fixtures";
import { Redirect } from "expo-router";
import { useState } from "react";
import { View } from "react-native";

import {
  ColumnHead,
  DateHero,
  Heading,
  LessonCard,
  Meta,
  Page,
  Row,
  Rule,
  ScheduleRow,
  SectionSub,
  TodayPill,
  WeekStrip,
} from "@/src/kit";
import { useSession } from "@/src/session";

const LETTERS = ["S", "M", "T", "W", "T", "F", "S"];

function startOfDay(date: Date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function sameDay(left: Date, right: Date) {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}

function weekContaining(date: Date) {
  const start = startOfDay(date);
  start.setDate(start.getDate() - start.getDay());
  return Array.from({ length: 7 }, (_, index) => {
    const day = new Date(start);
    day.setDate(start.getDate() + index);
    return day;
  });
}

function nextClosing(from: Date) {
  const start = startOfDay(from).getTime();
  const upcoming: Date[] = [];
  for (const tender of sampleTenders) {
    if (tender.status !== "published" || !tender.closingAt) continue;
    const date = new Date(tender.closingAt);
    if (date.getTime() >= start) upcoming.push(date);
  }
  upcoming.sort((left, right) => left.getTime() - right.getTime());
  return startOfDay(upcoming[0] ?? from);
}

function clock(iso: string) {
  return new Intl.DateTimeFormat("en-ZA", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(iso));
}

function monthShort(iso: string) {
  return new Date(iso).toLocaleDateString("en-ZA", { month: "short" });
}

export default function PipelineScreen() {
  const { session } = useSession();
  const today = startOfDay(new Date());
  const [selected, setSelected] = useState(() => nextClosing(new Date()));

  if (session?.role === "evaluator") return <Redirect href="/scores" />;

  const days = weekContaining(selected);
  const weekday = selected.toLocaleDateString("en-ZA", { weekday: "short" });
  const monthYear = selected.toLocaleDateString("en-ZA", {
    month: "short",
    year: "numeric",
  });
  const matches = sampleTenders.filter((tender) => {
    if (!tender.closingAt) return false;
    return sameDay(new Date(tender.closingAt), selected);
  });
  const later = sampleTenders.filter((tender) => {
    if (tender.status !== "published" || !tender.closingAt) return false;
    return startOfDay(new Date(tender.closingAt)).getTime() > selected.getTime();
  });
  const unscored = sampleEvaluations.filter((item) => item.score === null);

  return (
    <Page>
      <DateHero
        day={String(selected.getDate())}
        weekday={weekday}
        month={monthYear}
        action={<TodayPill onPress={() => setSelected(today)} />}
      />
      <WeekStrip
        days={days.map((day, index) => ({
          key: day.toISOString(),
          letter: LETTERS[index] ?? "",
          date: day.getDate(),
          selected: sameDay(day, selected),
          label: day.toLocaleDateString("en-ZA", { dateStyle: "full" }),
          onPress: () => setSelected(startOfDay(day)),
        }))}
      />
      <Rule />
      <SectionSub>Sample register. Nothing on this phone is saved.</SectionSub>
      <ColumnHead left="Closes" right="Tender" />
      {matches.length === 0 ? (
        <Meta>Nothing closes on this day.</Meta>
      ) : (
        matches.map((tender, index) =>
          tender.closingAt ? (
            <ScheduleRow key={tender.id} primary={clock(tender.closingAt)}>
              <LessonCard
                title={tender.title}
                detail={tender.department}
                highlighted={index === 0}
                href={`/tender/${tender.id}`}
              />
            </ScheduleRow>
          ) : null,
        )
      )}
      {matches.length === 0 && later.length > 0 ? (
        <View>
          <Heading>Later</Heading>
          {later.map((tender) =>
            tender.closingAt ? (
              <ScheduleRow
                key={tender.id}
                primary={String(new Date(tender.closingAt).getDate())}
                secondary={monthShort(tender.closingAt)}
              >
                <LessonCard
                  title={tender.title}
                  detail={tender.department}
                  href={`/tender/${tender.id}`}
                />
              </ScheduleRow>
            ) : null,
          )}
        </View>
      ) : null}
      {TENDER_STATUSES.map((status) => {
        const rows = sampleTenders.filter((tender) => tender.status === status);
        if (rows.length === 0) return null;
        return (
          <View key={status}>
            <Heading>{TENDER_STATUS_LABEL[status]}</Heading>
            {rows.map((tender) => (
              <Row
                key={tender.id}
                href={`/tender/${tender.id}`}
                title={tender.title}
                meta={tender.department}
              />
            ))}
          </View>
        );
      })}
      {session?.role === "super_admin" && unscored.length > 0 ? (
        <View>
          <Heading>Still to score</Heading>
          {unscored.map((item) => (
            <Row
              key={item.id}
              href={`/score/${item.id}`}
              title={item.contractor}
              meta="No score yet"
            />
          ))}
        </View>
      ) : null}
    </Page>
  );
}
