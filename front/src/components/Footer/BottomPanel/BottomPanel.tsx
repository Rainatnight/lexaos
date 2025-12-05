import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store";
import {
  setActiveFolder,
  setFolderWindowState,
} from "@/store/slices/desktopSlice";
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

  return (
    <div className={cls.panel}>
      {openFolders.map((folder) => {
        const item = items.find((i) => i.id === folder.id);
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
            {item.name ?? <span>{item.name}</span>}
          </div>
        );
      })}
    </div>
  );
};
