import React, { useEffect, useState } from "react";
import cls from "./LexaZoom.module.scss";
import { api } from "@/shared/api/api";

type ChatUser = {
  _id: string;
  login: string;
};

export const LexaZoom = () => {
  const [users, setUsers] = useState<ChatUser[]>([]);

  useEffect(() => {
    api.get("/users/get-for-chat").then((data) => {
      setUsers(data.data.users);
    });
  }, []);

  const handleCall = (user: ChatUser) => {
    console.log("CALL USER:", user._id);
  };

  return (
    <div className={cls.wrap}>
      <div className={cls.users}>
        {users.map((user) => (
          <div key={user._id} className={cls.user}>
            <div className={cls.avatar}>
              {user.login.slice(0, 1).toUpperCase()}
            </div>

            <div className={cls.info}>
              <div className={cls.name}>{user.login}</div>
            </div>

            <button
              className={cls.callBtn}
              onClick={() => handleCall(user)}
              title="Позвонить"
            >
              📞
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
