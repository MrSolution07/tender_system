import type { Href } from "expo-router";
import { Link, useFocusEffect } from "expo-router";
import { setStatusBarStyle, StatusBar } from "expo-status-bar";
import { ChevronRight, Eye, EyeOff, Search, X } from "lucide-react-native";
import { useCallback, useEffect, useState, type ReactNode, type Ref } from "react";
import {
  AccessibilityInfo,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
  type TextStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Circle, Ellipse } from "react-native-svg";

export const theme = {
  canvas: "#FFFFFF",
  ink: "#1B1D1F",
  muted: "#5C6770",
  line: "#E6E8EA",
  card: "#F3F5F7",
  forest: "#0E3B2C",
  green: "#4BB179",
  greenWash: "#E5F6EE",
  mint: "#7DDBB0",
  orange: "#FF7A45",
  accent: "#E85D2A",
  purple: "#5B54E6",
  onForest: "#F4FFF8",
  onForestMuted: "#D5EDE3",
  nav: "#8B939C",
  danger: "#9F2D2D",
  white: "#FFFFFF",
  teal: "#0E3B2C",
  tealInk: "#F4FFF8",
  tealWash: "#E5F6EE",
  highlight: "#0E3B2C",
  surface: "#FFFFFF",
  radius: 20,
  control: 16,
} as const;

export const tileInk = {
  orange: "#1B1D1F",
  purple: "#FFFFFF",
  mint: "#1B1D1F",
  forest: "#FFFFFF",
} as const;

export type TileTone = keyof typeof tileInk;

export const font = {
  display: "Poppins_700Bold",
  strong: "Poppins_600SemiBold",
  medium: "Poppins_500Medium",
  body: "Poppins_400Regular",
} as const;

const webOutline: TextStyle | null =
  Platform.OS === "web" ? ({ outlineWidth: 0 } as TextStyle) : null;

function useReduceMotion(): boolean {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    let alive = true;
    void AccessibilityInfo.isReduceMotionEnabled().then((value) => {
      if (alive) setReduce(value);
    });
    const subscription = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      setReduce,
    );
    return () => {
      alive = false;
      subscription.remove();
    };
  }, []);
  return reduce;
}

function pressStyle(pressed: boolean, reduce: boolean) {
  if (!pressed) return null;
  if (reduce) return { opacity: 0.72 };
  return { transform: [{ scale: 0.96 }] };
}

function HeaderArt() {
  return (
    <Svg
      width={250}
      height={210}
      viewBox="0 0 250 210"
      style={styles.art}
      pointerEvents="none"
    >
      <Ellipse cx="186" cy="78" rx="104" ry="82" fill="#1B5C40" />
      <Ellipse cx="124" cy="136" rx="96" ry="72" fill="#2E8B62" />
      <Circle cx="176" cy="92" r="44" fill="#8FE3C0" />
      <Circle cx="160" cy="80" r="16" fill="#E7F8EF" />
    </Svg>
  );
}

function LoginArt() {
  return (
    <Svg
      width={220}
      height={160}
      viewBox="0 0 220 160"
      style={styles.loginArt}
      pointerEvents="none"
    >
      <Ellipse cx="160" cy="46" rx="90" ry="70" fill="#1F6B4A" opacity={0.28} />
      <Ellipse cx="78" cy="110" rx="70" ry="54" fill="#0E3B2C" opacity={0.16} />
    </Svg>
  );
}

export function HomeFrame({
  header,
  children,
}: {
  header: ReactNode;
  children: ReactNode;
}) {
  const insets = useSafeAreaInsets();
  useFocusEffect(
    useCallback(() => {
      setStatusBarStyle("light");
      return () => setStatusBarStyle("dark");
    }, []),
  );
  return (
    <ScrollView
      style={styles.forestScroll}
      contentContainerStyle={styles.forestContent}
      keyboardShouldPersistTaps="handled"
    >
      <StatusBar style="light" />
      <View style={[styles.forest, { paddingTop: insets.top + 8 }]}>
        <HeaderArt />
        {header}
      </View>
      <View style={styles.sheet}>{children}</View>
    </ScrollView>
  );
}

