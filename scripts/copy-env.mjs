import fs from "node:fs";

const raw = fs.readFileSync(new URL("../../.env", import.meta.url), "utf8");
const map = {};
for (const line of raw.split(/\r?\n/)) {
  const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (!match) continue;
  map[match[1]] = match[2].replace(/^["']|["']$/g, "");
}

const lines = [
  `EXPO_PUBLIC_SUPABASE_URL=${map.VITE_SUPABASE_URL || map.SUPABASE_URL || ""}`,
  `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=${map.VITE_SUPABASE_PUBLISHABLE_KEY || map.SUPABASE_PUBLISHABLE_KEY || ""}`,
  `EXPO_PUBLIC_ADMIN_EMAIL=${map.VITE_ADMIN_EMAIL || ""}`,
  "EXPO_PUBLIC_SITE_URL=https://nutricare-eg.com",
  "",
];

fs.writeFileSync(new URL("../.env", import.meta.url), lines.join("\n"));
for (const line of lines.filter(Boolean)) {
  const [key, value] = line.split("=");
  console.log(`${key}:${value ? "set" : "empty"}`);
}
