import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { DraggableItem } from "./DraggableItem/DraggableItem";
import {
  closeFolder,
  openFolder,
  setSelectedItem,
} from "@/store/slices/desktopSlice";
import cls from "./DesktopLayout.module.scss";
import useSession from "@/shared/hooks/useSession";
import { openedWindows, selectRootDesktopItems } from "@/store/selectors";
import { FolderModal } from "./FolderModal/FolderModal";
import { RootState } from "@/store";
import { loadDesktopThunk } from "@/store/slices/desktopThunks";
import { useAppDispatch } from "@/shared/hooks/useAppDispatch";
import { useTranslation } from "next-i18next";
import { Notifications } from "../Notifications/Notifications";
import {
  addNotification,
  INotification,
  removeCallNotification,
  removeNotification,
} from "@/store/slices/notifications";
import { resetCall } from "@/store/slices/callSlice";
import { graphqlApi } from "@/shared/api/graphqlapi";

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
  const notificationAudio = React.useRef<HTMLAudioElement | null>(null);

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
  const audioRef = useRef<HTMLAudioElement | null>(null);

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

  const playNotificationSound = () => {
    const audio = new Audio("/sounds/not.mp3");
    audio.currentTime = 0;
    audio.play().catch(() => {});
  };

  const playClose = () => {
    const closeSound = new Audio("/sounds/close.mp3");
    closeSound.currentTime = 0;
    closeSound.play().catch(() => {});
  };

  useEffect(() => {
    if (!socket) return;

    const isChatOpen = openFolders.some((el) => el.id === "chat");

    if (isChatOpen) return;

    const handler = (data: INotification) => {
      dispatch(addNotification(data));

      playNotificationSound();

      setTimeout(() => {
        dispatch(removeNotification(data._id));
      }, 3000);
    };

    socket.on("message:new", handler);

    return () => {
      socket.off("message:new", handler);
    };
  }, [socket, openFolders, dispatch]);

  useEffect(() => {
    if (!socket) return;

    const isZoomOpen = openFolders.some((el) => el.id === "zoom");
    if (isZoomOpen) return;

    const handler = (data: any) => {
      const _id = `${data.fromUser.login}-${Date.now()}`;

      dispatch(
        addNotification({
          ...data,
          _id,
          msg: t("Входящий звонок"),
          fromLogin: data.fromUser.login,
          from: data.fromUser._id,
          app: "zoom",
        }),
      );
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch((err) => {
          console.log("ring play blocked:", err);
        });
      }
    };

    const cancelHandler = (data: any) => {
      audioRef.current?.pause();
      audioRef.current!.currentTime = 0;

      dispatch(removeCallNotification(data.by));
    };

    socket.on("call:incoming", handler);
    socket.on("call:cancelled", cancelHandler);

    return () => {
      socket.off("call:incoming", handler);
      socket.off("call:cancelled", cancelHandler);
    };
  }, [socket, openFolders, dispatch, t]);

  useEffect(() => {
    notificationAudio.current = new Audio("/sounds/notifsound.mp3");
  }, []);

  useEffect(() => {
    // создаём объект один раз при монтировании
    audioRef.current = new Audio("/sounds/ring.mp3");
    audioRef.current.loop = true;
  }, []);

  useEffect(() => {
    const unlock = () => {
      audioRef.current
        ?.play()
        .then(() => {
          audioRef.current?.pause();
          audioRef.current!.currentTime = 0;
        })
        .catch(() => {});
      window.removeEventListener("click", unlock);
    };

    window.addEventListener("click", unlock);
    return () => window.removeEventListener("click", unlock);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.altKey && e.key.toLowerCase() === "t") {
        e.preventDefault();

        dispatch(
          openFolder({
            id: "term",
            x: 100,
            y: 50,
          }),
        );
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [dispatch]);

  useEffect(() => {
    if (!loaded.current) {
      loaded.current = true;
      dispatch(loadDesktopThunk());
    }
  }, [dispatch]);

  useEffect(() => {
    const getHealth = async () => {
      const { data } = await graphqlApi.post("", {
        query: `
      query {
        health
      }
    `,
      });

      return data.data.health;
    };

    getHealth();
  }, []);

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
          (i) => i.id === folder.currentFolderId,
        );
        if (!currentItem) return null;

        const pos = getSafePosition(folder.x, folder.y);

        return (
          <FolderModal
            key={folder.id}
            item={currentItem}
            handleCloseWindow={() => {
              dispatch(closeFolder(folder.id));
              dispatch(resetCall());
              playClose();
            }}
            position={pos}
            folderId={folder.id}
          />
        );
      })}
    </div>
  );
};
