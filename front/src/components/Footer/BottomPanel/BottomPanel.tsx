import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store";
import {
  setActiveFolder,
  setFolderWindowState,
} from "@/store/slices/desktopSlice";
import Image from "next/image";

import cls from "./BottomPanel.module.scss";

export const BottomPanel = () => {
  const dispatch = useDispatch();
  const openFolders = useSelector(
    (state: RootState) => state.desktop.openFolders
  );
  const items = useSelector((state: RootState) => state.desktop.items);
  const activeFolderId = useSelector(
    (state: RootState) => state.desktop.activeFolderId
  );

  const getImgSrc = (id: string) => {
    switch (id) {
      case "zoom":
        return "/img/icons/lexazoom.png";
      case "chat":
        return "/img/icons/chat.png";
      case "trash":
        return "/img/icons/bin.png";

      default:
        return "/img/icons/folder.png";
    }
  };

  return (
    <div className={cls.panel}>
      {openFolders.map((folder) => {
        const item = items.find(
          (i) => i.id === (folder.currentFolderId ?? folder.id)
        );

        if (!item) return null;

        return (
          <div
            key={folder.id}
            className={`${cls.tab} ${
              folder.id === activeFolderId ? cls.active : ""
            }`}
            onClick={() => {
              // Если окно свернуто — разворачиваем
              if (folder.windowState === "minimized") {
                dispatch(
                  setFolderWindowState({
                    id: folder.id,
                    windowState: "normal",
                  })
                );
                const closeSound = new Audio("/sounds/close.mp3");
                closeSound.preload = "auto";
                closeSound.currentTime = 0;
                closeSound.play().catch((err) => console.log(err));
              }

              // Делаем активным в любом случае
              dispatch(setActiveFolder(folder.id));
            }}
          >
            <div className={cls.name}>
              <Image
                src={getImgSrc(item.id) || "/img/icons/folder.png"}
                alt={"folder"}
                className={cls.img}
                width={18}
                height={18}
              />
              {item.name ?? <span>{item.name}</span>}
            </div>
          </div>
        );
      })}
    </div>
  );
};
