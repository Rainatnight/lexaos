import React from "react";
import { useSelector, useDispatch } from "react-redux";
import cls from "./FolderHeader.module.scss";
import { RootState } from "@/store";
import { DesktopItem, setActiveFolder } from "@/store/slices/desktopSlice";
import useSession from "@/shared/hooks/useSession";

export const FolderHeader = ({
  item,
  handleMinimize,
  handleMaximize,
  maximized,
  handleCloseWindow,
}: any) => {
  const dispatch = useDispatch();
  const { user } = useSession();
  const userLogin = user?.login || "Пользователь";

  const activeFolderId = useSelector(
    (state: RootState) => state.desktop.activeFolderId
  );
  const items = useSelector((state: RootState) => state.desktop.items);

  const folder = items.find((i) => i.id === activeFolderId) || item;

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
    console.log("Назад");
  };

  const handleGoForward = () => {
    console.log("Вперед");
  };

  return (
    <div className={cls.folderHeaderWrapper}>
      {/* Верхний заголовок */}
      <div className={cls.folderHeader}>
        <span>{item.name || "Папка"}</span>
        <div className={cls.controls}>
          <button onClick={handleMinimize}>−</button>
          <button onClick={handleMaximize}>{maximized ? "⧉" : "□"}</button>
          <button onClick={handleCloseWindow}>×</button>
        </div>
      </div>

      {/* Нижняя навигация */}
      <div className={cls.folderNav}>
        <div className={cls.navControls}>
          <button onClick={handleGoBack}>←</button>
          <button onClick={handleGoForward}>→</button>
        </div>
        <div className={cls.breadcrumbs}>
          {/* имя пользователя как первый элемент */}
          <span
            style={{ cursor: "pointer" }}
            onClick={() => dispatch(setActiveFolder(null))}
          >
            {userLogin}
          </span>
          {breadcrumbs.length > 0 && " > "}
          {breadcrumbs.map((f, idx) => (
            <span
              key={f.id}
              onClick={() => dispatch(setActiveFolder(f.id))}
              style={{ cursor: "pointer" }}
            >
              {f.name} {idx < breadcrumbs.length - 1 ? " > " : ""}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
