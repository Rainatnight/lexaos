"use client";

import React, { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import interact from "interactjs";
import { setSelectedItem } from "@/store/slices/desktopSlice";
import { DesktopElement } from "@/components/DesktopIcons/DesktopElement/DesktopElement";
import { RootState } from "@/store";
import cls from "./DraggableItem.module.scss";
import { PC, Vs, Bin } from "@/components/DesktopIcons";
import { moveItemThunk } from "@/store/slices/desktopThunks";
import { useAppDispatch } from "@/shared/hooks/useAppDispatch";
import { LexaChatEl } from "@/components/DesktopIcons/LexaChat/LexaChatEl";
import { LexaZoomEl } from "@/components/DesktopIcons/LexaZoom/LexaZoom";
import { Calculexa } from "@/components/DesktopIcons/Calculexa/Calculexa";
import { Terminal } from "@/components/DesktopIcons/Terminal/Terminal";
import { Chrome } from "@/components/DesktopIcons/Chrome/Chrome";
import { AlgosIcon } from "@/components/DesktopIcons/AlgosIcon/AlgosIcon";

interface IProps {
  item: {
    id: string;
    type: string;
    name?: string;
    x: number;
    y: number;
    component?: React.FC;
    parentId?: string | null;
  };
}

export const DraggableItem = React.memo(({ item }: IProps) => {
  const dispatch = useAppDispatch();
  const ref = useRef<HTMLDivElement>(null);
  const currentPos = useRef({ x: item.x, y: item.y });
  const selectedItemId = useSelector(
    (state: RootState) => state.desktop.selectedItemId,
  );

  const playMove = () => {
    const closeSound = new Audio("/sounds/snap.mp3");
    closeSound.currentTime = 0;
    closeSound.play().catch(() => {});
  };

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const dragEndSound = new Audio("/sounds/snap.mp3");
    dragEndSound.preload = "auto";

    interact(element).draggable({
      listeners: {
        start() {
          element.classList.add(cls.dragging);
          document.body.classList.add("dragging");
        },
        move(event) {
          const parentRect = element.parentElement!.getBoundingClientRect();

          currentPos.current.x = Math.max(
            0,
            Math.min(
              currentPos.current.x + event.dx,
              parentRect.width - element.offsetWidth,
            ),
          );
          currentPos.current.y = Math.max(
            0,
            Math.min(
              currentPos.current.y + event.dy,
              parentRect.height - element.offsetHeight,
            ),
          );

          element.style.left = `${currentPos.current.x}px`;
          element.style.top = `${currentPos.current.y}px`;
        },
        end() {
          element.classList.remove(cls.dragging);
          document.body.classList.remove("dragging");
          dragEndSound.currentTime = 0;

          if (!["folder", "txt"].includes(item.type)) return;
          dispatch(
            moveItemThunk({
              id: item.id,
              x: currentPos.current.x,
              y: currentPos.current.y,
            }),
          );
          playMove();
        },
      },
    });

    return () => interact(element).unset();
  }, [dispatch, item.id, item.type]);

  useEffect(() => {
    if (ref.current) {
      ref.current.style.left = `${item.x}px`;
      ref.current.style.top = `${item.y}px`;
      currentPos.current = { x: item.x, y: item.y };
    }
  }, [item.x, item.y]);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch(setSelectedItem(item.id));
  };

  if (item.parentId) return null;

  return (
    <>
      <div
        ref={ref}
        data-id={item.id}
        onClick={handleClick}
        className={`${cls.draggableItem} draggableItem ${
          selectedItemId === item.id ? cls.selected : ""
        }`}
        style={{
          position: "absolute",
          left: item.x,
          top: item.y,
          zIndex: "var(--z-index-1)",
        }}
      >
        {item.type === "pc" && <PC />}
        {item.type === "vs" && <Vs />}
        {item.type === "bin" && <Bin />}
        {item.type === "chat" && <LexaChatEl />}
        {item.type === "zoom" && <LexaZoomEl />}
        {item.type === "calc" && <Calculexa />}
        {item.type === "term" && <Terminal />}
        {item.type === "chrome" && <Chrome />}
        {item.type === "algos" && <AlgosIcon />}
        {item.type === "folder" && (
          <DesktopElement
            id={item.id}
            name={item.name || "Новая папка"}
            type="folder"
          />
        )}
        {item.type === "txt" && (
          <DesktopElement
            name={item.name || "Документ"}
            id={item.id}
            type="txt"
          />
        )}
      </div>
    </>
  );
});

DraggableItem.displayName = "DraggableItem";
