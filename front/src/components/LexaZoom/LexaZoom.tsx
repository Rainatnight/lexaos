import React, { useEffect } from "react";
import cls from "./LexaZoom.module.scss";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { useAppDispatch } from "@/shared/hooks/useAppDispatch";
import {
  ChatUser,
  setOutgoingCall,
  setIncomingCall,
  setInCall,
  resetCall,
} from "@/store/slices/callSlice";
import useSession from "@/shared/hooks/useSession";
import { UsersList } from "./UsersList/UsersList";
import { OutgoingCall } from "./OutgoingCall/OutgoingCall";
import { IncomingCall } from "./IncomingCall/IncomingCall";
import { CallSession } from "./CallSession/CallSession";
import { api } from "@/shared/api/api";
import { useQuery } from "@tanstack/react-query";

export const fetchChatUsers = async () => {
  const res = await api.get("/users/get-for-chat");
  return res.data.users;
};

export const LexaZoom = () => {
  const { socket, user } = useSession();
  const dispatch = useAppDispatch();
  const { mode, activeUser, isCallInitiator } = useSelector(
    (state: RootState) => state.call,
  );
  const { data: users = [] } = useQuery({
    queryKey: ["chat-users"],
    queryFn: fetchChatUsers,
  });

  // Исходящий звонок
  const handleCallUser = (toUser: ChatUser) => {
    dispatch(setOutgoingCall(toUser));
    socket?.emit("call:offer", {
      toUserId: toUser._id,
      fromUser: { _id: user?.id, login: user?.login },
    });
  };

  const handleCancelCall = () => {
    if (!activeUser) return;
    socket?.emit("call:cancel", { toUserId: activeUser._id });
    dispatch(resetCall());
  };

  const handleAcceptCall = () => {
    if (!activeUser) return;
    dispatch(setInCall());
    socket?.emit("call:accept", { fromUserId: activeUser._id });
  };

  const handleRejectCall = () => {
    if (!activeUser) return;
    socket?.emit("call:reject", { fromUserId: activeUser._id });
    dispatch(resetCall());
  };

  const handleEndCall = () => {
    if (!activeUser) return;
    socket?.emit("call:end", { toUserId: activeUser._id });
    dispatch(resetCall());
  };

  useEffect(() => {
    if (!socket) return;

    // Входящий звонок
    socket.on("call:incoming", ({ fromUser }) => {
      dispatch(setIncomingCall(fromUser));
    });

    // Звонок отклонён вызываемым
    socket.on("call:rejected", () => {
      dispatch(resetCall());
    });

    // Звонок отменён вызывающим
    socket.on("call:cancelled", () => {
      dispatch(resetCall());
    });

    // Звонок завершён
    socket.on("call:ended", () => {
      dispatch(resetCall());
    });

    // Звонок принят
    socket.on("call:accepted", () => {
      dispatch(setInCall()); // activeUser у вызывающего уже установлен при исходящем звонке
    });

    return () => {
      socket.off("call:incoming");
      socket.off("call:rejected");
      socket.off("call:cancelled");
      socket.off("call:ended");
      socket.off("call:accepted");
    };
  }, [socket, dispatch]);

  return (
    <div className={cls.wrap}>
      {mode === "IDLE" && <UsersList onCall={handleCallUser} users={users} />}
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
