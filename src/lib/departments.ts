export type Department = { id: string; om: string; en: string };

export const DEPARTMENTS: Department[] = [
  { id: "ai-editing", om: "Gulaalcha AI", en: "AI Editing" },
  { id: "telegram-earning", om: "Telegram irraa Galii Argachuu", en: "Telegram Earning" },
  { id: "bot-automation", om: "Bot Automation", en: "Bot Automation" },
  { id: "web-development", om: "Marsariitii Ijaaruu", en: "Web Development" },
  { id: "graphics-design", om: "Dizaayinii Giraafiksii", en: "Graphics Design" },
  { id: "other", om: "Kan biraa", en: "Other" },
];

export function departmentLabel(id: string | undefined, lang: "om" | "en"): string {
  const d = DEPARTMENTS.find((x) => x.id === id);
  if (!d) return id ?? "";
  return lang === "om" ? d.om : d.en;
}
