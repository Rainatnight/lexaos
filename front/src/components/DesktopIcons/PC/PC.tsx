import React from "react";
import cls from "../DesktopIcons.module.scss";
import { useTranslation } from "next-i18next";
import Image from "next/image";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { useAppDispatch } from "@/shared/hooks/useAppDispatch";
import { openFolder } from "@/store/slices/desktopSlice";

export const PC = () => {
  const { t } = useTranslation("desktopLayout");
  const iconSize = useSelector((state: RootState) => state.desktop.iconSize);

  const dispatch = useAppDispatch();

  const handleDoubleClick = (e: React.MouseEvent) => {
    dispatch(
      openFolder({
        id: "pc",
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
        src="/img/icons/pc.png"
        alt="PC"
        className={cls.img}
        width={iconSize / 2}
        height={iconSize / 2}
      />
      <p className={cls.title}>{t("Мой Компьютер")}</p>
    </div>
  );
};
