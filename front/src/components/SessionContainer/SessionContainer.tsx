import { api } from "@/shared/api/api";
import useSession, { UserData } from "@/shared/hooks/useSession";
import { useEffect } from "react";
import { io } from "socket.io-client";

export const SessionContainer = () => {
  const session = useSession();
  const { setSocket } = useSession();

  useEffect(() => {
    async function initSession() {
      if (session.token) {
        api
          .get<{ user: UserData }>("/user")
          .then(({ data }) => {
            session.setUser({
              ...data.user,
            });
            const socket = io(
              process.env.NEXT_PUBLIC_SOCKET || "http://localhost:5000",
              {
                extraHeaders: { authorization: session.token as string },
              },
            );

            setSocket(socket);
          })
          .catch(() => {
            session.clear();
          })
          .finally(() => {
            session.done();
          });
      } else {
        session.clear();
        session.done();
      }
    }

    initSession();
  }, [session.token]);

  return <></>;
};
