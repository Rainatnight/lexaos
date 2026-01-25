import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import cls from "./Notifications.module.scss";
import { useTranslation } from "react-i18next";
import { getShortString } from "@/helpers/getShortString";
import { useAppDispatch } from "@/shared/hooks/useAppDispatch";
import { openFolder } from "@/store/slices/desktopSlice";
import { removeNotification } from "@/store/slices/notifications";
import useSession from "@/shared/hooks/useSession";
import { setInCall, setIncomingCall } from "@/store/slices/callSlice";

export const Notifications = () => {
  const { t } = useTranslation("notifications");
  const { socket } = useSession();
  const notifications = useSelector(
    (state: RootState) => state.notifications.items,
  );
  const dispatch = useAppDispatch();

  const openChat = (e, id: string) => {
    dispatch(openFolder({ id: "chat", x: e.clientX, y: e.clientY }));
    dispatch(removeNotification(id));
  };

  const onAccept = (e, id: string, fromUser) => {
    dispatch(setIncomingCall(fromUser));
    dispatch(setInCall());

    socket?.emit("call:accept", { fromUserId: fromUser._id });

    dispatch(openFolder({ id: "zoom", x: e.clientX, y: e.clientY }));
    dispatch(removeNotification(id));
  };

  const onReject = (id: string, fromUserId) => {
    socket?.emit("call:reject", { fromUserId });
    dispatch(removeNotification(id));
  };

  return (
    <div className={cls.notif}>
      {notifications.map((n) => (
        <div
          key={n._id}
          className={cls.msg}
          onClick={(e) => n.app === "chat" && openChat(e, n._id)}
        >
          <p>{`${t("от")} ${n.fromLogin}`}</p>
          <p>{getShortString(n.msg, 50)}</p>
          {n.app === "zoom" && (
            <div className={cls.btns}>
              <button
                className={cls.acceptBtn}
                onClick={(e) =>
                  onAccept(e, n._id, { _id: n.from, login: n.fromLogin })
                }
              >
                {t("Принять")}
              </button>
              <button
                className={cls.rejectBtn}
                onClick={() => onReject(n._id, n.from)}
              >
                {t("Отклонить")}
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
