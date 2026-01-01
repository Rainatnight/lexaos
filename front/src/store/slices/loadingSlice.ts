import { createSlice } from "@reduxjs/toolkit";
import { useSelector } from "react-redux";
import { RootState } from "..";

interface DesktopLoadingState {
  createFolder: boolean;
  loadDesktop: boolean;
  renameFolder: boolean;
  moveFolder: boolean;
  moveItem: boolean;
  moveItemToFolder: boolean;
  clearbin: boolean;
  [key: string]: boolean;
}

const initialState: DesktopLoadingState = {
  createFolder: false,
  loadDesktop: false,
  renameFolder: false,
  moveFolder: false,
  moveItem: false,
  moveItemToFolder: false,
  clearbin: false,
};

const desktopLoadingSlice = createSlice({
  name: "desktopLoading",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addMatcher(
        (action) =>
          action.type.startsWith("desktop/") &&
          action.type.endsWith("/pending"),
        (state, action) => {
          const key = action.type
            .replace("desktop/", "")
            .replace("/pending", "");
          state[key] = true;
        }
      )
      .addMatcher(
        (action) =>
          action.type.startsWith("desktop/") &&
          (action.type.endsWith("/fulfilled") ||
            action.type.endsWith("/rejected")),
        (state, action) => {
          const key = action.type
            .replace("desktop/", "")
            .replace(/\/(fulfilled|rejected)$/, "");
          state[key] = false;
        }
      );
  },
});

export const selectDesktopLoading = (
  state: any,
  key: keyof DesktopLoadingState
) => state.desktopLoading[key];

export const selectIsLoading = (state: any, key: keyof DesktopLoadingState) =>
  state.desktopLoading[key];

export const createUseDesktopLoading = (useSelector: any) => {
  return (key: keyof DesktopLoadingState) => {
    return useSelector((state: any) => state.desktopLoading[key]);
  };
};

export const selectAnyDesktopLoading = (state: any) => {
  const loading = state.desktopLoading;
  return Object.values(loading).some(Boolean);
};

export const useDesktopLoading = (key: keyof DesktopLoadingState) =>
  useSelector((state: RootState) => state.desktopLoading[key]);

export default desktopLoadingSlice.reducer;
