import { BarState, SortStep } from "./types";

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

export const mergeSortSteps = (array: number[]): SortStep[] => {
  const steps: SortStep[] = [];
  const arr = [...array];

  const merge = (start: number, mid: number, end: number) => {
    const left = arr.slice(start, mid + 1);
    const right = arr.slice(mid + 1, end + 1);

    let i = 0,
      j = 0,
      k = start;

    while (i < left.length && j < right.length) {
      // Сравнение элементов
      const compareStates: BarState[] = Array(arr.length).fill("default");
      compareStates[start + i] = "compare";
      compareStates[mid + 1 + j] = "compare";
      steps.push({
        array: [...arr],
        states: compareStates,
        action: "compare",
        indices: [start + i, mid + 1 + j],
      });

      if (left[i] <= right[j]) {
        arr[k] = left[i];
        i++;
      } else {
        arr[k] = right[j];
        j++;
      }

      // Запись элемента
      const swapStates: BarState[] = Array(arr.length).fill("default");
      swapStates[k] = "swap";
      steps.push({
        array: [...arr],
        states: swapStates,
        action: "swap",
        indices: [k],
      });

      k++;
    }

    // Остатки левой части
    while (i < left.length) {
      arr[k] = left[i];
      const stateArr: BarState[] = Array(arr.length).fill("default");
      stateArr[k] = "swap";
      steps.push({
        array: [...arr],
        states: stateArr,
        action: "swap",
        indices: [k],
      });
      i++;
      k++;
    }

    // Остатки правой части
    while (j < right.length) {
      arr[k] = right[j];
      const stateArr: BarState[] = Array(arr.length).fill("default");
      stateArr[k] = "swap";
      steps.push({
        array: [...arr],
        states: stateArr,
        action: "swap",
        indices: [k],
      });
      j++;
      k++;
    }
  };

  const mergeSort = (start: number, end: number) => {
    if (start >= end) return;
    const mid = Math.floor((start + end) / 2);
    mergeSort(start, mid);
    mergeSort(mid + 1, end);
    merge(start, mid, end);
  };

  mergeSort(0, arr.length - 1);

  // Отмечаем все элементы как отсортированные
  steps.push({
    array: [...arr],
    states: Array(arr.length).fill("sorted") as BarState[],
    action: "done",
    indices: [],
  });

  return steps;
};
