import React, { useEffect, useRef, useState } from "react";
import cls from "./LexaChat.module.scss";
import { api } from "@/shared/api/api";
import { classNames } from "@/helpers/classNames/classNames";
import useSession from "@/shared/hooks/useSession";
import { useTranslation } from "react-i18next";

export const LexaChat = () => {
  const [users, setUsers] = useState<{ _id: string; login: string }[]>([]);
  const [selectedChat, setSelectedChat] = useState<null | string>(null);
  const [messages, setMessages] = useState<any>([]);
  const [msg, setMsg] = useState("");

  const [loadingHistory, setLoadingHistory] = useState(false);
  const [hasMoreHistory, setHasMoreHistory] = useState(true);
  const [historySkip, setHistorySkip] = useState(0);
  const messagesRef = useRef<HTMLDivElement>(null);

  const { t } = useTranslation("lexachat");

  const { socket, user } = useSession();

  const sendMsg = () => {
    if (!msg.trim() || !selectedChat) return;

    socket?.emit("message:send", {
      to: selectedChat,
      msg,
    });

    setMsg("");
  };

  const loadHistory = async () => {
    if (!selectedChat || loadingHistory || !hasMoreHistory) return;

    const el = messagesRef.current;
    const scrollHeightBefore = el?.scrollHeight || 0;

    setLoadingHistory(true);

    const res = await api.get("/chats/get-history", {
      params: {
        withUserId: selectedChat,
        skip: historySkip,
        limit: 20,
      },
    });

    const newMessages = res.data.messages;

    setMessages((prev) => [...newMessages, ...prev]);
    setHistorySkip((prev) => prev + newMessages.length);
    if (newMessages.length < 10) setHasMoreHistory(false);

    setLoadingHistory(false);

    // корректируем scrollTop, чтобы оставалось на том же месте
    if (el) {
      const scrollHeightAfter = el.scrollHeight;
      el.scrollTop = scrollHeightAfter - scrollHeightBefore;
    }
  };

  const handleScroll = () => {
    const el = messagesRef.current;
    if (!el) return;

    if (el.scrollTop === 0) {
      loadHistory();
    }
  };

  const filteredMessages = messages.filter(
    (m) =>
      (m.from === selectedChat && m.to === user?.id) || // сообщения от собеседника
      (m.from === user?.id && m.to === selectedChat) //  сообщения этому собеседнику
  );

  useEffect(() => {
    if (!user?.id || !socket) return;

    api.get("/users/get-for-chat").then((data) => {
      setUsers(data.data.users);
    });

    const onNewMessage = (msgData: any) => {
      setMessages((prev) => [...prev, msgData]);
    };

    socket.on("message:new", onNewMessage);

    return () => {
      socket.off("message:new", onNewMessage);
    };
  }, [user, socket]);

  useEffect(() => {
    if (selectedChat) {
      setMessages([]);
      setHistorySkip(0);
      setHasMoreHistory(true);
      loadHistory();
    }
  }, [selectedChat]);

  const selectedUser = users.find((u) => u._id === selectedChat);

  return (
    <div className={cls.wrap}>
      {/* LEFT */}
      <div className={cls.left}>
        <div className={cls.leftHeader}>{t("Чаты")}</div>

        <div className={cls.usersList}>
          {user?.id ? (
            users.map((el) => (
              <div
                key={el._id}
                onClick={() => {
                  setLoadingHistory(false);
                  setHasMoreHistory(true);
                  setHistorySkip(0);

                  setSelectedChat(el._id);
                }}
                className={classNames(cls.userChat, {
                  [cls.chosen]: selectedChat === el._id,
                })}
              >
                <div className={cls.avatar}>{el.login[0].toUpperCase()}</div>
                <div className={cls.login}>{el.login}</div>
              </div>
            ))
          ) : (
            <p className={cls.guest}>
              {t("Для использования чата необходимо авторизоваться")}
            </p>
          )}
        </div>
      </div>

      {/* RIGHT */}
      <div className={cls.right}>
        {!selectedUser ? (
          <div className={cls.empty}>{t("Выберите чат слева")}</div>
        ) : (
          <>
            <div className={cls.chatHeader}>{selectedUser.login}</div>

            <div
              className={cls.messages}
              ref={messagesRef}
              onScroll={handleScroll}
            >
              {filteredMessages.map((m) => (
                <div
                  key={m._id}
                  className={classNames(cls.message, {
                    [cls.myMsg]: m.from === user?.id,
                    [cls.otherMsg]: m.from !== user?.id,
                  })}
                >
                  {m.msg}
                </div>
              ))}
            </div>

            <div className={cls.inputWrap}>
              <input
                value={msg}
                onChange={(e) => setMsg(e.target.value)}
                placeholder={t("Введите сообщение...")}
                className={cls.input}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    sendMsg();
                  }
                }}
              />
              {msg.trim() && (
                <button
                  className={cls.send}
                  onClick={sendMsg}
                  disabled={!msg.trim()}
                >
                  ➤
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
