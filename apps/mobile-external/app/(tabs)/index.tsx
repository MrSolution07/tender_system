import { EMPTY_CATEGORY } from "@tender/fixtures";
import {
  Anchor,
  Armchair,
  Building2,
  Cpu,
  Droplets,
  HeartPulse,
  Route,
  Truck,
  type LucideIcon,
} from "lucide-react-native";
import { useEffect, useMemo, useState } from "react";
import { ScrollView, View } from "react-native";

import {
  HeaderSearch,
  HomeFrame,
  LessonCard,
  Meta,
  ScheduleRow,
  SearchToggle,
  SectionSub,
  SectionTitle,
  tileInk,
  ToneTile,
  Wordmark,
  type TileTone,
} from "@/src/kit";
import { loadPublishedTenders, watchRegister, type LiveTender } from "@/src/queries";

const TONES: TileTone[] = ["orange", "purple", "mint", "forest"];

function iconFor(category: string): LucideIcon {
  switch (category) {
    case "Roads":
      return Route;
    case "Health supplies":
      return HeartPulse;
    case "Furniture":
      return Armchair;
    case "Water":
      return Droplets;
    case "Buildings":
      return Building2;
    case "Fleet":
      return Truck;
    case "Technology":
      return Cpu;
    default:
      return Anchor;
  }
}

function dayBits(iso: string) {
  const date = new Date(iso);
  return {
    day: String(date.getDate()),
    month: date.toLocaleDateString("en-ZA", { month: "short" }),
  };
}

export default function NoticesScreen() {
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [category, setCategory] = useState("All");
  const [published, setPublished] = useState<LiveTender[]>([]);
  useEffect(() => {
    const load = () => {
      void loadPublishedTenders().then(setPublished);
    };
    load();
    return watchRegister(load);
  }, []);
  const categories = useMemo(() => {
    const names = [...new Set(published.map((tender) => tender.category))];
    return [...names, EMPTY_CATEGORY];
  }, [published]);
  const rows = published
    .filter((tender) => {
      const haystack = `${tender.title} ${tender.department}`.toLowerCase();
      const matchesQuery = haystack.includes(query.trim().toLowerCase());
      const matchesCategory =
        category === "All" || tender.category === category;
      return matchesQuery && matchesCategory;
    })
    .sort((left, right) => {
      const leftTime = left.closingAt ? new Date(left.closingAt).getTime() : 0;
      const rightTime = right.closingAt
        ? new Date(right.closingAt).getTime()
        : 0;
      return leftTime - rightTime;
    });

  return (
    <HomeFrame
      header={
        <View>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Wordmark />
            <SearchToggle
              open={searching}
              onPress={() => {
                setSearching((current) => !current);
                if (searching) setQuery("");
              }}
            />
          </View>
          {searching ? (
            <HeaderSearch value={query} onChangeText={setQuery} />
          ) : null}
        </View>
      }
    >
      <SectionTitle>Open notices</SectionTitle>
      <SectionSub>Published for bid.</SectionSub>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingRight: 8 }}
      >
        {categories.map((item, index) => {
          const Icon = iconFor(item);
          const tone = TONES[index % TONES.length] ?? "orange";
          const selected = category === item;
          return (
            <ToneTile
              key={item}
              label={item}
              tone={tone}
              selected={selected}
              onPress={() => setCategory(selected ? "All" : item)}
              icon={<Icon color={tileInk[tone]} size={22} strokeWidth={2} />}
            />
          );
        })}
      </ScrollView>
      <View style={{ height: 28 }} />
      <SectionTitle>Closing next</SectionTitle>
      <SectionSub>Closing dates on the register.</SectionSub>
      {rows.length === 0 ? (
        <Meta>No open notices match that filter.</Meta>
      ) : (
        rows.map((tender, index) => {
          const bits = tender.closingAt ? dayBits(tender.closingAt) : null;
          return (
            <ScheduleRow
              key={tender.id}
              primary={bits?.day ?? "–"}
              secondary={bits?.month}
            >
              <LessonCard
                title={tender.title}
                detail={tender.department}
                highlighted={index === 0}
                href={`/tender/${tender.id}`}
              />
            </ScheduleRow>
          );
        })
      )}
    </HomeFrame>
  );
}
