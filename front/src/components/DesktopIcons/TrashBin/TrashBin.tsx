import React from "react";
import cls from "../DesktopIcons.module.scss";
import { useTranslation } from "react-i18next";
import Image from "next/image";
import { useSelector } from "react-redux";
import { RootState } from "@/store";

export const TrashBin = () => {
  const { t } = useTranslation("desktopLayout");
  const iconSize = useSelector((state: RootState) => state.desktop.iconSize);

  return (
    <div className={cls.wrap} style={{ width: iconSize, height: iconSize }}>
      <Image
        src="/img/icons/bin.png"
        alt="TrashBin"
        className={cls.img}
        width={iconSize / 2}
        height={iconSize / 2}
      />
      <p className={cls.title}>{t("Корзина")}</p>
    </div>
  );
};
