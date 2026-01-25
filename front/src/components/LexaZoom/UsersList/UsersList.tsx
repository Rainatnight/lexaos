import React from "react";
import cls from "./UsersList.module.scss";
import useSession from "@/shared/hooks/useSession";
import { useTranslation } from "react-i18next";
import { ChatUser } from "@/store/slices/callSlice";

type Props = {
  users: ChatUser[];
  onCall: (user: ChatUser) => void;
};

export const UsersList = ({ users, onCall }: Props) => {
  const { user } = useSession();
  const { t } = useTranslation("zoom");

  return (
    <div className={cls.usersWrap}>
      <div className={cls.header}></div>
      {user ? (
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
      ) : (
        <p className={cls.guest}>
          {t("Для использования необходимо авторизоваться")}
        </p>
      )}
    </div>
  );
};
