import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "@/store";

// мемоизированный селектор для корневых элементов рабочего стола
export const selectRootDesktopItems = createSelector(
  (state: RootState) => state.desktop.items,
  (items) => items.filter((i) => !i.parentId)
);

export const openedWindows = (state: RootState) => state.desktop.openFolders;
