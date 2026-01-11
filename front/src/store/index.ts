import { configureStore } from "@reduxjs/toolkit";
import themeReducer from "./slices/themeSlice";
import desktopReducer from "./slices/desktopSlice";
import desktopLoading from "./slices/loadingSlice";
import notificationsReducer from "./slices/notifications";

export const store = configureStore({
  reducer: {
    theme: themeReducer,
    desktop: desktopReducer,
    desktopLoading: desktopLoading,
    notifications: notificationsReducer,
  },
});

if (typeof window !== "undefined") {
  store.subscribe(() => {
    localStorage.setItem(
      "desktopItems",
      JSON.stringify(store.getState().desktop.items)
    );
  });
}

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
