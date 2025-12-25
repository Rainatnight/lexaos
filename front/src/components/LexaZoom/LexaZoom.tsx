import React, { useEffect, useState } from "react";
import cls from "./LexaZoom.module.scss";
import { api } from "@/shared/api/api";
import { UsersList } from "./UsersList/UsersList";
import { OutgoingCall } from "./OutgoingCall/OutgoingCall";
import { IncomingCall } from "./IncomingCall/IncomingCall";
import useSession from "@/shared/hooks/useSession";

export type ChatUser = {
  _id: string;
  login: string;
};

type Mode = "IDLE" | "OUTGOING_CALL" | "INCOMING_CALL";

export const LexaZoom = () => {
  const [mode, setMode] = useState<Mode>("IDLE");
  const [users, setUsers] = useState<ChatUser[]>([]);
  const [activeUser, setActiveUser] = useState<ChatUser | null>(null);
  const { socket } = useSession();

  useEffect(() => {
    api.get("/users/get-for-chat").then((data) => {
      setUsers(data.data.users);
    });
  }, []);

  const handleCallUser = (user: ChatUser) => {
    setActiveUser(user);
    setMode("OUTGOING_CALL");
    // 👉 здесь позже будет socket.emit("call:offer")
  };

  const handleCancelCall = () => {
    setActiveUser(null);
    setMode("IDLE");
  };

  const handleAcceptCall = () => {
    if (!activeUser) return;

    socket?.emit("call:accept", {
      fromUserId: activeUser._id,
    });

    // дальше будет IN_CALL
    console.log("CALL ACCEPTED");
  };

  const handleRejectCall = () => {
    if (!activeUser) return;

    socket?.emit("call:reject", {
      fromUserId: activeUser._id,
    });

    setActiveUser(null);
    setMode("IDLE");
  };

  useEffect(() => {
    socket?.on("call:incoming", ({ fromUser }) => {
      setActiveUser(fromUser);
      setMode("INCOMING_CALL");
    });

    return () => {
      socket?.off("call:incoming");
    };
  }, []);

  return (
    <div className={cls.wrap}>
      {mode === "IDLE" && <UsersList users={users} onCall={handleCallUser} />}

      {mode === "OUTGOING_CALL" && activeUser && (
        <OutgoingCall user={activeUser} onCancel={handleCancelCall} />
      )}

      {mode === "INCOMING_CALL" && activeUser && (
        <IncomingCall
          user={activeUser}
          onAccept={handleAcceptCall}
          onReject={handleRejectCall}
        />
      )}
    </div>
  );
};
