import React from "react";
import cls from "./UsersList.module.scss";
import { ChatUser } from "../LexaZoom";

type Props = {
  users: ChatUser[];
  onCall: (user: ChatUser) => void;
};

export const UsersList = ({ users, onCall }: Props) => {
  return (
    <div className={cls.usersWrap}>
      <div className={cls.header}></div>

      <div className={cls.users}>
        {users.length &&
          users.map((user) => (
            <div key={user._id} className={cls.user}>
              <div className={cls.avatar}>
                {user.login.slice(0, 1).toUpperCase()}
              </div>

              <div className={cls.info}>
                <div className={cls.name}>{user.login}</div>
              </div>

              <button className={cls.callBtn} onClick={() => onCall(user)}>
                📞
              </button>
            </div>
          ))}
      </div>
    </div>
  );
};
