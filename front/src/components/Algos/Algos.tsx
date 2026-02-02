import React, { useEffect, useState } from "react";
import cls from "./Algos.module.scss";
import { bubbleSortSteps } from "./helpers";

type AlgoType = "bubble" | "quick" | "merge" | "insertion";

export type BarState = "default" | "compare" | "swap" | "sorted";

export interface SortStep {
  array: number[];
  states: BarState[];
  action: "compare" | "swap" | "done";
  indices?: number[]; // какие элементы участвуют
}

const actionText: Record<SortStep["action"], string> = {
  compare: "Сравниваются элементы",
  swap: "Происходит обмен элементов",
  done: "Элемент зафиксирован как отсортированный",
};

const algoDescriptions: Record<AlgoType, string> = {
  bubble: "Пузырьковая сортировка — простейший алгоритм...",
  quick: "Быстрая сортировка использует принцип разделяй и властвуй...",
  merge: "Сортировка слиянием рекурсивно делит массив...",
  insertion: "Сортировка вставками последовательно вставляет элементы...",
};

export const Algos = () => {
  const [algo, setAlgo] = useState<AlgoType>("bubble");
  const [array, setArray] = useState<number[]>([]);
  const [barStates, setBarStates] = useState<BarState[]>([]);
  const [steps, setSteps] = useState<SortStep[]>([]);
  const [stepIndex, setStepIndex] = useState(0);

  const generateArray = (size = 30) => {
    const arr = Array.from(
      { length: size },
      () => Math.floor(Math.random() * 100) + 10,
    );

    setArray(arr);
    setBarStates(Array(size).fill("default"));
    setSteps([]);
    setStepIndex(0);
  };

  const startSorting = () => {
    let generatedSteps: SortStep[] = [];

    if (algo === "bubble") {
      generatedSteps = bubbleSortSteps(array);
    }

    if (!generatedSteps.length) return;

    setSteps(generatedSteps);
    setStepIndex(0);
    setArray(generatedSteps[0].array);
    setBarStates(generatedSteps[0].states);
  };

  const nextStep = () => {
    if (stepIndex >= steps.length - 1) return;

    const next = stepIndex + 1;
    setStepIndex(next);
    setArray(steps[next].array);
    setBarStates(steps[next].states);
  };

  const prevStep = () => {
    if (stepIndex <= 0) return;

    const prev = stepIndex - 1;
    setStepIndex(prev);
    setArray(steps[prev].array);
    setBarStates(steps[prev].states);
  };

  const getActionDescription = (step?: SortStep) => {
    if (!step) return "";

    const { action, indices, array } = step;

    if (!indices || indices.length < 2) {
      return actionText[action];
    }

    const [i, j] = indices;

    switch (action) {
      case "compare":
        return `Сравниваются элементы ${array[i]} и ${array[j]}`;
      case "swap":
        return `Меняем местами ${array[j]} и ${array[i]}`;
      case "done":
        return "Сортировка завершена";
      default:
        return "";
    }
  };

  useEffect(() => {
    generateArray(30);
  }, []);

  return (
    <div className={cls.wrapper}>
      <select
        value={algo}
        onChange={(e) => setAlgo(e.target.value as AlgoType)}
      >
        <option value="bubble">Пузырьковая</option>
        <option value="quick">Быстрая</option>
        <option value="merge">Слиянием</option>
        <option value="insertion">Вставками</option>
      </select>

      <div className={cls.bars}>
        {array.map((value, index) => (
          <div key={index} className={cls.barWrapper}>
            <div className={cls.value}>{value}</div>

            <div
              className={`${cls.bar} ${cls[barStates[index] || "default"]}`}
              style={{ height: `${value * 3}px` }}
            />
          </div>
        ))}
      </div>

      <div className={cls.controls}>
        <button onClick={() => generateArray()}>Новый массив</button>
        <button onClick={startSorting}>Старт</button>
      </div>

      <div className={cls.description}>{algoDescriptions[algo]}</div>

      {steps.length > 0 && (
        <>
          <div>
            Шаг {stepIndex + 1} из {steps.length}
          </div>

          <div className={cls.stepDescription}>
            {getActionDescription(steps[stepIndex])}
          </div>

          <div className={cls.controls}>
            <button onClick={prevStep} disabled={stepIndex === 0}>
              ← Назад
            </button>

            <button onClick={nextStep} disabled={stepIndex >= steps.length - 1}>
              Вперёд →
            </button>
          </div>
        </>
      )}
    </div>
  );
};
