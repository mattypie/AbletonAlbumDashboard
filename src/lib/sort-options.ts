export const SORT_OPTIONS = [
  { value: "finish", label: "Closest to Finish" },
  { value: "neglected", label: "Most Neglected" },
  { value: "time", label: "Most Time Invested" },
  { value: "blocked", label: "Blocked" },
] as const;

export type SortValue = (typeof SORT_OPTIONS)[number]["value"];

export const DEFAULT_SORT: SortValue = "finish";