export function Page({ children }: { children: ReactNode }) {
  const insets = useSafeAreaInsets();
  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[
        styles.pageContent,
        { paddingTop: insets.top + 16 },
      ]}
      keyboardShouldPersistTaps="handled"
    >
      <StatusBar style="dark" />
      {children}
    </ScrollView>
  );
}

export function Screen({ children }: { children: ReactNode }) {
  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.screenContent}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  );
}

export function SignInFrame({
  product,
  children,
}: {
  product: string;
  children: ReactNode;
}) {
  const insets = useSafeAreaInsets();
  useFocusEffect(
    useCallback(() => {
      setStatusBarStyle("dark");
    }, []),
  );
  return (
    <KeyboardAvoidingView
      style={styles.signRoot}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <StatusBar style="dark" />
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[
          styles.signScroll,
          { paddingBottom: insets.bottom + 20 },
        ]}
      >
        <View style={[styles.signHero, { paddingTop: insets.top + 28 }]}>
          <LoginArt />
          <View style={styles.mark}>
            <Text style={styles.markText}>M</Text>
          </View>
          <Text accessibilityRole="header" style={styles.brand}>
            Major Tech
          </Text>
          <Text style={styles.brandSub}>{product}</Text>
        </View>
        <View style={styles.signSheet}>{children}</View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export function Wordmark() {
  return <Text style={styles.wordmark}>Major Tech</Text>;
}

export function ForestTitle({ children }: { children: ReactNode }) {
  return (
    <Text accessibilityRole="header" style={styles.forestTitle}>
      {children}
    </Text>
  );
}

export function ForestSub({ children }: { children: ReactNode }) {
  return <Text style={styles.forestSub}>{children}</Text>;
}

export function SearchToggle({
  open,
  onPress,
}: {
  open: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={open ? "Close search" : "Search notices"}
      onPress={onPress}
      style={({ pressed }) => [styles.searchBtn, pressed && { opacity: 0.72 }]}
    >
      {open ? (
        <X color={theme.onForest} size={18} strokeWidth={2} />
      ) : (
        <Search color={theme.onForest} size={18} strokeWidth={2} />
      )}
    </Pressable>
  );
}

export function HeaderSearch({
  value,
  onChangeText,
}: {
  value: string;
  onChangeText: (value: string) => void;
}) {
  return (
    <TextInput
      accessibilityLabel="Search title or department"
      value={value}
      onChangeText={onChangeText}
      placeholder="Search title or department"
      placeholderTextColor={theme.onForestMuted}
      autoFocus
      autoCapitalize="none"
      autoCorrect={false}
      style={styles.headerSearch}
    />
  );
}

export function Title({ children }: { children: ReactNode }) {
  return (
    <Text accessibilityRole="header" style={styles.title}>
      {children}
    </Text>
  );
}

export function Heading({ children }: { children: ReactNode }) {
  return (
    <Text accessibilityRole="header" style={styles.heading}>
      {children}
    </Text>
  );
}

export function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <Text accessibilityRole="header" style={styles.sectionTitle}>
      {children}
    </Text>
  );
}

export function SectionSub({ children }: { children: ReactNode }) {
  return <Text style={styles.sectionSub}>{children}</Text>;
}

export function Body({ children }: { children: ReactNode }) {
  return <Text style={styles.body}>{children}</Text>;
}

export function Meta({ children }: { children: ReactNode }) {
  return <Text style={styles.meta}>{children}</Text>;
}

export function Figure({ children }: { children: ReactNode }) {
  return <Text style={styles.figure}>{children}</Text>;
}

export function DateHero({
  day,
  weekday,
  month,
  action,
}: {
  day: string;
  weekday: string;
  month: string;
  action?: ReactNode;
}) {
  return (
    <View style={styles.dateHero}>
      <View style={styles.dateMain}>
        <Text style={styles.dateNum}>{day}</Text>
        <View>
          <Text style={styles.dateWeek}>{weekday}</Text>
          <Text style={styles.dateMonth}>{month}</Text>
        </View>
      </View>
      {action}
    </View>
  );
}

