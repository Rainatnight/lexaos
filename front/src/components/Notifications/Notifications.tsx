import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import cls from "./Notifications.module.scss";

export const Notifications = () => {
  const notifications = useSelector(
    (state: RootState) => state.notifications.items
  );

  return (
    <div className={cls.notif}>
      {notifications.map((n) => (
        <div key={n._id} className={cls.msg}>
          <p>{n.msg}</p>
        </div>
      ))}
    </div>
  );
};
