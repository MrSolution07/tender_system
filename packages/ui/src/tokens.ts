/** Light banking palette shared by the web desk and later Expo apps. */
export const tokens = {
  canvas: "#F4F7F8",
  surface: "#FFFFFF",
  ink: "#122027",
  muted: "#3E5159",
  line: "#D5E0E3",
  teal: "#006E78",
  tealInk: "#F4FFFE",
  highlight: "#F26B1D",
  radius: "1rem",
} as const;

export type TokenName = keyof typeof tokens;