export function TodayPill({ onPress }: { onPress: () => void }) {
  const reduce = useReduceMotion();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Show today"
      onPress={onPress}
      style={({ pressed }) => [styles.today, pressStyle(pressed, reduce)]}
    >
      <Text style={styles.todayText}>Today</Text>
    </Pressable>
  );
}

export function WeekStrip({
  days,
}: {
  days: {
    key: string;
    letter: string;
    date: number;
    selected: boolean;
    label: string;
    onPress: () => void;
  }[];
}) {
  return (
    <View style={styles.week}>
      {days.map((day) => (
        <Pressable
          key={day.key}
          accessibilityRole="button"
          accessibilityLabel={day.label}
          accessibilityState={{ selected: day.selected }}
          onPress={day.onPress}
          style={styles.weekCell}
        >
          <Text style={styles.weekLetter}>{day.letter}</Text>
          <View style={[styles.weekDay, day.selected && styles.weekDayOn]}>
            <Text style={styles.weekDayText}>{day.date}</Text>
          </View>
        </Pressable>
      ))}
    </View>
  );
}

export function Rule() {
  return <View style={styles.rule} />;
}

export function ColumnHead({ left, right }: { left: string; right: string }) {
  return (
    <View style={styles.columnHead}>
      <Text style={[styles.columnLabel, styles.timeCol]}>{left}</Text>
      <Text style={[styles.columnLabel, styles.flex]}>{right}</Text>
    </View>
  );
}

export function ScheduleRow({
  primary,
  secondary,
  children,
}: {
  primary: string;
  secondary?: string;
  children: ReactNode;
}) {
  return (
    <View style={styles.scheduleRow}>
      <View style={styles.timeCol}>
        <Text style={styles.schedulePrimary}>{primary}</Text>
        {secondary ? (
          <Text style={styles.scheduleSecondary}>{secondary}</Text>
        ) : null}
      </View>
      <View style={styles.scheduleRule} />
      <View style={styles.flex}>{children}</View>
    </View>
  );
}

export function LessonCard({
  title,
  detail,
  highlighted = false,
  href,
}: {
  title: string;
  detail?: string;
  highlighted?: boolean;
  href: Href;
}) {
  const reduce = useReduceMotion();
  const [pressed, setPressed] = useState(false);
  return (
    <Link href={href} asChild>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={detail ? `${title}. ${detail}` : title}
        onPressIn={() => setPressed(true)}
        onPressOut={() => setPressed(false)}
      >
        <View
          style={[
            styles.lesson,
            highlighted && styles.lessonOn,
            pressStyle(pressed, reduce),
          ]}
        >
          {highlighted ? <View style={styles.lessonBlob} /> : null}
          <Text style={styles.lessonTitle} numberOfLines={2}>
            {title}
          </Text>
          {detail ? (
            <Text style={styles.lessonDetail} numberOfLines={2}>
              {detail}
            </Text>
          ) : null}
        </View>
      </Pressable>
    </Link>
  );
}

export function ToneTile({
  label,
  tone,
  selected,
  onPress,
  icon,
}: {
  label: string;
  tone: TileTone;
  selected: boolean;
  onPress: () => void;
  icon: ReactNode;
}) {
  const reduce = useReduceMotion();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.tile,
        tone === "orange" && styles.orange,
        tone === "purple" && styles.purple,
        tone === "mint" && styles.mint,
        tone === "forest" && styles.forestTone,
        selected && styles.tileOn,
        pressStyle(pressed, reduce),
      ]}
    >
      <View style={styles.tileBody}>
        {icon}
        <Text
          numberOfLines={2}
          style={[styles.tileLabel, { color: tileInk[tone] }]}
        >
          {label}
        </Text>
      </View>
    </Pressable>
  );
}

