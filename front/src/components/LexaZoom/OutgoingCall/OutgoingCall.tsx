import React from "react";
import { ChatUser } from "../LexaZoom";
import cls from "./OutgoingCall.module.scss";

type Props = {
  user: ChatUser;
  onCancel: () => void;
};

export const OutgoingCall = ({ user, onCancel }: Props) => {
  return (
    <div className={cls.outgoingWrap}>
      <div className={cls.outgoingCard}>
        <div className={cls.bigAvatar}>
          {user.login.slice(0, 1).toUpperCase()}
        </div>

        <div className={cls.name}>{user.login}</div>
        <div className={cls.status}>Звоним…</div>

        <button className={cls.cancelBtn} onClick={onCancel}>
          Отменить
        </button>
      </div>
    </div>
  );
};
