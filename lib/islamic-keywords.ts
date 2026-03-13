export const ISLAMIC_KEYWORDS = [
  "allah",
  "muslim",
  "islam",
  "islamic",
  "deen",
  "ummah",
  "quran",
  "qur'an",
  "hadith",
  "sunnah",
  "dua",
  "dhikr",
  "salah",
  "salat",
  "zakat",
  "sadaqah",
  "ramadan",
  "eid",
  "halal",
  "masjid",
  "mosque",
  "hajj",
  "umrah",
  "adhan",
  "qibla",
  "tafsir",
  "surah",
  "ayah",
  "fiqh",
  "imam",
  "shariah",
  "nikah",
  "waqf",
  "makkah",
  "mecca",
  "madinah",
  "medina",
  "prophet muhammad",
] as const;

export function normalizeKeywordText(value: string) {
  return value
    .normalize("NFKD")
    .replace(/\p{Mark}/gu, "")
    .toLowerCase();
}

export function findIslamicKeywordMatches(
  ...parts: Array<string | null | undefined>
) {
  const text = normalizeKeywordText(parts.filter(Boolean).join(" "));
  const matches = new Set<string>();

  for (const keyword of ISLAMIC_KEYWORDS) {
    if (text.includes(normalizeKeywordText(keyword))) {
      matches.add(keyword);
    }
  }

  return [...matches];
}
