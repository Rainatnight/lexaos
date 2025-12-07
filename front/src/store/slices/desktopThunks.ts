import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  addItem,
  DesktopItem,
  moveItem,
  moveItemToFolder,
  removeManyItems,
  renameItem,
} from "./desktopSlice";
import { api } from "@/shared/api/api";
import { RootState } from "..";

const isDescendant = (items, childId, parentId) => {
  if (!parentId) return false;

  const parent = items.find((i) => i.id === parentId);
  if (!parent) return false;

  // Если родитель имеет parentId = childId — значит он потомок
  if (parent.parentId === childId) return true;

  return isDescendant(items, childId, parent.parentId);
};

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

export const moveItemToFolderThunk = createAsyncThunk(
  "desktop/moveFolder",
  async (
    {
      itemId,
      parentId,
      x,
      y,
    }: {
      itemId: string;
      parentId: string | null;
      x?: number;
      y?: number;
    },
    { dispatch, getState, rejectWithValue }
  ) => {
    try {
      const state = getState() as RootState;
      const items = state.desktop.items;

      // 1. Нельзя вложить в себя самого
      if (itemId === parentId) {
        return rejectWithValue("Cannot move item into itself");
      }

      // 2. Проверка рекурсивного вложения
      if (isDescendant(items, itemId, parentId)) {
        return rejectWithValue("Cannot move folder into its descendant");
      }

      await api.put("/folders/move-to-folder", { id: itemId, parentId, x, y });

      dispatch(
        moveItemToFolder({
          itemId,
          parentId,
          x,
          y,
        })
      );

      return { itemId, parentId, x, y };
    } catch (err: any) {
      return rejectWithValue(err.response?.data || "Move error");
    }
  }
);

export const clearTrashThunk = createAsyncThunk<
  string[],
  void,
  { state: RootState }
>("desktop/clearTrash", async (_, { getState, dispatch }) => {
  const state = getState();
  const allItems = state.desktop.items;

  // получаем корневые элементы в корзине
  const trashRoots = allItems.filter((i) => i.parentId === "trash");

  const allIdsToDelete: string[] = [];

  // рекурсивная функция
  const collectChildren = (id: string) => {
    allIdsToDelete.push(id);

    const children = allItems.filter((item) => item.parentId === id);
    children.forEach((child) => collectChildren(child.id));
  };

  // запускаем рекурсию для каждого корневого элемента корзины
  trashRoots.forEach((root) => collectChildren(root.id));

  await api.post("/folders/clear-trash", { ids: allIdsToDelete });

  // удаляем из стейта
  dispatch(removeManyItems(allIdsToDelete));

  return allIdsToDelete;
});
