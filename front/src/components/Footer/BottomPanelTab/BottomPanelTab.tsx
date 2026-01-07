import React, { FC, memo, useMemo } from "react";
import Image from "next/image";

import cls from "./BottomPanelTab.module.scss";
import { classNames } from "@/helpers/classNames/classNames";

const ICON_MAP: Record<string, string> = {
  zoom: "/img/icons/lexazoom.png",
  chat: "/img/icons/chat.png",
  bin: "/img/icons/bin.png",
  calc: "/img/icons/calc.png",
  term: "/img/icons/term.png",
  chrome: "/img/icons/chrome.png",
};

const getImgSrc = (id: string): string =>
  ICON_MAP[id] ?? "/img/icons/folder.png";

interface BottomPanelTabProps {
  folder: {
    id: string;
    currentFolderId?: string | null;
    windowState: string;
  };
  items: Array<{
    id: string;
    name?: string;
  }>;
  isActive: boolean;
  onClick: (folderId: string, windowState: string) => void;
}

export const BottomPanelTab: FC<BottomPanelTabProps> = memo(
  ({ folder, items, isActive, onClick }) => {
    const item = useMemo(
      () => items.find((i) => i.id === (folder.currentFolderId ?? folder.id)),
      [items, folder]
    );

    if (!item) return null;

    return (
      <div
        className={classNames(cls.tab, { [cls.active]: isActive })}
        onClick={() => onClick(folder.id, folder.windowState)}
      >
        <div className={cls.name}>
          <Image
            src={getImgSrc(item.id)}
            alt={item.name ?? "folder"}
            className={cls.img}
            width={18}
            height={18}
          />
          <span>{item.name}</span>
        </div>
      </div>
    );
  }
);

BottomPanelTab.displayName = "BottomPanelTab";
