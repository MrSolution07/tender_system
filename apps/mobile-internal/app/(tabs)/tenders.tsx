import { EMPTY_CATEGORY, formatDate, sampleTenders, TENDER_STATUS_LABEL } from "@tender/fixtures";
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
import { useMemo, useState } from "react";
import { ScrollView, View } from "react-native";

import {
  HeaderSearch,
  HomeFrame,
  Row,
  SearchToggle,
  SectionSub,
  SectionTitle,
  TextAction,
  tileInk,
  ToneTile,
  Wordmark,
  type TileTone,
} from "@/src/kit";

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

export default function TendersScreen() {
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [category, setCategory] = useState("All");
  const categories = useMemo(() => {
    const names = [...new Set(sampleTenders.map((tender) => tender.category))];
    return [...names, EMPTY_CATEGORY];
  }, []);
  const rows = sampleTenders.filter((tender) => {
    const haystack = `${tender.title} ${tender.department}`.toLowerCase();
    const matchesQuery = haystack.includes(query.trim().toLowerCase());
    const matchesCategory = category === "All" || tender.category === category;
    return matchesQuery && matchesCategory;
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
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <SectionTitle>Tenders</SectionTitle>
        <TextAction label="New draft" href="/tender/new" />
      </View>
      <SectionSub>Every status on the sample register.</SectionSub>
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
      <View style={{ marginTop: 8 }}>
        {rows.length === 0 ? (
          <SectionSub>No sample tenders match that filter.</SectionSub>
        ) : (
          rows.map((tender) => (
            <Row
              key={tender.id}
              href={`/tender/${tender.id}`}
              title={tender.title}
              meta={`${tender.department}\n${TENDER_STATUS_LABEL[tender.status]}`}
              aside={tender.closingAt ? formatDate(tender.closingAt) : "No date"}
            />
          ))
        )}
      </View>
    </HomeFrame>
  );
}
