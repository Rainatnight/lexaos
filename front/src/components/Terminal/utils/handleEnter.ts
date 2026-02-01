import { closeFolder, DesktopItem } from "@/store/slices/desktopSlice";
import { AppDispatch } from "@/store";
import { openFolder } from "@/store/slices/desktopSlice";
import {
  createFolderThunk,
  moveItemToFolderThunk,
} from "@/store/slices/desktopThunks";
import { addHistory, handleCommand } from "./helpers";

interface HandleEnterParams {
  cmd: string;
  history: string[];
  setHistory: (h: string[]) => void;
  commandHistory: string[];
  setCommandHistory: (h: string[]) => void;
  items: DesktopItem[];
  userLogin?: string;
  currentFolderId: string | null;
  setCurrentFolderId: (id: string | null) => void;
  currentPath: string;
  setCurrentPath: (path: string) => void;
  dispatch: AppDispatch;
}

export const handleEnterKey = ({
  cmd,
  history,
  setHistory,
  commandHistory,
  setCommandHistory,
  items,
  userLogin,
  currentFolderId,
  setCurrentFolderId,
  currentPath,
  setCurrentPath,
  dispatch,
}: HandleEnterParams) => {
  if (!cmd.trim()) return;

  const output = handleCommand(
    cmd,
    items,
    userLogin,
    currentFolderId,
    currentPath,
    setCurrentFolderId,
    setCurrentPath,
  );

  setCommandHistory([...commandHistory, cmd]);

  if (output && typeof output === "object") {
    if (output.type === "openFolder") {
      dispatch(
        openFolder({
          id: output.id,
          x: window.innerWidth / 2,
          y: window.innerHeight / 2,
        }),
      );
      setHistory(addHistory(history, cmd));
    } else if (output.type === "rm") {
      dispatch(moveItemToFolderThunk({ itemId: output.id, parentId: "bin" }));
    } else if (output.type === "mkdir" || output.type === "touch") {
      const name =
        output.type === "mkdir" ? output.folderName : output.fileName;
      const parentId = output.parentId;

      let newX = window.innerWidth / 2;
      let newY = window.innerHeight / 2;
      const offset = 10;

      // Проверяем наложение на существующие элементы
      while (
        items.some(
          (i) => Math.abs(i.x - newX) < 80 && Math.abs(i.y - newY) < 80,
        )
      ) {
        newX += offset;
        newY += offset;
      }

      // Считаем, сколько уже есть элементов с таким именем
      const count = items.filter(
        (i) =>
          i.type === (output.type === "mkdir" ? "folder" : "txt") &&
          i.name.toLowerCase().includes(name.toLowerCase()),
      ).length;

      dispatch(
        createFolderThunk({
          name: count > 0 ? `${name} ${count + 1}` : name,
          x: newX,
          y: newY,
          parentId,
          type: output.type === "mkdir" ? "folder" : "txt",
        }),
      );

      setHistory(
        addHistory(
          history,
          cmd,
          `${output.type === "mkdir" ? "Folder" : "File"} created: ${name}`,
        ),
      );
    } else if (output.type === "exit") {
      dispatch(closeFolder("term"));
    }
  } else {
    // Если это просто строка
    setHistory(
      addHistory(history, cmd, typeof output === "string" ? output : undefined),
    );
  }
};
