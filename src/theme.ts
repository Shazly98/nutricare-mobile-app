import { Platform, type TextStyle, type ViewStyle } from "react-native";

/** Hex equivalents of the storefront tokens in `src/styles.css`. */
export const colors = {
  background: "#fcfaf1",
  foreground: "#101f13",
  card: "#ffffff",
  primary: "#2e9226",
  primaryGlow: "#61bf3a",
  primaryFg: "#fcfcfc",
  primary5: "rgba(46,146,38,0.05)",
  primary10: "rgba(46,146,38,0.10)",
  primary20: "rgba(46,146,38,0.20)",
  primary25: "rgba(46,146,38,0.25)",
  primary30: "rgba(46,146,38,0.30)",
  primary40: "rgba(46,146,38,0.40)",
  secondary: "#e9f2e1",
  muted: "#edf0e5",
  mutedFg: "#5d665b",
  accent: "#ddeed4",
  destructive: "#ee362f",
  destructive5: "rgba(238,54,47,0.05)",
  destructive10: "rgba(238,54,47,0.10)",
  destructive20: "rgba(238,54,47,0.20)",
  border: "#dae1d3",
  border60: "rgba(218,225,211,0.6)",
  input: "#e1e7dc",
  cream: "#faf5e6",
  softEnd: "#ebf2e1",
  white: "#ffffff",

  headerLine: "#e7f0e3",
  searchBg: "#f7fbf4",
  searchLine: "#d7ead0",
  sectionAlt: "#f6f8f3",
  catalogBg: "#faf9f3",
  tabIdle: "#9aa6b2",
  cardLine: "#e9ece6",
  addGreen: "#248638",
  priceGreen: "#168331",
  title: "#23394a",
  blurb: "#7a847e",
  brandBadgeBg: "#eef5ed",
  brandBadgeFg: "#235438",
  offerInk: "#173222",
  offerGreen: "#1d6b32",
  offerPill: "#e7f6d8",
  offerBody: "#4d6356",
  iherbBg: "#10261a",
  lime: "#c6ee4a",
  whatsapp: "#25D366",
};

export const gradients = {
  primary: [colors.primary, colors.primaryGlow] as const,
  soft: [colors.cream, colors.softEnd] as const,
};

/** Cairo is the site's display face (h1–h4); Tajawal is the body face. */
export const fonts = {
  display700: "Cairo_700Bold",
  display800: "Cairo_800ExtraBold",
  display900: "Cairo_900Black",
  body400: "Tajawal_400Regular",
  body500: "Tajawal_500Medium",
  body700: "Tajawal_700Bold",
  body800: "Tajawal_800ExtraBold",
  body900: "Tajawal_900Black",
};

export const shadows = {
  soft: "0px 10px 30px -12px rgba(46,146,38,0.25)",
  card: "0px 4px 16px -6px rgba(46,146,38,0.18)",
  product: "0px 5px 20px 0px rgba(35,62,40,0.045)",
  add: "0px 4px 12px 0px rgba(36,134,56,0.2)",
};

/** Tailwind type scale used by the site: [fontSize, lineHeight]. */
export const text = {
  xs: { fontSize: 12, lineHeight: 16 },
  sm: { fontSize: 14, lineHeight: 20 },
  base: { fontSize: 16, lineHeight: 24 },
  lg: { fontSize: 18, lineHeight: 28 },
  xl: { fontSize: 20, lineHeight: 28 },
  "2xl": { fontSize: 24, lineHeight: 32 },
  "3xl": { fontSize: 30, lineHeight: 38 },
} satisfies Record<string, TextStyle>;

export const PAGE_X = 16;

/** Width of one cell in the site's `grid-cols-2 gap-3` grid inside `px-4`. */
export function twoColWidth(screenWidth: number) {
  return Math.floor((screenWidth - PAGE_X * 2 - 12) / 2);
}

/**
 * Native flips `left`/`right` text alignment in RTL, the web does not.
 * Returns the value that means "start of line" on the current platform.
 */
export function startAlign(isRTL: boolean): TextStyle["textAlign"] {
  if (Platform.OS === "web") return isRTL ? "right" : "left";
  return "left";
}

export function endAlign(isRTL: boolean): TextStyle["textAlign"] {
  if (Platform.OS === "web") return isRTL ? "left" : "right";
  return "right";
}

/** Keeps a row left-to-right in Arabic, like the site's `dir="ltr"`. Use the style and spread the props together. */
export const ltrStyle: ViewStyle = Platform.OS === "web" ? {} : { direction: "ltr" };
export const ltrProps = (Platform.OS === "web" ? { dir: "ltr" } : {}) as object;
