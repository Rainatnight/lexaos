// store/slices/callSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type Mode = "IDLE" | "OUTGOING_CALL" | "INCOMING_CALL" | "IN_CALL";

export interface ChatUser {
  _id: string;
  login: string;
}

interface CallState {
  mode: Mode;
  activeUser: ChatUser | null; // кто звонит / кому звонят
  isCallInitiator: boolean;
}

const initialState: CallState = {
  mode: "IDLE",
  activeUser: null,
  isCallInitiator: false,
};

export const callSlice = createSlice({
  name: "call",
  initialState,
  reducers: {
    setOutgoingCall(state, action: PayloadAction<ChatUser>) {
      state.activeUser = action.payload;
      state.mode = "OUTGOING_CALL";
      state.isCallInitiator = true;
    },
    setIncomingCall(state, action: PayloadAction<ChatUser>) {
      state.activeUser = action.payload;
      state.mode = "INCOMING_CALL";
      state.isCallInitiator = false;
    },
    setInCall(state) {
      state.mode = "IN_CALL";
    },
    resetCall(state) {
      state.activeUser = null;
      state.mode = "IDLE";
      state.isCallInitiator = false;
    },
  },
});

export const { setOutgoingCall, setIncomingCall, setInCall, resetCall } =
  callSlice.actions;

export default callSlice.reducer;
