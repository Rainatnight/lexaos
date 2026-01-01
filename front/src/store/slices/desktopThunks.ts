import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  addItem,
  DesktopItem,
  moveItem,
  moveItemToFolder,
  removeManyItems,
  renameItem,
  updateTextContent,
} from "./desktopSlice";
import { api } from "@/shared/api/api";
import { RootState } from "..";
import { USER_KEY } from "@/shared/hooks/useSession";
import { nanoid } from "nanoid";

interface IFolder {
  id: string;
  name: string;
  x: number;
  y: number;
  parentId: string | null;
  type: "folder" | "txt";
  content?: string;
}

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
      type,
    }: {
      name: string;
      x: number;
      y: number;
      parentId?: string | null;
      type: "folder" | "txt";
    },
    { dispatch, rejectWithValue }
  ) => {
    try {
      const user = localStorage.getItem(USER_KEY);
      let folder: IFolder;

      if (user) {
        const res = await api.post("/folders/create", {
          name,
          x,
          y,
          parentId: parentId ?? null,
          type,
        });
        folder = res.data;

        dispatch(
          addItem({ x, y, parentId, name, id: folder.id, type, content: "" })
        );
      } else {
        folder = {
          id: nanoid(),
          name,
          x,
          y,
          parentId: parentId ?? null,
          type,
          content: "",
        };
        dispatch(addItem(folder));
      }

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
      const user = localStorage.getItem(USER_KEY);
      let userItems: DesktopItem[] = [];

      if (user) {
        const res = await api.get("/folders/find");
        userItems = res.data;

        const state = getState() as RootState;
        const existingItems = state.desktop.items;

        userItems.forEach((item) => {
          const exists = existingItems.some((i) => i.id === item.id);
          if (!exists) {
            dispatch(addItem(item));
          }
        });
      } else {
        // Если юзера нет — можно вернуть локальные элементы из Redux
        const state = getState() as RootState;
        userItems = state.desktop.items;
      }

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
      const user = localStorage.getItem(USER_KEY);

      if (user) {
        await api.put("/folders/rename", { id, newName });
      }

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
      const user = localStorage.getItem(USER_KEY);

      if (user) {
        await api.put("/folders/move", { id, newX: x, newY: y });
      }

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

      const user = localStorage.getItem(USER_KEY);

      if (user) {
        await api.put("/folders/move-to-folder", {
          id: itemId,
          parentId,
          x,
          y,
        });
      }

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

export const clearbinThunk = createAsyncThunk<
  string[],
  void,
  { state: RootState }
>("desktop/clearbin", async (_, { getState, dispatch, rejectWithValue }) => {
  try {
    const state = getState();
    const allItems = state.desktop.items;

    const binRoots = allItems.filter((i) => i.parentId === "bin");

    const allIdsToDelete: string[] = [];

    const collectChildren = (id: string) => {
      allIdsToDelete.push(id);

      const children = allItems.filter((item) => item.parentId === id);
      children.forEach((child) => collectChildren(child.id));
    };

    binRoots.forEach((root) => collectChildren(root.id));

    const user = localStorage.getItem(USER_KEY);

    if (user) {
      await api.post("/folders/clear-bin", { ids: allIdsToDelete });
    }

    dispatch(removeManyItems(allIdsToDelete));

    return allIdsToDelete;
  } catch (err: any) {
    return rejectWithValue(err.response?.data || "Clear bin error");
  }
});

export const saveTextFileThunk = createAsyncThunk(
  "desktop/saveTextFile",
  async (
    { id, content }: { id: string; content: string },
    { dispatch, rejectWithValue }
  ) => {
    try {
      const user = localStorage.getItem(USER_KEY);

      // если залогинен — сохраняем на сервер
      if (user) {
        await api.put("/folders/save-text", {
          id,
          content,
        });
      }

      // всегда обновляем redux
      dispatch(
        updateTextContent({
          id,
          content,
        })
      );

      return { id, content };
    } catch (err: any) {
      return rejectWithValue(err.response?.data || "Save text error");
    }
  }
);
