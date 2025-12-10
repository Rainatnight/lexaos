import React from "react";
import cls from "./FolderFooter.module.scss";
import { useTranslation } from "react-i18next";
import { useAppDispatch } from "@/shared/hooks/useAppDispatch";
import { clearTrashThunk } from "@/store/slices/desktopThunks";

export const FolderFooter = ({ children, item }) => {
  const { t } = useTranslation("folderModal");
  const dispatch = useAppDispatch();

  return (
    <div className={cls.bottom}>
      <p>{`${children.length} ${t("элементов")}`}</p>
      {item.id === "trash" && (
        <div
          className={cls.clear}
          onClick={() => {
            dispatch(clearTrashThunk());
          }}
        >
          {t("Очистить корзину")}
        </div>
      )}
    </div>
  );
};
