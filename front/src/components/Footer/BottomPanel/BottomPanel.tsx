import React, { FC, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";

import { RootState, AppDispatch } from "@/store";
import {
  setActiveFolder,
  setFolderWindowState,
} from "@/store/slices/desktopSlice";

import cls from "./BottomPanel.module.scss";
import { BottomPanelTab } from "../BottomPanelTab/BottomPanelTab";

export const BottomPanel: FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  const { openFolders, items, activeFolderId } = useSelector(
    (state: RootState) => state.desktop
  );

  const handleTabClick = useCallback(
    (folderId: string, windowState: string) => {
      if (windowState === "minimized") {
        dispatch(
          setFolderWindowState({
            id: folderId,
            windowState: "normal",
          })
        );

        const audio = new Audio("/sounds/close.mp3");
        audio.currentTime = 0;
        audio.play().catch(() => {});
      }

      dispatch(setActiveFolder(folderId));
    },
    [dispatch]
  );

  return (
    <div className={cls.panel}>
      {openFolders.map((folder) => (
        <BottomPanelTab
          key={folder.id}
          folder={folder}
          items={items}
          isActive={folder.id === activeFolderId}
          onClick={handleTabClick}
        />
      ))}
    </div>
  );
};
