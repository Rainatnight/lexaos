import { BarState, SortStep } from "../Algos";

export const bubbleSortSteps = (arr: number[]): SortStep[] => {
  const steps: SortStep[] = [];
  const a = [...arr];
  const states: BarState[] = Array(a.length).fill("default");

  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < a.length - i - 1; j++) {
      const currentStates = [...states];
      currentStates[j] = "compare";
      currentStates[j + 1] = "compare";

      steps.push({
        array: [...a],
        states: currentStates,
        action: "compare",
        indices: [j, j + 1],
      });

      if (a[j] > a[j + 1]) {
        [a[j], a[j + 1]] = [a[j + 1], a[j]];

        const swapStates = [...states];
        swapStates[j] = "swap";
        swapStates[j + 1] = "swap";

        steps.push({
          array: [...a],
          states: swapStates,
          action: "swap",
          indices: [j, j + 1],
        });
      }
    }

    // последний элемент отсортирован
    states[a.length - i - 1] = "sorted";

    steps.push({
      array: [...a],
      states: [...states],
      action: "done",
    });
  }

  return steps;
};
