import React from "react";
import { useSelector, useDispatch } from "react-redux";
import cls from "./FolderHeader.module.scss";
import { RootState } from "@/store";
import {
  DesktopItem,
  setActiveFolder,
  setWindowFolder,
} from "@/store/slices/desktopSlice";
import useSession from "@/shared/hooks/useSession";

export const FolderHeader = ({
  item,
  handleMinimize,
  handleMaximize,
  handleCloseWindow,
  folderWindowId,
}: any) => {
  const dispatch = useDispatch();
  const { user } = useSession();
  const userLogin = user?.login || "Пользователь";

  const items = useSelector((state: RootState) => state.desktop.items);
  const folderWindow = useSelector((state: RootState) =>
    state.desktop.openFolders.find((f) => f.id === folderWindowId)
  );

  // текущая папка окна (если folderWindow есть, иначе используем item)
  const folder =
    items.find((i) => i.id === folderWindow?.currentFolderId) || item;

  // Формируем хлебные крошки
  const breadcrumbs: DesktopItem[] = [];
  let current: DesktopItem | undefined = folder;
  while (current) {
    breadcrumbs.unshift(current);
    current = current.parentId
      ? items.find((i) => i.id === current?.parentId)
      : undefined;
  }

  const handleGoBack = () => {
    if (!folder || !folderWindow) return;
    if (!folder.parentId) return; // уже на рабочем столе

    dispatch(
      setWindowFolder({ windowId: folderWindow.id, folderId: folder.parentId })
    );
  };

  const handleGoForward = () => {
    if (!folder || !folderWindow) return;

    const childFolder = items.find(
      (i) => i.parentId === folder.id && i.type === "folder"
    );

    if (childFolder) {
      dispatch(
        setWindowFolder({ windowId: folderWindow.id, folderId: childFolder.id })
      );
    }
  };

  return (
    <div className={cls.folderHeaderWrapper}>
      <div className={cls.folderHeader}>
        <span>{folder.name || "Папка"}</span>
        <div className={cls.controls}>
          <button onClick={() => handleMinimize(folderWindow?.id)}>−</button>
          <button onClick={() => handleMaximize(folderWindow?.id)}>
            {folderWindow?.windowState === "maximized" ? "⧉" : "□"}
          </button>
          <button onClick={handleCloseWindow}>×</button>
        </div>
      </div>

      {/* Нижняя навигация */}
      {item.type === "folder" && (
        <div className={cls.folderNav}>
          <div className={cls.navControls}>
            <button onClick={handleGoBack}>←</button>
            <button onClick={handleGoForward}>→</button>
          </div>
          <div className={cls.breadcrumbs}>
            <span
              style={{ cursor: "pointer" }}
              onClick={() => {
                if (folderWindow) {
                  // сброс к рабочему столу внутри этого окна
                  dispatch(setActiveFolder(folderWindow.currentFolderId));
                } else {
                  dispatch(setActiveFolder(null));
                }
              }}
            >
              {userLogin}
            </span>
            {breadcrumbs.length > 0 && " > "}
            {breadcrumbs.map((f, idx) => (
              <span
                key={f.id}
                onClick={() => {
                  if (folderWindow) {
                    dispatch(setActiveFolder(f.id));
                  }
                }}
                style={{ cursor: "pointer" }}
              >
                {f.name} {idx < breadcrumbs.length - 1 ? " > " : ""}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
