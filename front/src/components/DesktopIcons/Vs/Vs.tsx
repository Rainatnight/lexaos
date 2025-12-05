import React from "react";
import Image from "next/image";
import cls from "../DesktopIcons.module.scss";
import { useSelector } from "react-redux";
import { RootState } from "@/store";

export const Vs = () => {
  const iconSize = useSelector((state: RootState) => state.desktop.iconSize);

  return (
    <div className={cls.wrap} style={{ width: iconSize, height: iconSize }}>
      <Image
        src="/img/icons/vscode.png"
        alt="VS Code"
        className={cls.img}
        width={iconSize / 2}
        height={iconSize / 2}
      />
      <p className={cls.title}>абв</p>
    </div>
  );
};
