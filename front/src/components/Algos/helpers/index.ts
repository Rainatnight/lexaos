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

export const insertionSortSteps = (arr: number[]): SortStep[] => {
  const steps: SortStep[] = [];
  const a = [...arr];
  const states: BarState[] = Array(a.length).fill("default");

  for (let i = 1; i < a.length; i++) {
    const key = a[i];
    let j = i - 1;

    // Шаг: берем ключевой элемент
    const keyStates = [...states];
    keyStates[i] = "compare";
    steps.push({
      array: [...a],
      states: keyStates,
      action: "compare",
      indices: [i],
    });

    // Сдвигаем элементы отсортированной части вправо
    while (j >= 0 && a[j] > key) {
      // Сравнение
      const compareStates: BarState[] = Array(a.length).fill("default");
      compareStates[j] = "compare";
      compareStates[j + 1] = "compare";
      steps.push({
        array: [...a],
        states: compareStates,
        action: "compare",
        indices: [j, j + 1],
      });

      // Сдвиг вправо
      a[j + 1] = a[j];
      const shiftStates: BarState[] = Array(a.length).fill("default");
      shiftStates[j] = "swap";
      shiftStates[j + 1] = "swap";
      steps.push({
        array: [...a],
        states: shiftStates,
        action: "swap",
        indices: [j, j + 1],
      });

      j--;
    }

    // Вставка key
    a[j + 1] = key;
    const insertStates: BarState[] = Array(a.length).fill("default");
    insertStates[j + 1] = "swap";
    steps.push({
      array: [...a],
      states: insertStates,
      action: "swap",
      indices: [j + 1],
    });

    // Отмечаем все элементы до i как отсортированные
    const doneStates = [...states];
    for (let k = 0; k <= i; k++) doneStates[k] = "sorted";
    steps.push({
      array: [...a],
      states: doneStates,
      action: "done",
    });
  }

  return steps;
};

export const quickSortSteps = (array: number[]): SortStep[] => {
  const steps: SortStep[] = [];
  const arr = [...array];

  const partition = (low: number, high: number): number => {
    const pivot = arr[high];
    let i = low - 1;

    for (let j = low; j < high; j++) {
      // Сравнение с pivot
      const compareStates: BarState[] = Array(arr.length).fill("default");
      compareStates[j] = "compare";
      compareStates[high] = "compare"; // pivot
      steps.push({
        array: [...arr],
        states: compareStates,
        action: "compare",
        indices: [j, high],
      });

      if (arr[j] <= pivot) {
        i++;
        // Меняем местами arr[i] и arr[j]
        [arr[i], arr[j]] = [arr[j], arr[i]];
        const swapStates: BarState[] = Array(arr.length).fill("default");
        swapStates[i] = "swap";
        swapStates[j] = "swap";
        steps.push({
          array: [...arr],
          states: swapStates,
          action: "swap",
          indices: [i, j],
        });
      }
    }

    // Меняем местами pivot с arr[i+1]
    [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
    const pivotSwapStates: BarState[] = Array(arr.length).fill("default");
    pivotSwapStates[i + 1] = "swap";
    pivotSwapStates[high] = "swap";
    steps.push({
      array: [...arr],
      states: pivotSwapStates,
      action: "swap",
      indices: [i + 1, high],
    });

    return i + 1;
  };

  const quickSort = (low: number, high: number) => {
    if (low < high) {
      const pi = partition(low, high);
      quickSort(low, pi - 1);
      quickSort(pi + 1, high);
    } else if (low === high) {
      // Один элемент - сразу отсортирован
      const doneStates: BarState[] = Array(arr.length).fill("default");
      doneStates[low] = "sorted";
      steps.push({
        array: [...arr],
        states: doneStates,
        action: "done",
        indices: [low],
      });
    }
  };

  quickSort(0, arr.length - 1);

  // Отмечаем все элементы как отсортированные в конце
  steps.push({
    array: [...arr],
    states: Array(arr.length).fill("sorted") as BarState[],
    action: "done",
    indices: [],
  });

  return steps;
};
