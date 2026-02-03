export type AlgoType = "bubble" | "quick" | "merge" | "insertion";

export type BarState = "default" | "compare" | "swap" | "sorted";

export interface SortStep {
  array: number[];
  states: BarState[];
  action: "compare" | "swap" | "done";
  indices?: number[]; // какие элементы участвуют
}
