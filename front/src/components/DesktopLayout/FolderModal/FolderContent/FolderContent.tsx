import React from "react";
import cls from "./FolderContent.module.scss";
import { DesktopElement } from "@/components/DesktopIcons";
import { useTranslation } from "react-i18next";

export const FolderContent = ({ children }) => {
  const { t } = useTranslation("folderModal");

  return (
    <div className={cls.folderContent}>
      {children.length === 0 ? (
        <p className={cls.empty}>{t("Папка пуста")}</p>
      ) : (
        <div className={cls.itemsGrid}>
          {children.map((el) => (
            <div key={el.id}>
              {el.type === "folder" && (
                <DesktopElement
                  id={el.id}
                  name={el.name || "Новая папка"}
                  type="folder"
                />
              )}
              {el.type === "txt" && (
                <DesktopElement
                  id={el.id}
                  name={el.name || "Новая папка"}
                  type="txt"
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
