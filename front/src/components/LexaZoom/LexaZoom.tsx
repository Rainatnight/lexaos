import React, { useEffect, useState } from "react";
import cls from "./LexaZoom.module.scss";
import { api } from "@/shared/api/api";
import { UsersList } from "./UsersList/UsersList";
import { OutgoingCall } from "./OutgoingCall/OutgoingCall";
import { IncomingCall } from "./IncomingCall/IncomingCall";
import useSession from "@/shared/hooks/useSession";
import { CallSession } from "./CallSession/CallSession";

export type ChatUser = {
  _id: string;
  login: string;
};

type Mode = "IDLE" | "OUTGOING_CALL" | "INCOMING_CALL" | "IN_CALL";

export const LexaZoom = () => {
  const [mode, setMode] = useState<Mode>("IDLE");
  const [users, setUsers] = useState<ChatUser[]>([]);
  const [activeUser, setActiveUser] = useState<ChatUser | null>(null);
  const { socket, user } = useSession();
  const [isCallInitiator, setIsCallInitiator] = useState(false);

  useEffect(() => {
    api.get("/users/get-for-chat").then((data) => {
      setUsers(data.data.users);
    });
  }, []);

  const handleCallUser = (Touser: ChatUser) => {
    setActiveUser(Touser);
    setMode("OUTGOING_CALL");
    setIsCallInitiator(true);
    socket?.emit("call:offer", {
      toUserId: Touser._id,
      fromUser: { _id: user?.id, login: user?.login },
    });
  };

  const handleCancelCall = () => {
    if (activeUser) {
      // сообщаем вызываемому, что звонок отменён
      socket?.emit("call:cancel", { toUserId: activeUser._id });
    }

    setActiveUser(null);
    setMode("IDLE");
  };

  const handleAcceptCall = () => {
    if (!activeUser) return;

    setMode("IN_CALL");

    socket?.emit("call:accept", {
      fromUserId: activeUser._id,
    });
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
      setIsCallInitiator(false);
    });

    socket?.on("call:cancelled", () => {
      // вызываемый видит, что звонок отменён
      setActiveUser(null);
      setMode("IDLE");
    });

    socket?.on("call:rejected", () => {
      // вызывающий видит, что звонок отклонён
      setActiveUser(null);
      setMode("IDLE");
    });

    socket?.on("call:accepted", () => {
      setMode("IN_CALL");
    });

    return () => {
      socket?.off("call:incoming");
      socket?.off("call:cancelled");
      socket?.off("call:rejected");
      socket?.off("call:accepted");
    };
  }, [socket]);

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

      {mode === "IN_CALL" && activeUser && (
        <CallSession
          user={activeUser}
          isInitiator={isCallInitiator}
          onEndCall={() => {
            setMode("IDLE");
            setActiveUser(null);
          }}
        />
      )}
    </div>
  );
};