export function Row({
  href,
  title,
  meta,
  aside,
  label,
}: {
  href: Href;
  title: string;
  meta?: string;
  aside?: string;
  label?: string;
}) {
  const reduce = useReduceMotion();
  const [pressed, setPressed] = useState(false);
  return (
    <Link href={href} asChild>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label ?? title}
        onPressIn={() => setPressed(true)}
        onPressOut={() => setPressed(false)}
      >
        <View style={[styles.row, pressStyle(pressed, reduce)]}>
          <View style={styles.flex}>
            <Text style={styles.rowTitle} numberOfLines={3}>
              {title}
            </Text>
            {meta ? (
              <Text style={styles.meta} numberOfLines={3}>
                {meta}
              </Text>
            ) : null}
          </View>
          {aside ? <Text style={styles.aside}>{aside}</Text> : null}
          <ChevronRight size={18} strokeWidth={2} color={theme.nav} />
        </View>
      </Pressable>
    </Link>
  );
}

export function Choice({
  title,
  meta,
  onPress,
}: {
  title: string;
  meta: string;
  onPress: () => void;
}) {
  const reduce = useReduceMotion();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${meta}`}
      onPress={onPress}
      style={({ pressed }) => [styles.choice, pressStyle(pressed, reduce)]}
    >
      <Text style={styles.rowTitle}>{title}</Text>
      <Text style={styles.meta}>{meta}</Text>
    </Pressable>
  );
}

export function Badge({ label }: { label: string }) {
  return (
    <View style={styles.badge}>
      <Text style={styles.badgeText}>{label}</Text>
    </View>
  );
}

export function PrimaryButton({
  label,
  href,
  onPress,
  tone = "brand",
}: {
  label: string;
  href?: Href;
  onPress?: () => void;
  tone?: "brand" | "teal" | "danger";
}) {
  const reduce = useReduceMotion();
  const [pressed, setPressed] = useState(false);
  const button = (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
    >
      <View
        style={[
          styles.primary,
          tone === "danger" && styles.primaryDanger,
          pressStyle(pressed, reduce),
        ]}
      >
        <Text
          style={[
            styles.primaryText,
            tone === "danger" && styles.primaryTextDanger,
          ]}
        >
          {label}
        </Text>
      </View>
    </Pressable>
  );
  if (href) {
    return (
      <Link href={href} asChild>
        {button}
      </Link>
    );
  }
  return button;
}

export function QuietButton({
  label,
  href,
  onPress,
  selected = false,
}: {
  label: string;
  href?: Href;
  onPress?: () => void;
  selected?: boolean;
}) {
  const reduce = useReduceMotion();
  const [pressed, setPressed] = useState(false);
  const button = (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
    >
      <View
        style={[
          styles.quiet,
          selected && styles.quietSelected,
          pressStyle(pressed, reduce),
        ]}
      >
        <Text style={[styles.quietText, selected && styles.quietTextSelected]}>
          {label}
        </Text>
      </View>
    </Pressable>
  );
  if (href) {
    return (
      <Link href={href} asChild>
        {button}
      </Link>
    );
  }
  return button;
}

export function TextAction({ label, href }: { label: string; href: Href }) {
  return (
    <Link href={href} asChild>
      <Pressable accessibilityRole="button">
        <View style={styles.textAction}>
          <Text style={styles.textActionLabel}>{label}</Text>
        </View>
      </Pressable>
    </Link>
  );
}

export function Field({
  label,
  value,
  onChangeText,
  multiline = false,
  error,
  secure = false,
  keyboardType,
  autoComplete,
  textContentType,
  autoCapitalize = "sentences",
  inputRef,
  returnKeyType,
  onSubmitEditing,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  multiline?: boolean;
  error?: string;
  secure?: boolean;
  keyboardType?: TextInputProps["keyboardType"];
  autoComplete?: TextInputProps["autoComplete"];
  textContentType?: TextInputProps["textContentType"];
  autoCapitalize?: TextInputProps["autoCapitalize"];
  inputRef?: Ref<TextInput>;
  returnKeyType?: TextInputProps["returnKeyType"];
  onSubmitEditing?: () => void;
}) {
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(true);
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View>
        <TextInput
          ref={inputRef}
          accessibilityLabel={label}
          value={value}
          onChangeText={onChangeText}
          multiline={multiline}
          secureTextEntry={secure && hidden}
          keyboardType={keyboardType}
          autoComplete={autoComplete}
          textContentType={textContentType}
          autoCapitalize={autoCapitalize}
          autoCorrect={false}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
          placeholderTextColor={theme.muted}
          selectionColor={theme.forest}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={[
            styles.input,
            webOutline,
            multiline && styles.inputMulti,
            secure && styles.inputSecure,
            focused && styles.inputFocus,
            error ? styles.inputError : null,
          ]}
        />
        {secure ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={hidden ? "Show password" : "Hide password"}
            onPress={() => setHidden((current) => !current)}
            style={styles.eye}
          >
            {hidden ? (
              <Eye color={theme.muted} size={18} strokeWidth={2} />
            ) : (
              <EyeOff color={theme.muted} size={18} strokeWidth={2} />
            )}
          </Pressable>
        ) : null}
      </View>
      {error ? <Text style={styles.fieldError}>{error}</Text> : null}
    </View>
  );
}

export function FormError({ children }: { children: ReactNode }) {
  return (
    <Text accessibilityRole="alert" style={styles.formError}>
      {children}
    </Text>
  );
}

export function Chip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[styles.chip, selected && styles.chipSelected]}
    >
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
        {label}
      </Text>
    </Pressable>
  );
}

export function Fact({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.fact}>
      <Text style={styles.factLabel}>{label}</Text>
      <Text style={styles.factValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.canvas,
  },
  screenContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 40,
  },
  pageContent: {
    paddingHorizontal: 20,
    paddingBottom: 36,
    flexGrow: 1,
  },
  forestScroll: {
    flex: 1,
    backgroundColor: theme.forest,
  },
  forestContent: {
    flexGrow: 1,
    backgroundColor: theme.canvas,
  },
  forest: {
    backgroundColor: theme.forest,
    paddingHorizontal: 20,
    paddingBottom: 52,
    minHeight: 196,
    overflow: "hidden",
  },
  art: {
    position: "absolute",
    right: -24,
    top: 12,
  },
  sheet: {
    flexGrow: 1,
    backgroundColor: theme.canvas,
    marginTop: -28,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 36,
  },
  signRoot: {
    flex: 1,
    backgroundColor: theme.green,
  },
  signScroll: {
    flexGrow: 1,
  },
  signHero: {
    backgroundColor: theme.green,
    paddingHorizontal: 24,
    paddingBottom: 48,
    overflow: "hidden",
    minHeight: 220,
  },
  loginArt: {
    position: "absolute",
    right: -30,
    top: 20,
  },
  mark: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: theme.forest,
    alignItems: "center",
    justifyContent: "center",
  },
  markText: {
    color: theme.onForest,
    fontFamily: font.display,
    fontSize: 20,
    lineHeight: 26,
  },
  brand: {
    marginTop: 16,
    color: theme.ink,
    fontFamily: font.display,
    fontSize: 32,
    lineHeight: 38,
    letterSpacing: -0.4,
  },
  brandSub: {
    marginTop: 4,
    color: theme.forest,
    fontFamily: font.medium,
    fontSize: 16,
    lineHeight: 22,
  },
  signSheet: {
    flexGrow: 1,
    backgroundColor: theme.canvas,
    marginTop: -28,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 28,
  },
  wordmark: {
    color: theme.onForest,
    fontFamily: font.strong,
    fontSize: 16,
    lineHeight: 22,
  },
  forestTitle: {
    marginTop: 18,
    color: theme.onForest,
    fontFamily: font.display,
    fontSize: 32,
    lineHeight: 38,
    letterSpacing: -0.4,
  },
  forestSub: {
    marginTop: 6,
    marginBottom: 8,
    color: theme.onForestMuted,
    fontFamily: font.body,
    fontSize: 16,
    lineHeight: 22,
  },
  searchBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.16)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerSearch: {
    marginTop: 16,
    minHeight: 48,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.14)",
    paddingHorizontal: 16,
    color: theme.onForest,
    fontFamily: font.body,
    fontSize: 16,
  },
  title: {
    color: theme.ink,
    fontFamily: font.display,
    fontSize: 28,
    lineHeight: 34,
    letterSpacing: -0.4,
  },
  heading: {
    color: theme.ink,
    fontFamily: font.display,
    fontSize: 22,
    lineHeight: 28,
    letterSpacing: -0.3,
    marginTop: 28,
    marginBottom: 4,
  },
  sectionTitle: {
    color: theme.ink,
    fontFamily: font.display,
    fontSize: 22,
    lineHeight: 28,
    letterSpacing: -0.3,
  },
  sectionSub: {
    color: theme.muted,
    fontFamily: font.body,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 2,
    marginBottom: 16,
  },
  body: {
    color: theme.ink,
    fontFamily: font.body,
    fontSize: 16,
    lineHeight: 24,
    marginTop: 8,
  },
  meta: {
    color: theme.muted,
    fontFamily: font.body,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
  },
  figure: {
    color: theme.forest,
    fontFamily: font.display,
    fontSize: 40,
    lineHeight: 46,
    letterSpacing: -0.6,
    fontVariant: ["tabular-nums"],
    marginTop: 8,
  },
  dateHero: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dateMain: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  dateNum: {
    color: theme.ink,
    fontFamily: font.display,
    fontSize: 48,
    lineHeight: 54,
    letterSpacing: -1,
    fontVariant: ["tabular-nums"],
  },
  dateWeek: {
    color: theme.ink,
    fontFamily: font.strong,
    fontSize: 14,
    lineHeight: 18,
  },
  dateMonth: {
    color: theme.muted,
    fontFamily: font.body,
    fontSize: 14,
    lineHeight: 18,
    marginTop: 2,
  },
  today: {
    minHeight: 44,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: theme.greenWash,
    alignItems: "center",
    justifyContent: "center",
  },
  todayText: {
    color: theme.forest,
    fontFamily: font.strong,
    fontSize: 14,
  },
  week: {
    flexDirection: "row",
    marginTop: 18,
  },
  weekCell: {
    flex: 1,
    alignItems: "center",
    minHeight: 64,
  },
  weekLetter: {
    color: theme.muted,
    fontFamily: font.strong,
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 6,
  },
  weekDay: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  weekDayOn: {
    backgroundColor: theme.orange,
  },
  weekDayText: {
    color: theme.ink,
    fontFamily: font.strong,
    fontSize: 14,
    fontVariant: ["tabular-nums"],
  },
  rule: {
    height: 1,
    backgroundColor: theme.line,
    marginTop: 8,
  },
  columnHead: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 14,
    gap: 10,
  },
  columnLabel: {
    color: theme.muted,
    fontFamily: font.medium,
    fontSize: 13,
    lineHeight: 18,
  },
  timeCol: {
    width: 56,
  },
  flex: {
    flex: 1,
  },
  scheduleRow: {
    flexDirection: "row",
    alignItems: "stretch",
    gap: 10,
    marginTop: 14,
  },
  schedulePrimary: {
    color: theme.ink,
    fontFamily: font.strong,
    fontSize: 13,
    lineHeight: 18,
    fontVariant: ["tabular-nums"],
  },
  scheduleSecondary: {
    color: theme.muted,
    fontFamily: font.body,
    fontSize: 12,
    lineHeight: 16,
    marginTop: 2,
  },
  scheduleRule: {
    width: 1,
    backgroundColor: theme.line,
  },
  lesson: {
    backgroundColor: theme.card,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 16,
    minHeight: 84,
    overflow: "hidden",
    justifyContent: "center",
  },
  lessonOn: {
    backgroundColor: theme.mint,
  },
  lessonBlob: {
    position: "absolute",
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: theme.green,
    opacity: 0.35,
    right: -36,
    bottom: -56,
  },
  lessonTitle: {
    color: theme.ink,
    fontFamily: font.strong,
    fontSize: 16,
    lineHeight: 22,
  },
  lessonDetail: {
    color: "#243036",
    fontFamily: font.body,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
  },
  tile: {
    width: 148,
    height: 132,
    borderRadius: 22,
    padding: 14,
    marginRight: 12,
    borderWidth: 2,
    borderColor: "transparent",
  },
  tileOn: {
    borderColor: theme.ink,
  },
  tileBody: {
    flex: 1,
    justifyContent: "space-between",
  },
  tileLabel: {
    fontFamily: font.strong,
    fontSize: 16,
    lineHeight: 21,
  },
  orange: {
    backgroundColor: theme.orange,
  },
  purple: {
    backgroundColor: theme.purple,
  },
  mint: {
    backgroundColor: theme.mint,
  },
  forestTone: {
    backgroundColor: theme.forest,
  },
  row: {
    marginTop: 12,
    backgroundColor: theme.card,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 16,
    minHeight: 76,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  rowTitle: {
    color: theme.ink,
    fontFamily: font.strong,
    fontSize: 16,
    lineHeight: 22,
  },
  aside: {
    color: theme.muted,
    fontFamily: font.medium,
    fontSize: 13,
    fontVariant: ["tabular-nums"],
  },
  choice: {
    marginTop: 10,
    backgroundColor: theme.card,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 64,
    justifyContent: "center",
  },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: theme.greenWash,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginTop: 10,
  },
  badgeText: {
    color: theme.forest,
    fontFamily: font.strong,
    fontSize: 13,
    lineHeight: 18,
  },
  primary: {
    marginTop: 16,
    minHeight: 52,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: theme.forest,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryDanger: {
    backgroundColor: theme.danger,
  },
  primaryText: {
    color: theme.onForest,
    fontFamily: font.strong,
    fontSize: 16,
  },
  primaryTextDanger: {
    color: theme.white,
  },
  quiet: {
    marginTop: 12,
    minHeight: 52,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: theme.card,
    alignItems: "center",
    justifyContent: "center",
  },
  quietSelected: {
    backgroundColor: theme.greenWash,
  },
  quietText: {
    color: theme.ink,
    fontFamily: font.strong,
    fontSize: 16,
  },
  quietTextSelected: {
    color: theme.forest,
  },
  textAction: {
    minHeight: 44,
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  textActionLabel: {
    color: theme.forest,
    fontFamily: font.strong,
    fontSize: 15,
  },
  field: {
    marginTop: 16,
  },
  fieldLabel: {
    color: theme.ink,
    fontFamily: font.strong,
    fontSize: 14,
    lineHeight: 18,
    marginBottom: 8,
  },
  input: {
    minHeight: 52,
    borderWidth: 2,
    borderColor: "transparent",
    borderRadius: 16,
    backgroundColor: theme.card,
    paddingHorizontal: 16,
    color: theme.ink,
    fontFamily: font.body,
    fontSize: 16,
  },
  inputMulti: {
    minHeight: 112,
    paddingTop: 14,
    textAlignVertical: "top",
  },
  inputSecure: {
    paddingRight: 52,
  },
  inputFocus: {
    borderColor: theme.forest,
    backgroundColor: theme.canvas,
  },
  inputError: {
    borderColor: theme.danger,
  },
  eye: {
    position: "absolute",
    right: 4,
    top: 4,
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  fieldError: {
    color: theme.danger,
    fontFamily: font.body,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 6,
  },
  formError: {
    color: theme.danger,
    fontFamily: font.medium,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 12,
  },
  chip: {
    minHeight: 44,
    paddingHorizontal: 14,
    marginRight: 8,
    borderRadius: 14,
    backgroundColor: theme.card,
    alignItems: "center",
    justifyContent: "center",
  },
  chipSelected: {
    backgroundColor: theme.greenWash,
  },
  chipText: {
    color: theme.ink,
    fontFamily: font.strong,
    fontSize: 14,
  },
  chipTextSelected: {
    color: theme.forest,
  },
  fact: {
    marginTop: 10,
    backgroundColor: theme.card,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  factLabel: {
    color: theme.muted,
    fontFamily: font.body,
    fontSize: 13,
    lineHeight: 18,
  },
  factValue: {
    color: theme.ink,
    fontFamily: font.strong,
    fontSize: 16,
    lineHeight: 22,
    marginTop: 2,
    fontVariant: ["tabular-nums"],
  },
});
