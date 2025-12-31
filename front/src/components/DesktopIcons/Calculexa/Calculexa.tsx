import React from "react";
import Image from "next/image";
import cls from "../DesktopIcons.module.scss";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { openFolder } from "@/store/slices/desktopSlice";
import { useAppDispatch } from "@/shared/hooks/useAppDispatch";

export const Calculexa = () => {
  const iconSize = useSelector((state: RootState) => state.desktop.iconSize);
  const dispatch = useAppDispatch();

  const handleDoubleClick = (e: React.MouseEvent) => {
    dispatch(
      openFolder({
        id: "calc",
        x: e.clientX,
        y: e.clientY,
      })
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
        src="/img/icons/calc.png"
        alt="calculator"
        className={cls.img}
        width={iconSize / 2}
        height={iconSize / 2}
      />
      <p className={cls.title}>Calculexa</p>
    </div>
  );
};
