import React, { useState } from "react";
import cls from "./FolderContent.module.scss";
import { DesktopElement } from "@/components/DesktopIcons";
import { useTranslation } from "next-i18next";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { setSelectedItem } from "@/store/slices/desktopSlice";
import { ContextMenu } from "@/components/ContextMenu";
import { useAppDispatch } from "@/shared/hooks/useAppDispatch";

export const FolderContent = ({ folders, parentId }) => {
  const { t } = useTranslation("folderModal");
  const dispatch = useAppDispatch();

  const [desktopMenu, setDesktopMenu] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const selectedItemId = useSelector(
    (state: RootState) => state.desktop.selectedItemId
  );

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // ПКМ по пустому месту
    if (e.target === e.currentTarget) {
      dispatch(setSelectedItem(null));
      setDesktopMenu({ x: e.clientX, y: e.clientY });
    }
  };

  return (
    <div className={cls.folderContent} onContextMenu={handleContextMenu}>
      {folders.length === 0 ? (
        <p className={cls.empty}>{t("Папка пуста")}</p>
      ) : (
        <div className={cls.itemsGrid}>
          {folders.map((el) => (
            <DesktopElement
              key={el.id}
              id={el.id}
              name={el.name || "Новый файл"}
              type={el.type}
            />
          ))}
        </div>
      )}

      {desktopMenu && !selectedItemId && (
        <ContextMenu
          x={desktopMenu.x}
          y={desktopMenu.y}
          onClose={() => setDesktopMenu(null)}
          parentId={parentId}
        />
      )}
    </div>
  );
};
