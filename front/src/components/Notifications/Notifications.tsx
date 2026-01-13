import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import cls from "./Notifications.module.scss";
import { useTranslation } from "react-i18next";
import { getShortString } from "@/helpers/getShortString";
import { useAppDispatch } from "@/shared/hooks/useAppDispatch";
import { openFolder } from "@/store/slices/desktopSlice";
import { removeNotification } from "@/store/slices/notifications";

export const Notifications = () => {
  const { t } = useTranslation("notifications");
  const notifications = useSelector(
    (state: RootState) => state.notifications.items
  );

  const dispatch = useAppDispatch();

  const openChat = (e, id: string) => {
    dispatch(
      openFolder({
        id: "chat",
        x: e.clientX,
        y: e.clientY,
      })
    );
    dispatch(removeNotification(id));
  };

  return (
    <div className={cls.notif}>
      {notifications.map((n) => (
        <div
          key={n._id}
          className={cls.msg}
          onClick={(e) => {
            openChat(e, n._id);
          }}
        >
          <p>{`${t("от")} ${n.fromLogin}`}</p>
          <p>{getShortString(n.msg, 50)}</p>
        </div>
      ))}
    </div>
  );
};
