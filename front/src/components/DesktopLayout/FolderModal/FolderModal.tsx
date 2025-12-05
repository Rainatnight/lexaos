"use client";

import { useEffect, useRef } from "react";
import cls from "./FolderModal.module.scss";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import {
  moveFolder,
  moveItemToFolder,
  setActiveFolder,
  setFolderWindowState,
} from "@/store/slices/desktopSlice";
import interact from "interactjs";
import { DesktopElement } from "@/components/DesktopIcons";

export const FolderModal = ({ item, handleCloseWindow, position }: any) => {
  const dispatch = useDispatch();
  const ref = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: position.x, y: position.y });
  const allItems = useSelector((state: RootState) => state.desktop.items);
  const children = allItems.filter((i) => i.parentId === item.id);

  const folderState = useSelector((state: RootState) =>
    state.desktop.openFolders.find((f) => f.id === item.id)
  );

  const windowState = folderState?.windowState || "normal";

  const minimized = windowState === "minimized";
  const maximized = windowState === "maximized";

  const activeFolderId = useSelector(
    (state: RootState) => state.desktop.activeFolderId
  );
  const isActive = activeFolderId === item.id;

  // === делаем окно активным при клике ===
  const handleMouseDown = () => {
    dispatch(setActiveFolder(item.id));
  };

  const changeState = (state: "normal" | "minimized" | "maximized") => {
    dispatch(
      setFolderWindowState({
        id: item.id,
        windowState: state,
      })
    );
  };
  const playSound = () => {
    const closeSound = new Audio("/sounds/close.mp3");
    closeSound.preload = "auto";
    closeSound.currentTime = 0;
    closeSound.play().catch((err) => console.log(err));
  };
  // === сворачивание ===
  const handleMinimize = () => {
    changeState("minimized");
    dispatch(setActiveFolder(null)); // убираем фокус
    playSound();
  };

  // === разворачивание на весь экран ===
  const handleMaximize = () => {
    changeState(maximized ? "normal" : "maximized");
    playSound();
  };

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // В normal режиме используем transform для позиции
    if (windowState === "normal") {
      element.style.transform = `translate(${pos.current.x}px, ${pos.current.y}px)`;
    }

    // Инициализация interact
    const interactInstance = interact(element)
      .draggable({
        allowFrom: `.${cls.folderHeader}`,
        enabled: windowState === "normal",
        listeners: {
          start() {
            dispatch(setActiveFolder(item.id));

            const transform = element.style.transform.match(
              /translate\(([-\d.]+)px,\s*([-\d.]+)px\)/
            );
            if (transform) {
              pos.current.x = parseFloat(transform[1]);
              pos.current.y = parseFloat(transform[2]);
            }
          },
          move(event) {
            if (windowState !== "normal") return;

            pos.current.x += event.dx;
            pos.current.y += event.dy;

            const parent = element.parentElement!;
            const parentRect = parent.getBoundingClientRect();

            pos.current.x = Math.max(
              0,
              Math.min(pos.current.x, parentRect.width - element.offsetWidth)
            );
            pos.current.y = Math.max(
              0,
              Math.min(pos.current.y, parentRect.height - element.offsetHeight)
            );

            element.style.transform = `translate(${pos.current.x}px, ${pos.current.y}px)`;
          },
          end() {
            if (windowState !== "normal") return;

            dispatch(
              moveFolder({
                id: item.id,
                x: pos.current.x,
                y: pos.current.y,
              })
            );
          },
        },
      })
      .resizable({
        edges: { right: true, bottom: true },
        invert: "none",
        enabled: windowState === "normal",
        listeners: {
          move(event) {
            if (windowState !== "normal") return;

            const { width, height } = event.rect;

            // применяем новые размеры
            element.style.width = `${width}px`;
            element.style.height = `${height}px`;

            pos.current.x += event.deltaRect.left;
            pos.current.y += event.deltaRect.top;
            element.style.transform = `translate(${pos.current.x}px, ${pos.current.y}px)`;
          },
          end() {
            dispatch(
              moveFolder({
                id: item.id,
                x: pos.current.x,
                y: pos.current.y,
              })
            );
          },
        },
        modifiers: [
          interact.modifiers!.restrictSize({
            min: { width: 300, height: 200 },
          }),
        ],
      });

    return () => {
      interactInstance.unset();
    };
  }, [windowState, item.id, dispatch]);

  useEffect(() => {
    if (!ref.current) return;

    const interactInstance = interact(ref.current).dropzone({
      accept: ".draggableItem",
      overlap: 0.4,
      ondragenter() {
        ref.current!.classList.add(cls.dropActive);
      },
      ondragleave() {
        ref.current!.classList.remove(cls.dropActive);
      },
      ondrop(event) {
        const draggedId = event.relatedTarget.dataset.id;
        if (!draggedId) return;

        dispatch(moveItemToFolder({ itemId: draggedId, parentId: item.id }));
      },
    });

    return () => interactInstance.unset();
  }, [item.id, dispatch, windowState]);

  useEffect(() => {
    children.forEach((child) => {
      const el = document.getElementById(`icon-${child.id}`);
      if (!el) return;

      interact(el).draggable({
        listeners: {
          start() {
            // создаём клон
            const clone = el.cloneNode(true) as HTMLElement;
            clone.id = `drag-clone-${child.id}`;
            clone.style.position = "fixed";
            clone.style.left = `${el.getBoundingClientRect().left}px`;
            clone.style.top = `${el.getBoundingClientRect().top}px`;
            clone.style.zIndex = "10000";
            clone.style.pointerEvents = "none";
            clone.style.width = `${el.offsetWidth}px`;
            clone.style.height = `${el.offsetHeight}px`;

            document.body.appendChild(clone);
            el.dataset.cloneId = clone.id;

            // скрываем оригинал
            el.style.visibility = "hidden";
          },
          move(event) {
            const clone = document.getElementById(el.dataset.cloneId!);
            if (!clone) return;

            const dx = event.dx;
            const dy = event.dy;

            const transform = clone.style.transform.match(
              /translate\(([-\d.]+)px,\s*([-\d.]+)px\)/
            );
            let x = 0,
              y = 0;
            if (transform) {
              x = parseFloat(transform[1]);
              y = parseFloat(transform[2]);
            }
            x += dx;
            y += dy;

            clone.style.transform = `translate(${x}px, ${y}px)`;
          },
          end(event) {
            const clone = document.getElementById(el.dataset.cloneId!);
            if (clone) clone.remove(); // удаляем клон

            const folderRect = ref.current!.getBoundingClientRect();
            const droppedOutside =
              event.clientX < folderRect.left ||
              event.clientX > folderRect.right ||
              event.clientY < folderRect.top ||
              event.clientY > folderRect.bottom;

            dispatch(
              moveItemToFolder({
                itemId: child.id,
                parentId: droppedOutside ? null : item.id,
                x: droppedOutside ? event.clientX - 50 : 10,
                y: droppedOutside ? event.clientY - 50 : 10,
              })
            );
            const audio = new Audio("/sounds/snap.mp3");
            audio.preload = "auto";
            audio.currentTime = 0;
            audio.play().catch((err) => console.log(err));
            // показываем оригинал
            el.style.visibility = "visible";
          },
        },
      });
    });
  }, [children, dispatch, item.id]);

  const isDragging =
    typeof window !== "undefined" &&
    document.body.classList.contains("dragging");

  return (
    <div
      ref={ref}
      onMouseDown={handleMouseDown}
      className={`${cls.folderWindow} ${isActive ? cls.active : ""} ${
        minimized ? cls.minimized : ""
      } ${maximized ? cls.maximized : ""}`}
      style={{
        top: 0,
        left: 0,
        zIndex: isActive ? 1000 : 999,
        pointerEvents: isDragging ? "none" : "auto",
      }}
    >
      <div className={cls.folderHeader}>
        <span>{item.name || "Папка"}</span>
        <div className={cls.controls}>
          <button onClick={handleMinimize}>−</button>

          {/* □ меняется на ⧉ при максимизации */}
          <button onClick={handleMaximize}>{maximized ? "⧉" : "□"}</button>

          <button onClick={handleCloseWindow}>×</button>
        </div>
      </div>

      <div className={cls.folderContent}>
        {children.length === 0 ? (
          <p className={cls.empty}>Папка пуста</p>
        ) : (
          <div className={cls.itemsGrid}>
            {children.map((el) => (
              <div key={el.id}>
                {el.type === "folder" && (
                  <DesktopElement
                    id={el.id}
                    name={el.name || "Новая папка"}
                    type="folder"
                  />
                )}
                {el.type === "txt" && (
                  <DesktopElement
                    id={el.id}
                    name={el.name || "Новая папка"}
                    type="txt"
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
