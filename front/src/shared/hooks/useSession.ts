import { StoreContext } from "@/store/StoreProvider";
import { useContext, useMemo } from "react";

import { Socket } from "socket.io-client";

export interface UserData {
  id: string;
  login: string;
}

export interface Session {
  isAuthorized: boolean;
  isLoad: boolean;
  token: string | null | boolean;
  user?: UserData | null;
  socket: Socket | null;
  login: (token: string, expiredToken: string, userId: string) => void;
  clear: () => void;
  closeAuthPopup: () => void;
  done: () => void;
  openAuthPopup: (val?: string) => void;
  setUser: (data: UserData) => void;
  onlyAuthorization: (fn: () => void) => void;
  setSocket: (socket: Socket | null) => void;
}

export const TOKEN_KEY = "Meteor.loginToken";
export const USER_KEY = "Meteor.userId";
export const EXPIRES_TOKEN_KEY = "Meteor.loginTokenExpires";

const useSession = (): Session => {
  const { state, dispatch } = useContext(StoreContext);

  return useMemo(
    () => ({
      isAuthorized: state.isAuthorized,
      isLoad: state.sessionLoad,
      user: state.user,
      socket: state.socket,
      token:
        state.token ||
        (typeof window !== "undefined" && localStorage.getItem(TOKEN_KEY)),
      login: (token: string, expiredToken: string, userId: string) => {
        localStorage.setItem(TOKEN_KEY, token);
        localStorage.setItem(USER_KEY, userId);
        localStorage.setItem(EXPIRES_TOKEN_KEY, expiredToken);
        dispatch({
          type: "authorization",
          payload: token,
        });
      },
      setSocket: (socket: Socket | null) => {
        dispatch({
          type: "setSocket",
          payload: socket,
        });
      },
      onlyAuthorization: (afterAuth: () => void) => {
        if (state.isAuthorized) {
          afterAuth();
        } else {
          dispatch({
            type: "authorization_popup",
            payload: {
              type: "login",
              isOpen: true,
            },
          });
        }
      },
      openAuthPopup: (type = "login") => {
        dispatch({
          type: "authorization_popup",
          payload: {
            type,
            isOpen: true,
          },
        });
      },
      closeAuthPopup: () => {
        dispatch({
          type: "authorization_popup",
          payload: {
            type: "login",
            isOpen: false,
          },
        });
      },
      clear: () => {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        localStorage.removeItem(EXPIRES_TOKEN_KEY);

        // if (state.isAuthorized) {
        //   window.location.href = "/";
        // }
      },
      setUser: (user: any) => {
        dispatch({
          type: "load_user",
          payload: {
            ...(state.user || {}),
            ...user,
          },
        });
      },
      done: () => {
        dispatch({ type: "load_session" });
      },
    }),
    [
      state.isAuthorized,
      state.sessionLoad,
      state.token,
      state.user,
      state.socket,
      dispatch,
    ]
  );
};

export default useSession;
