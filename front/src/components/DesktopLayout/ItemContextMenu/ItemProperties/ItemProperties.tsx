import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import cls from "./ItemProperties.module.scss";
import { useTranslation } from "react-i18next";

interface Props {
  itemId: string;
  onClose: () => void;
}

export const ItemPropertiesModal: React.FC<Props> = ({ itemId, onClose }) => {
  const items = useSelector((state: RootState) => state.desktop.items);
  const { t } = useTranslation("properties");
  const item = items.find((i) => i.id === itemId);

  //  Находим родительскую папку
  const getFullPath = (id: string | null): string => {
    if (!id) return "Рабочий стол";

    const current = items.find((i) => i.id === id);
    if (!current) return "";

    return `${getFullPath(current.parentId ?? null)} / ${current.name}`;
  };

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  if (!item) return null;
  const locationName = getFullPath(item.parentId ?? null);

  return createPortal(
    <div className={cls.overlay}>
      <div className={cls.modal}>
        <div className={cls.header}>
          <span>
            {item.name} {t("Свойства")}
          </span>
          <button onClick={onClose}>✕</button>
        </div>

        <div className={cls.body}>
          <div className={cls.iconSection}>
            <div className={cls.icon}>
              {item.type === "folder" ? "📁" : "📄"}
            </div>
            <div>
              <div className={cls.name}>{item.name}</div>
              <div className={cls.type}>
                {t("Тип:")} {item.type === "folder" ? t("Папка") : t("Файл")}
              </div>
            </div>
          </div>

          <div className={cls.infoBlock}>
            <div>
              {t("Расположение")}: {locationName}
            </div>
            <div>ID: {item.id}</div>
            {/* {item.size && <div>Размер: {item.size} KB</div>} */}
          </div>
        </div>

        <div className={cls.footer}>
          <button onClick={onClose}>{t("OK")}</button>
        </div>
      </div>
    </div>,
    document.body,
  );
};
