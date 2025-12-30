// utils/desktop.ts
import { DesktopItem } from "@/store/slices/desktopSlice";

export const isDescendantOrSameWindow = (
  items: DesktopItem[],
  childId: string,
  folderWindowId: string | null
): boolean => {
  if (!folderWindowId) return false;

  let current = items.find((i) => i.id === childId);
  while (current) {
    if (current.id === folderWindowId) return true;
    current = current.parentId
      ? items.find((i) => i.id === current?.parentId)
      : undefined;
  }
  return false;
};
