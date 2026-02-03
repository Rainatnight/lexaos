import React from "react";
import cls from "./OptionsSelect.module.scss";
import { useTranslation } from "react-i18next";
import { AlgoType } from "../helpers/types";

export const OptionsSelect = ({ algo, setAlgo }) => {
  const { t } = useTranslation("algos");

  return (
    <div className={cls.selectWrapper}>
      <select
        value={algo}
        onChange={(e) => setAlgo(e.target.value as AlgoType)}
      >
        <option value="bubble">{t("Пузырьковая")}</option>
        <option value="quick">{t("Быстрая")}</option>
        <option value="merge">{t("Слиянием")}</option>
        <option value="insertion">{t("Вставками")}</option>
      </select>
    </div>
  );
};
