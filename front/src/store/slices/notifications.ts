import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface INotification {
  _id: string;
  app: string;
  msg: string;
  from: string;
  read?: boolean;
  fromLogin: string;
  fromUser: { _id: string; login: string };
}

interface NotificationsState {
  items: INotification[];
}

const initialState: NotificationsState = {
  items: [],
};

const notificationsSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    addNotification(state, action: PayloadAction<INotification>) {
      state.items.unshift(action.payload);
    },

    markAsRead(state, action: PayloadAction<string>) {
      const notif = state.items.find((n) => n._id === action.payload);
      if (notif) notif.read = true;
    },

    clearNotifications(state) {
      state.items = [];
    },

    removeNotification: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((n) => n._id !== action.payload);
    },

    removeCallNotification: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((n) => n.from !== action.payload);
    },
  },
});

export const {
  addNotification,
  markAsRead,
  clearNotifications,
  removeNotification,
  removeCallNotification,
} = notificationsSlice.actions;

export default notificationsSlice.reducer;
