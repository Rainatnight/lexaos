import { DesktopItem } from "@/store/slices/desktopSlice";

export const COMMANDS = ["help", "clear", "hello", "ls", "cd", "pwd", "whoami"];

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
    suggestions = COMMANDS.filter((c) => c.startsWith(lastWord));
  } else if (parts[0] === "cd") {
    suggestions = getFoldersInCurrent(items, currentFolderId)
      .map((c) => c.name)
      .filter((name) => name.toLowerCase().startsWith(lastWord));
  }

  if (suggestions.length === 1) {
    parts[parts.length - 1] = suggestions[0];
    return { newInput: parts.join(" ") + (parts.length === 1 ? " " : "") };
  } else if (suggestions.length > 1) {
    return { newInput: input, suggestions };
  }

  return { newInput: input };
};

export const handleCommand = (
  cmd: string,
  items: DesktopItem[],
  userLogin: string | undefined,
  currentFolderId: string | null,
  currentPath: string,
  setCurrentFolderId: (id: string | null) => void,
  setCurrentPath: (path: string) => void,
): string | null => {
  const parts = cmd.trim().split(" ");
  const baseCmd = parts[0].toLowerCase();
  let output: string | null = null;

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
    default:
      output = `Command not found: ${cmd}`;
  }

  return output;
};
