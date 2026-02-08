import React, { useEffect, useRef, useState } from "react";
import cls from "./Algos.module.scss";
import {
  bubbleSortSteps,
  mergeSortSteps,
  insertionSortSteps,
  quickSortSteps,
} from "./helpers";
import { useTranslation } from "react-i18next";
import { AlgoType, BarState, SortStep } from "./helpers/types";
import { OptionsSelect } from "./OptionsSelect/OptionsSelect";
import { Bars } from "./Bars/Bars";

const actionText: Record<SortStep["action"], string> = {
  compare: "Сравниваются элементы",
  swap: "Происходит обмен элементов",
  done: "Элемент зафиксирован как отсортированный",
};

const algoDescriptions: Record<AlgoType, string> = {
  bubble:
    "Пузырьковая сортировка — простейший алгоритм сортировки, который многократно проходит по массиву, сравнивая соседние элементы и меняя их местами, если они стоят в неправильном порядке. Проходы повторяются до тех пор, пока массив полностью не отсортирован. Алгоритм получил название из-за того, что большие элементы «всплывают» к концу массива, подобно пузырькам в воде.",
  quick:
    "Быстрая сортировка (Quick Sort) выбирает опорный элемент и разделяет массив на части: элементы меньше опорного и больше. Рекурсивно сортирует части. Эффективна на больших данных. O(n log n) в среднем.",
  merge:
    "Сортировка слиянием (Merge Sort) рекурсивно делит массив на половины и затем объединяет их, формируя отсортированный массив. Хорошо работает на больших данных. O(n log n)",
  insertion:
    "Сортировка вставками последовательно берёт каждый элемент и вставляет его в нужное место в уже отсортированной части массива. Хорошо работает на небольших данных. Лучший O(n) остальные n^2",
};

const sortingAlgorithms: Record<string, (arr: number[]) => SortStep[]> = {
  bubble: bubbleSortSteps,
  merge: mergeSortSteps,
  insertion: insertionSortSteps,
  quick: quickSortSteps,
};

export const Algos = () => {
  const [algo, setAlgo] = useState<AlgoType>("bubble");
  const [array, setArray] = useState<number[]>([]);
  const [barStates, setBarStates] = useState<BarState[]>([]);
  const [steps, setSteps] = useState<SortStep[]>([]);
  const [stepIndex, setStepIndex] = useState(0);
  const { t } = useTranslation("algos");
  const [isPlaying, setIsPlaying] = useState(false);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startSorting = (auto = false) => {
    const generateSteps = sortingAlgorithms[algo];
    if (!generateSteps) return;

    const generatedSteps = generateSteps(array);
    if (!generatedSteps.length) return;

    setSteps(generatedSteps);
    setStepIndex(0);
    setArray(generatedSteps[0].array);
    setBarStates(generatedSteps[0].states);

    if (auto) {
      setIsPlaying(true);
    }
  };

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

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setStepIndex((prev) => {
          if (prev >= steps.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          const next = prev + 1;
          setArray(steps[next].array);
          setBarStates(steps[next].states);
          return next;
        });
      }, 500);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, steps]);

  return (
    <div className={cls.wrapper}>
      <OptionsSelect
        algo={algo}
        setAlgo={setAlgo}
        generateArray={generateArray}
      />

      <Bars array={array} barStates={barStates} />

      <div className={cls.controls}>
        <button onClick={() => generateArray()} className={cls.button}>
          {t("Новый массив")}
        </button>

        <button onClick={() => startSorting(false)} className={cls.button}>
          {t("Старт пошаговый")}
        </button>

        <button onClick={() => startSorting(true)} className={cls.button}>
          {t("Старт автоматический")}
        </button>

        {isPlaying && (
          <button onClick={() => setIsPlaying(false)} className={cls.button}>
            {t("Стоп")}
          </button>
        )}
      </div>

      {steps.length > 0 && (
        <>
          <div>
            {t("Шаг")} {stepIndex + 1} {t("из")} {steps.length}
          </div>

          <div className={cls.stepDescription}>
            {getActionDescription(steps[stepIndex])}
          </div>

          <div className={cls.controls}>
            <button
              onClick={prevStep}
              disabled={stepIndex === 0}
              className={cls.button}
            >
              ← {t("Назад")}
            </button>

            <button
              onClick={nextStep}
              disabled={stepIndex >= steps.length - 1}
              className={cls.button}
            >
              {t("Вперёд")} →
            </button>
          </div>
        </>
      )}

      <div className={cls.description}>{algoDescriptions[algo]}</div>
    </div>
  );
};
