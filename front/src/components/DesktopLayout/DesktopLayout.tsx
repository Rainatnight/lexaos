import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { DraggableItem } from "./DraggableItem/DraggableItem";
import { closeFolder, setSelectedItem } from "@/store/slices/desktopSlice";
import cls from "./DesktopLayout.module.scss";
import useSession from "@/shared/hooks/useSession";
import { openedWindows, selectRootDesktopItems } from "@/store/selectors";
import { FolderModal } from "./FolderModal/FolderModal";
import { RootState } from "@/store";
import { api } from "@/shared/api/api";
import { loadDesktopThunk } from "@/store/slices/desktopThunks";
import { useAppDispatch } from "@/shared/hooks/useAppDispatch";

interface Props {
  onBackgroundContextMenu: (x: number, y: number) => void;
}

export const DesktopLayout: React.FC<Props> = ({ onBackgroundContextMenu }) => {
  const dispatch = useAppDispatch();
  const items = useSelector(selectRootDesktopItems);
  const openFolders = useSelector(openedWindows);
  const allItems = useSelector((state: RootState) => state.desktop.items);

  const { user } = useSession();

  const loaded = useRef(false);

  // 👇 состояние для рамки выделения
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

  // 👇 начало выделения
  const handleMouseDown = (e: React.MouseEvent) => {
    // только ЛКМ и только по фону
    if (e.button !== 0 || e.target !== e.currentTarget) return;

    dispatch(setSelectedItem(null));

    startPos.current = { x: e.clientX, y: e.clientY };
    setSelecting(true);
    setSelectionRect({ x: e.clientX, y: e.clientY, w: 0, h: 0 });
  };

  // 👇 движение мыши — обновляем размеры рамки
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!selecting || !startPos.current) return;

    const x = Math.min(e.clientX, startPos.current.x);
    const y = Math.min(e.clientY, startPos.current.y);
    const w = Math.abs(e.clientX - startPos.current.x);
    const h = Math.abs(e.clientY - startPos.current.y);

    setSelectionRect({ x, y, w, h });
  };

  // 👇 отпускание мыши — завершаем выделение
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

  useEffect(() => {
    if (!loaded.current) {
      loaded.current = true;
      dispatch(loadDesktopThunk());
    }
  }, [dispatch]);

  return (
    <div
      className={cls.desktopWrapper}
      onContextMenu={handleBackgroundContextMenu}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <h1>{user?.login}</h1>
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

      {/*   открытые папки */}
      {openFolders.map((folder) => {
        const folderItem = allItems.find((i) => i.id === folder.id);
        if (!folderItem) return null;
        return (
          <FolderModal
            key={folder.id}
            item={folderItem}
            handleCloseWindow={() => dispatch(closeFolder(folder.id))}
            position={{ x: folder.x, y: folder.y }}
          />
        );
      })}
    </div>
  );
};
