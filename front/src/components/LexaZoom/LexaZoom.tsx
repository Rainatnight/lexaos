import React, { useEffect, useState } from "react";
import cls from "./LexaZoom.module.scss";
import { api } from "@/shared/api/api";
import { UsersList } from "./UsersList/UsersList";
import { OutgoingCall } from "./OutgoingCall/OutgoingCall";
import { IncomingCall } from "./IncomingCall/IncomingCall";
import useSession from "@/shared/hooks/useSession";
import { CallSession } from "./CallSession/CallSession";
import { useQuery } from "@tanstack/react-query";

export type ChatUser = {
  _id: string;
  login: string;
};

export const fetchChatUsers = async () => {
  const res = await api.get("/users/get-for-chat");
  return res.data.users;
};

type Mode = "IDLE" | "OUTGOING_CALL" | "INCOMING_CALL" | "IN_CALL";

export const LexaZoom = () => {
  const [mode, setMode] = useState<Mode>("IDLE");
  const [activeUser, setActiveUser] = useState<ChatUser | null>(null);
  const { socket, user } = useSession();
  const [isCallInitiator, setIsCallInitiator] = useState(false);

  const { data: users = [] } = useQuery({
    queryKey: ["chat-users"],
    queryFn: fetchChatUsers,
  });

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

  const handleEndCall = () => {
    if (activeUser) {
      socket?.emit("call:end", {
        toUserId: activeUser._id,
      });
    }

    setMode("IDLE");
    setActiveUser(null);
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

    socket?.on("call:ended", () => {
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
      socket?.off("call:ended");
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
          onEndCall={handleEndCall}
        />
      )}
    </div>
  );
};
