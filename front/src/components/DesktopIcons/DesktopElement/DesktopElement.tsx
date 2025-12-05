"use client";

import { useTranslation } from "react-i18next";
import Image from "next/image";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import {
  openFolder,
  setRenamingItem,
  setSelectedItem,
} from "@/store/slices/desktopSlice";
import { useState, useEffect, useRef } from "react";
import { ItemContextMenu } from "@/components/DesktopLayout/ItemContextMenu/ItemContextMenu";
import { renameFolderThunk } from "@/store/slices/desktopThunks";
import { useAppDispatch } from "@/shared/hooks/useAppDispatch";
import cls from "../DesktopIcons.module.scss";

export const DesktopElement = ({
  name,
  id,
  type,
}: {
  name: string;
  id: string;
  type: "folder" | "txt";
}) => {
  const { t } = useTranslation("desktopLayout");
  const dispatch = useAppDispatch();
  const iconSize = useSelector((state: RootState) => state.desktop.iconSize);
  const renamingItemId = useSelector(
    (state: RootState) => state.desktop.renamingItemId
  );

  const [itemMenu, setItemMenu] = useState<{
    x: number;
    y: number;
    itemId: string;
  } | null>(null);

  const [tempName, setTempName] = useState(name);
  const inputRef = useRef<HTMLInputElement>(null);

  const ref = useRef<HTMLDivElement>(null);

  const isRenaming = renamingItemId === id;

  useEffect(() => {
    if (isRenaming && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isRenaming]);

  const handleBlur = () => {
    const newName = tempName.trim();
    if (newName && newName !== name) {
      dispatch(renameFolderThunk({ id, newName }));
    }
    dispatch(setRenamingItem(null));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();

      const newName = tempName.trim();
      if (newName && newName !== name) {
        dispatch(renameFolderThunk({ id, newName }));
      }
      dispatch(setRenamingItem(null));
    } else if (e.key === "Escape") {
      dispatch(setRenamingItem(null));
    }
  };

  const handleContextMenu = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();

    setItemMenu({ x: 0, y: 0, itemId: id });
    dispatch(setSelectedItem(id));
  };

  // --- двойной клик открывает окно
  const handleDoubleClick = (e: React.MouseEvent) => {
    if (type === "folder") {
      dispatch(
        openFolder({
          id,
          x: e.clientX,
          y: e.clientY,
        })
      );
    }
  };

  useEffect(() => {
    setTempName(name);
  }, [name]);

  return (
    <div
      id={`icon-${id}`}
      data-id={id}
      ref={ref}
      className={cls.wrap}
      style={{ width: iconSize, height: iconSize }}
      onContextMenu={(e) => {
        handleContextMenu(e, id);
      }}
      onDoubleClick={(e) => {
        handleDoubleClick(e);
      }}
    >
      <Image
        src={type === "txt" ? "/img/icons/txt.png" : "/img/icons/folder.png"}
        alt={type === "txt" ? "txt" : "folder"}
        className={cls.img}
        width={iconSize / 2}
        height={iconSize / 2}
      />

      {isRenaming ? (
        <input
          ref={inputRef}
          className={cls.renameInput}
          value={tempName}
          onChange={(e) => setTempName(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
        />
      ) : (
        <p className={cls.title}>{name || t("Новая папка")}</p>
      )}

      {itemMenu && (
        <ItemContextMenu
          x={itemMenu.x}
          y={itemMenu.y}
          itemId={itemMenu.itemId}
          onClose={() => setItemMenu(null)}
        />
      )}
    </div>
  );
};
