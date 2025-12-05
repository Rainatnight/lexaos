import { UserData } from "@/shared/hooks/useSession";
import React, { ReactNode, createContext, useReducer } from "react";

import { Socket } from "socket.io-client";

type State = {
  isAuthorized: boolean;
  sessionLoad: boolean;
  token: null | string;
  user: UserData | null;
  socket: null | Socket;
};

const initialState = {
  isAuthorized: false,
  sessionLoad: false,
  token: null,
  user: null,
  socket: null,
};

type Action = {
  type: "authorization" | "load_session" | "load_user" | "logout" | "setSocket";
  payload: any;
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "authorization":
      return {
        ...state,
        token: action.payload,
      };
    case "load_session":
      return { ...state, sessionLoad: true };
    case "load_user":
      return {
        ...state,
        isAuthorized: true,
        user: action.payload,
      };
    case "logout":
      return {
        ...state,
        user: null,
        sessionLoad: false,
        isAuthorized: false,
      };
    case "setSocket":
      return {
        ...state,
        socket: action.payload,
      };

    default:
      return state;
  }
}

export const StoreContext = createContext<{
  state: State;
  dispatch: React.Dispatch<any>;
}>({ state: initialState, dispatch: () => null });

const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <StoreContext.Provider value={{ state, dispatch }}>
      {children}
    </StoreContext.Provider>
  );
};

export default StoreProvider;
