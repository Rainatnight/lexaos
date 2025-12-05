import React from "react";
import cls from "./Menu.module.scss";
import Image from "next/image";
import useSession from "@/shared/hooks/useSession";
import router from "next/router";

export const Menu = ({ menuRef }) => {
  const session = useSession();

  return (
    <div className={cls.menu} ref={menuRef}>
      <div className={cls.left}>
        <div
          className={cls.iconWrapper}
          onClick={() => {
            session.clear();
            router.push("/login");
          }}
        >
          <Image src="/img/logout.png" width={40} height={40} alt="logout" />
        </div>
      </div>
      <div className={cls.right}>
        <ul className={cls.list}>
          <li>Профиль</li>
        </ul>
      </div>
    </div>
  );
};
