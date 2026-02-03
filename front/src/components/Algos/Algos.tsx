import React, { useEffect, useState } from "react";
import cls from "./Algos.module.scss";
import { bubbleSortSteps } from "./helpers";
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
  const { t } = useTranslation("algos");

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
      <OptionsSelect algo={algo} setAlgo={setAlgo} />

      <Bars array={array} barStates={barStates} />

      <div className={cls.controls}>
        <button onClick={() => generateArray()} className={cls.button}>
          {t("Новый массив")}
        </button>
        <button onClick={startSorting} className={cls.button}>
          {t("Старт")}
        </button>
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
