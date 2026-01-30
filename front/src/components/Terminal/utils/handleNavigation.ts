import { DesktopItem } from "@/store/slices/desktopSlice";
import { handleTabCompletion } from "./helpers";

export const handleArrowUp = (
  commandHistory: string[],
  setHistoryIndex: any,
  setInput: (v: string) => void,
) => {
  if (!commandHistory.length) return;

  setHistoryIndex((prev: number | null) => {
    const newIndex =
      prev === null ? commandHistory.length - 1 : Math.max(0, prev - 1);
    setInput(commandHistory[newIndex]);
    return newIndex;
  });
};

export const handleArrowDown = (
  commandHistory: string[],
  setHistoryIndex: any,
  setInput: (v: string) => void,
) => {
  if (!commandHistory.length) return;

  setHistoryIndex((prev) => {
    if (prev === null) return null;
    const newIndex = prev + 1;
    if (newIndex >= commandHistory.length) {
      setInput("");
      return null;
    } else {
      setInput(commandHistory[newIndex]);
      return newIndex;
    }
  });
};

export const handleTabKey = (
  input: string,
  items: DesktopItem[],
  currentFolderId: string | null,
  history: string[],
  setInput: (v: string) => void,
  setHistory: (h: string[]) => void,
) => {
  const { newInput, suggestions } = handleTabCompletion(
    input,
    items,
    currentFolderId,
  );
  setInput(newInput);
  if (suggestions?.length) {
    setHistory([...history, `$ ${input}`, suggestions.join("  ")]);
  }
};
