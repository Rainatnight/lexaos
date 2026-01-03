import React from "react";
import cls from "./FolderFooter.module.scss";
import { useTranslation } from "next-i18next";
import { useAppDispatch } from "@/shared/hooks/useAppDispatch";
import { clearbinThunk } from "@/store/slices/desktopThunks";

export const FolderFooter = ({ folders, item }) => {
  const { t } = useTranslation("folderModal");
  const dispatch = useAppDispatch();

  const getPlural = (count: number, one: string, few: string, many: string) => {
    const mod10 = count % 10;
    const mod100 = count % 100;

    if (mod10 === 1 && mod100 !== 11) return one;
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
    return many;
  };

  const count = folders.length;

  return (
    <div className={cls.bottom}>
      <p>
        {count} {getPlural(count, t("элемент"), t("элемента"), t("элементов"))}
      </p>

      {item.id === "bin" && (
        <div
          className={cls.clear}
          onClick={() => {
            dispatch(clearbinThunk());
          }}
        >
          {t("Очистить корзину")}
        </div>
      )}
    </div>
  );
};
