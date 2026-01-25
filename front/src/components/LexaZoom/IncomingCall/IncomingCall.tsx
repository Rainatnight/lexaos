import React from "react";
import { ChatUser } from "../LexaZoom";
import cls from "./IncomingCall.module.scss";
import { useTranslation } from "react-i18next";

type Props = {
  user: ChatUser;
  onAccept: () => void;
  onReject: () => void;
};

export const IncomingCall = ({ user, onAccept, onReject }: Props) => {
  const { t } = useTranslation("zoom");

  return (
    <div className={cls.incomingWrap}>
      <div className={cls.incomingCard}>
        <div className={cls.bigAvatar}>
          {user.login.slice(0, 1).toUpperCase()}
        </div>

        <div className={cls.name}>{user.login}</div>
        <div className={cls.status}>Входящий звонок</div>

        <div className={cls.actions}>
          <button className={cls.acceptBtn} onClick={onAccept}>
            {t("Принять")}
          </button>

          <button className={cls.rejectBtn} onClick={onReject}>
            {t("Отклонить")}
          </button>
        </div>
      </div>
    </div>
  );
};
