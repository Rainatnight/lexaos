import { DesktopItem } from "@/store/slices/desktopSlice";

export const COMMANDS = [
  "help",
  "clear",
  "hello",
  "ls",
  "cd",
  "pwd",
  "whoami",
  "echo",
  "date",
  "touch",
];

export const addHistory = (history: string[], cmd: string, output?: string) => [
  ...history,
  `$ ${cmd}`,
  ...(output ? [output] : []),
];

export const getFoldersInCurrent = (
  items: DesktopItem[],
  currentFolderId: string | null,
) =>
  items.filter(
    (i) =>
      (currentFolderId
        ? i.parentId === currentFolderId
        : i.parentId === null) && i.type === "folder",
  );

export const getItemsInCurrent = (
  items: DesktopItem[],
  currentFolderId: string | null,
) =>
  items.filter(
    (i) =>
      (currentFolderId
        ? i.parentId === currentFolderId
        : i.parentId === null) &&
      (i.type === "folder" || i.type === "txt"),
  );

export const handleCD = (
  target: string | undefined,
  currentFolderId: string | null,
  items: DesktopItem[],
  currentPath: string,
  setCurrentFolderId: (id: string | null) => void,
  setCurrentPath: (path: string) => void,
): string | null => {
  if (!target) {
    setCurrentFolderId(null);
    setCurrentPath("~");
    return null;
  }

  if (target === "..") {
    if (!currentFolderId) return "Already at root";

    const current = items.find((i) => i.id === currentFolderId);
    if (current?.parentId) {
      setCurrentFolderId(current.parentId);
      const parent = items.find((i) => i.id === current.parentId);
      setCurrentPath(parent ? `~/${parent.name}` : "~");
    } else {
      setCurrentFolderId(null);
      setCurrentPath("~");
    }
    return null;
  }

  const folder = getFoldersInCurrent(items, currentFolderId).find(
    (i) => i.name.toLowerCase() === target.toLowerCase(),
  );
  if (folder) {
    setCurrentFolderId(folder.id);
    setCurrentPath(`${currentPath === "~" ? "~" : currentPath}/${folder.name}`);
    return null;
  }

  return `Folder not found: ${target}`;
};

export const handleTabCompletion = (
  input: string,
  items: DesktopItem[],
  currentFolderId: string | null,
): { newInput: string; suggestions?: string[] } => {
  const parts = input.trim().split(" ");
  const lastWord = parts[parts.length - 1].toLowerCase();
  let suggestions: string[] = [];

  if (parts.length === 1) {
    // автодополнение команд
    suggestions = COMMANDS.filter((c) => c.startsWith(lastWord));
  } else {
    const baseCmd = parts[0].toLowerCase();

    if (baseCmd === "cd") {
      // подставляем только папки
      suggestions = getFoldersInCurrent(items, currentFolderId)
        .map((c) => c.name)
        .filter((name) => name.toLowerCase().startsWith(lastWord));
    } else if (baseCmd === "nano") {
      // подставляем только .txt файлы
      suggestions = getItemsInCurrent(items, currentFolderId)
        .filter((i) => i.type === "txt")
        .map((i) => i.name)
        .filter((name) => name.toLowerCase().startsWith(lastWord));
    }
  }

  if (suggestions.length === 1) {
    parts[parts.length - 1] = suggestions[0];
    return { newInput: parts.join(" ") + " " };
  } else if (suggestions.length > 1) {
    return { newInput: input, suggestions };
  }

  return { newInput: input };
};

export type CommandOutput =
  | string
  | { type: "openFolder"; id: string }
  | { type: "mkdir"; folderName: string; parentId: string | null }
  | { type: "touch"; fileName: string; parentId: string | null }
  | null;

export const handleCommand = (
  cmd: string,
  items: DesktopItem[],
  userLogin: string | undefined,
  currentFolderId: string | null,
  currentPath: string,
  setCurrentFolderId: (id: string | null) => void,
  setCurrentPath: (path: string) => void,
): CommandOutput => {
  const parts = cmd.trim().split(" ");
  const baseCmd = parts[0].toLowerCase();
  let output: CommandOutput = null;

  switch (baseCmd) {
    case "help":
      output = "Commands: help, clear, hello, ls, cd";
      break;
    case "hello":
      output = `Hello, ${userLogin || "Guest"}!`;
      break;
    case "ls":
      const children = getItemsInCurrent(items, currentFolderId);
      output = children.length
        ? children.map((c) => c.name).join("  ")
        : "(empty)";
      break;
    case "pwd":
      output = currentPath;
      break;
    case "whoami":
      output = userLogin || "Guest";
      break;
    case "cd":
      output = handleCD(
        parts[1],
        currentFolderId,
        items,
        currentPath,
        setCurrentFolderId,
        setCurrentPath,
      );
      break;
    case "clear":
      output = null;
      break;
    case "nano":
      if (!parts[1]) {
        output = "Usage: nano <filename>";
      } else {
        const fileName = parts[1].toLowerCase();
        const file = getItemsInCurrent(items, currentFolderId).find(
          (i) => i.type === "txt" && i.name.toLowerCase() === fileName,
        );

        if (file) {
          output = { type: "openFolder", id: file.id };
        } else {
          output = `File not found: ${parts[1]}`;
        }
      }
      break;

    case "mkdir":
      if (!parts[1]) {
        output = "Usage: mkdir <foldername>";
      } else {
        const folderName = parts.slice(1).join(" ");
        output = {
          type: "mkdir",
          folderName,
          parentId: currentFolderId,
        };
      }
      break;

    case "touch":
      if (!parts[1]) {
        output = "Usage: touch <filename>";
      } else {
        const fileName = parts.slice(1).join(" ");
        output = {
          type: "touch",
          fileName,
          parentId: currentFolderId,
        };
      }
      break;

    case "echo":
      output = parts.slice(1).join(" ");
      break;

    case "date":
      output = new Date().toLocaleString();
      break;

    default:
      output = `Command not found: ${cmd}`;
  }

  return output;
};
