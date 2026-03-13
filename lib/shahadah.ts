export const SHAHADAH_OPTIONS = [
  {
    value: "english",
    label: "English",
    phrase:
      "I bear witness that there is no deity but Allah, and I bear witness that Muhammad is the Messenger of Allah",
  },
  {
    value: "arabic",
    label: "Arabic",
    phrase: "أشهد أن لا إله إلا الله وأشهد أن محمدًا رسول الله",
  },
  {
    value: "transliteration",
    label: "Transliteration",
    phrase:
      "Ashhadu an la ilaha illa Allah wa ashhadu anna Muhammadan rasul Allah",
  },
] as const;

export type ShahadahLanguage = (typeof SHAHADAH_OPTIONS)[number]["value"];

export function normalizeShahadahText(value: string) {
  return value
    .normalize("NFKD")
    .replace(/\p{Mark}/gu, "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "");
}

export function getShahadahOption(language: string) {
  return SHAHADAH_OPTIONS.find((option) => option.value === language);
}

export function isValidShahadahResponse(
  language: string,
  responseText: string,
) {
  const option = getShahadahOption(language);
  if (!option) return false;
  return (
    normalizeShahadahText(responseText) ===
    normalizeShahadahText(option.phrase)
  );
}
