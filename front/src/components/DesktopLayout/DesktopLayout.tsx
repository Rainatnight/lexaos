import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { DraggableItem } from "./DraggableItem/DraggableItem";
import { closeFolder, setSelectedItem } from "@/store/slices/desktopSlice";
import cls from "./DesktopLayout.module.scss";
import useSession from "@/shared/hooks/useSession";
import { openedWindows, selectRootDesktopItems } from "@/store/selectors";
import { FolderModal } from "./FolderModal/FolderModal";
import { RootState } from "@/store";
import { loadDesktopThunk } from "@/store/slices/desktopThunks";
import { useAppDispatch } from "@/shared/hooks/useAppDispatch";
import { useTranslation } from "next-i18next";
import { Notifications } from "../Notifications/Notifications";
import { addNotification, INotification } from "@/store/slices/notifications";

interface Props {
  onBackgroundContextMenu: (x: number, y: number) => void;
}

export const DesktopLayout: React.FC<Props> = ({ onBackgroundContextMenu }) => {
  const dispatch = useAppDispatch();
  const items = useSelector(selectRootDesktopItems);
  const openFolders = useSelector(openedWindows);
  const allItems = useSelector((state: RootState) => state.desktop.items);
  const { t } = useTranslation("DesktopLayout");
  const { socket } = useSession();
  const { user } = useSession();

  const loaded = useRef(false);

  // состояние для рамки выделения
  const [selecting, setSelecting] = useState(false);
  const [selectionRect, setSelectionRect] = useState<{
    x: number;
    y: number;
    w: number;
    h: number;
  } | null>(null);
  const startPos = useRef<{ x: number; y: number } | null>(null);

  const handleBackgroundContextMenu = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      e.preventDefault();
      e.stopPropagation();
      dispatch(setSelectedItem(null));
      onBackgroundContextMenu(e.clientX, e.clientY);
    }
  };

  //  начало выделения
  const handleMouseDown = (e: React.MouseEvent) => {
    // только ЛКМ и только по фону
    if (e.button !== 0 || e.target !== e.currentTarget) return;

    dispatch(setSelectedItem(null));

    startPos.current = { x: e.clientX, y: e.clientY };
    setSelecting(true);
    setSelectionRect({ x: e.clientX, y: e.clientY, w: 0, h: 0 });
  };

  //  движение мыши — обновляем размеры рамки
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!selecting || !startPos.current) return;

    const x = Math.min(e.clientX, startPos.current.x);
    const y = Math.min(e.clientY, startPos.current.y);
    const w = Math.abs(e.clientX - startPos.current.x);
    const h = Math.abs(e.clientY - startPos.current.y);

    setSelectionRect({ x, y, w, h });
  };

  //  отпускание мыши — завершаем выделение
  const handleMouseUp = () => {
    if (!selecting) return;
    setSelecting(false);

    if (selectionRect) {
      const selectedIds: string[] = [];

      items.forEach((item) => {
        const el = document.getElementById(`icon-${item.id}`);
        if (!el) return;
        const rect = el.getBoundingClientRect();

        // проверяем пересечение рамки и иконки
        const intersects =
          rect.right >= selectionRect.x &&
          rect.left <= selectionRect.x + selectionRect.w &&
          rect.bottom >= selectionRect.y &&
          rect.top <= selectionRect.y + selectionRect.h;

        if (intersects) selectedIds.push(item.id);
      });
    }

    setSelectionRect(null);
  };

  const getSafePosition = (x: number, y: number) => {
    const padding = 35;

    const windowWidth = 800;
    const windowHeight = window.innerHeight * 0.8;

    const maxX = window.innerWidth - windowWidth - padding;
    const maxY = window.innerHeight - windowHeight - padding;

    return {
      x: Math.max(padding, Math.min(x, maxX)),
      y: Math.max(padding, Math.min(y, maxY)),
    };
  };

  useEffect(() => {
    if (!loaded.current) {
      loaded.current = true;
      dispatch(loadDesktopThunk());
    }
  }, [dispatch]);

  useEffect(() => {
    if (!socket) return;

    const handler = (data: INotification) => {
      console.log(openFolders);
      if (openFolders.find((el) => el.id === "chat")) return;
      dispatch(addNotification(data));
    };

    socket.on("message:new", handler);

    return () => {
      socket.off("message:new", handler);
    };
  }, [socket, dispatch]);

  return (
    <div
      className={cls.desktopWrapper}
      onContextMenu={handleBackgroundContextMenu}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <div className={cls.login}>{`${t("Пользователь")}  ${
        user?.login || t("Гость")
      }`}</div>

      <Notifications />

      {items.map((item) => (
        <DraggableItem key={item.id} item={item} />
      ))}

      {/* сама рамка */}
      {selectionRect && (
        <div
          className={cls.selection}
          style={{
            top: selectionRect.y,
            left: selectionRect.x,
            width: selectionRect.w,
            height: selectionRect.h,
          }}
        />
      )}

      {/* открытые папки */}
      {openFolders.map((folder) => {
        // в item передаём текущую папку окна
        const currentItem = allItems.find(
          (i) => i.id === folder.currentFolderId
        );
        if (!currentItem) return null;

        const pos = getSafePosition(folder.x, folder.y);

        return (
          <FolderModal
            key={folder.id}
            item={currentItem}
            handleCloseWindow={() => dispatch(closeFolder(folder.id))}
            position={pos}
            folderId={folder.id}
          />
        );
      })}
    </div>
  );
};
