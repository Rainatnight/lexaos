import React from "react";
import Image from "next/image";
import cls from "../DesktopIcons.module.scss";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { useAppDispatch } from "@/shared/hooks/useAppDispatch";
import { openFolder } from "@/store/slices/desktopSlice";

export const Vs = () => {
  const iconSize = useSelector((state: RootState) => state.desktop.iconSize);
  const dispatch = useAppDispatch();

  const handleDoubleClick = (e: React.MouseEvent) => {
    dispatch(
      openFolder({
        id: "vs",
        x: e.clientX,
        y: e.clientY,
      }),
    );
  };

  return (
    <div
      className={cls.wrap}
      style={{ width: iconSize, height: iconSize }}
      onDoubleClick={(e) => {
        handleDoubleClick(e);
      }}
    >
      <Image
        src="/img/icons/vs.png"
        alt="VS Code"
        className={cls.img}
        width={iconSize / 2}
        height={iconSize / 2}
      />
      <p className={cls.title}>code.js</p>
    </div>
  );
};
