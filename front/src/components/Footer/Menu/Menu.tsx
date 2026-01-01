import React from "react";
import cls from "./Menu.module.scss";
import Image from "next/image";
import useSession from "@/shared/hooks/useSession";
import router from "next/router";
import { useAppDispatch } from "@/shared/hooks/useAppDispatch";
import { clearDesktop } from "@/store/slices/desktopSlice";
import { PanelElements } from "@/components/PanelElements/PanelElements";
import { useTranslation } from "react-i18next";

export const Menu = ({ menuRef }) => {
  const session = useSession();
  const dispatch = useAppDispatch();
  const { t } = useTranslation("footer");

  return (
    <div className={cls.menu} ref={menuRef}>
      <div className={cls.left}>
        <div
          className={cls.iconWrapper}
          onClick={() => {
            session.clear();
            dispatch(clearDesktop());
            router.push("/login");
          }}
        >
          <p>{session.user ? t("Выйти") : t("Войти")}</p>
          <Image src="/img/logout.png" width={40} height={40} alt="logout" />
        </div>
      </div>
      <div className={cls.right}>
        <PanelElements />
      </div>
    </div>
  );
};
