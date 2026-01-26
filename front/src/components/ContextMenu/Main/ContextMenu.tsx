import React, { useEffect, useRef, useState } from "react";
import cls from "./ContextMenu.module.scss";
import { ContextMenuItem } from "../ContextMenuItem/ContextMenuItem";
import { useSelector } from "react-redux";
import { setBackground } from "@/store/slices/themeSlice";
import { useTranslation } from "next-i18next";
import { setIconSize, sortItemsByName } from "@/store/slices/desktopSlice";
import { RootState } from "@/store";
import { createFolderThunk } from "@/store/slices/desktopThunks";
import { useAppDispatch } from "@/shared/hooks/useAppDispatch";
import { createPortal } from "react-dom";

interface ContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  parentId?: string | null;
}

export interface MenuOption {
  label: string;
  value?: string;
  action?: () => void;
  submenu?: MenuOption[];
  hasUnderline?: boolean;
  selected?: boolean;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({
  x,
  y,
  onClose,
  parentId = null,
}) => {
  const menuRef = useRef<HTMLUListElement>(null);
  const [position, setPosition] = useState({ top: y, left: x });
  const { t } = useTranslation("contextMenu");
  const dispatch = useAppDispatch();
  const items = useSelector((state: RootState) => state.desktop.items);
  const iconSize = useSelector((state: RootState) => state.desktop.iconSize);
  const backgroundValue = useSelector(
    (state: RootState) => state.theme.backgroundValue,
  );

  const backgrounds = [
    { label: t("Серый"), value: "#ffffff50", type: "color" },
    { label: t("Черный"), value: "#000000b0", type: "color" },
    { label: t("Синий"), value: "#3c3cff79", type: "color" },
    { label: "Stars", value: "stars", type: "preset" },
    { label: "Snow", value: "snow", type: "preset" },
    { label: "Firefly", value: "firefly", type: "preset" },
  ];

  const sortOptions = [
    {
      label: t("Названию"),
      action: () => {
        dispatch(sortItemsByName());
        onClose();
      },
    },
  ];

  const createOptions = [
    {
      label: t("Папку"),
      action: () => {
        let newX = x;
        let newY = y;
        const offset = 10;

        // Проверка наложений с элементами из Redux
        while (
          items.some(
            (i) => Math.abs(i.x - newX) < 80 && Math.abs(i.y - newY) < 80,
          )
        ) {
          newX += offset;
          newY += offset;
        }
        const folderCount = items.filter(
          (item) => item.type === "folder" && item.name.includes("Новая папка"),
        ).length;

        dispatch(
          createFolderThunk({
            name: `Новая папка ${folderCount + 1}`,
            x: newX,
            y: newY,
            parentId,
            type: "folder",
          }),
        );

        onClose();
      },
    },
    {
      label: t("Текстовый документ"),
      action: () => {
        let newX = x;
        let newY = y;
        const offset = 10;

        // Проверка наложений с элементами из Redux
        while (
          items.some(
            (i) => Math.abs(i.x - newX) < 80 && Math.abs(i.y - newY) < 80,
          )
        ) {
          newX += offset;
          newY += offset;
        }
        const docsCount = items.filter(
          (item) => item.type === "txt" && item.name.includes("Документ"),
        ).length;

        dispatch(
          createFolderThunk({
            name: `Документ ${docsCount + 1}`,
            x: newX,
            y: newY,
            parentId,
            type: "txt",
          }),
        );

        onClose();
      },
    },
  ];

  const options: MenuOption[] = [
    {
      label: t("Фон"),
      hasUnderline: true,
      submenu: backgrounds.map((b) => ({
        label: b.label,
        value: b.value,
        selected: b.value === backgroundValue,
        action: () =>
          dispatch(setBackground({ type: b.type as any, value: b.value })),
      })),
    },
    {
      label: t("Создать"),
      hasUnderline: true,
      submenu: createOptions.map((b) => ({
        label: b.label,
        action: b.action,
      })),
    },

    {
      label: t("Изменить размер"),
      submenu: [
        {
          label: t("Мелкие"),
          action: () => dispatch(setIconSize(60)),
          selected: iconSize === 60,
        },
        {
          label: t("Средние"),
          action: () => dispatch(setIconSize(80)),
          selected: iconSize === 80,
        },
        {
          label: t("Крупные"),
          action: () => dispatch(setIconSize(120)),
          selected: iconSize === 120,
        },
      ],
    },
  ];

  if (parentId === null) {
    options.push({
      label: t("Сортировать по"),
      submenu: sortOptions.map((b) => ({
        label: b.label,
        action: b.action,
      })),
    });
  }

  // Проверка границ экрана
  useEffect(() => {
    const menu = menuRef.current;
    if (!menu) return;

    const { innerWidth, innerHeight } = window;
    const rect = menu.getBoundingClientRect();

    let newX = x;
    let newY = y;

    if (x + rect.width > innerWidth) newX = innerWidth - rect.width;
    if (y + rect.height > innerHeight) newY = innerHeight - rect.height;

    setPosition({ top: newY, left: newX });
  }, [x, y]);

  return createPortal(
    <ul
      className={cls.contextMenu}
      ref={menuRef}
      style={{ top: position.top, left: position.left }}
    >
      {options.map((option, idx) => (
        <ContextMenuItem key={idx} option={option} onClose={onClose} />
      ))}
    </ul>,
    document.body,
  );
};
