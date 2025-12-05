import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  addItem,
  DesktopItem,
  moveItem,
  renameItem,
  setItems,
} from "./desktopSlice";
import { api } from "@/shared/api/api";
import { RootState } from "..";

export const createFolderThunk = createAsyncThunk(
  "desktop/createFolder",
  async (
    {
      name,
      x,
      y,
      parentId,
    }: { name: string; x: number; y: number; parentId?: string | null },
    { dispatch, rejectWithValue }
  ) => {
    try {
      const res = await api.post("/folders/create", {
        name,
        x,
        y,
        parentId: parentId ?? null,
      });

      const folder = res.data;

      dispatch(addItem(folder));

      return folder;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || "Server error");
    }
  }
);

// Загружает все элементы рабочего стола пользователя
export const loadDesktopThunk = createAsyncThunk(
  "desktop/loadDesktop",
  async (_, { dispatch, getState, rejectWithValue }) => {
    try {
      const res = await api.get("/folders/find");
      const userItems: DesktopItem[] = res.data;

      const state = getState() as RootState;
      const existingItems = state.desktop.items;

      userItems.forEach((item) => {
        const exists = existingItems.some((i) => i.id === item.id);
        if (!exists) {
          dispatch(addItem(item));
        }
      });

      return userItems;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || "Server error");
    }
  }
);

export const renameFolderThunk = createAsyncThunk(
  "desktop/renameFolder",
  async (
    { id, newName }: { id: string; newName: string },
    { dispatch, rejectWithValue }
  ) => {
    try {
      await api.put("/folders/rename", { id, newName });

      // обновляем Redux только после успешного ответа
      dispatch(renameItem({ id, newName }));

      return { id, newName };
    } catch (err: any) {
      return rejectWithValue(err.response?.data || "Rename error");
    }
  }
);

export const moveItemThunk = createAsyncThunk(
  "desktop/moveFolder",
  async (
    { id, x, y }: { id: string; x: number; y: number },
    { dispatch, rejectWithValue }
  ) => {
    try {
      await api.put("/folders/move", { id, newX: x, newY: y });

      dispatch(
        moveItem({
          id,
          x,
          y,
        })
      );

      return { id, x, y };
    } catch (err: any) {
      return rejectWithValue(err.response?.data || "Move error");
    }
  }
);
