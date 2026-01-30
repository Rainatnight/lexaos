"use client";

import React, { useState, useRef, useEffect } from "react";
import cls from "./Terminal.module.scss";
import useSession from "@/shared/hooks/useSession";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { useAppDispatch } from "@/shared/hooks/useAppDispatch";
import {
  addHistory,
  handleCommand,
  handleTabCompletion,
} from "./utils/helpers";
import { openFolder } from "@/store/slices/desktopSlice";
import { createFolderThunk } from "@/store/slices/desktopThunks";

export const Terminal = () => {
  const dispatch = useAppDispatch();
  const { user } = useSession();
  const items = useSelector((state: RootState) => state.desktop.items);
  const [history, setHistory] = useState<string[]>([]); // отображение
  const [commandHistory, setCommandHistory] = useState<string[]>([]); // только команды
  const [input, setInput] = useState("");
  const [currentPath, setCurrentPath] = useState<string>("~");
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [historyIndex, setHistoryIndex] = useState<number | null>(null); // для стрелок

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, [history]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      if (!input.trim()) return;

      const cmd = input.trim();

      // clear
      if (cmd.toLowerCase() === "clear") {
        setHistory([]);
        setInput("");
        setHistoryIndex(null);
        return;
      }

      // сохраняем команду в истории только команд
      setCommandHistory((prev) => [...prev, cmd]);

      // обрабатываем команду
      const output = handleCommand(
        cmd,
        items,
        user?.login,
        currentFolderId,
        currentPath,
        setCurrentFolderId,
        setCurrentPath,
      );

      if (output && typeof output === "object") {
        if (output.type === "openFolder") {
          // открываем файл через Redux
          dispatch(
            openFolder({
              id: output.id,
              x: window.innerWidth / 2,
              y: window.innerHeight / 2,
            }),
          );
          setHistory(addHistory(history, cmd));
        } else if (output.type === "mkdir") {
          // создаём папку через thunk
          let newX = window.innerWidth / 2;
          let newY = window.innerHeight / 2;
          const offset = 10;

          // проверка наложения с существующими элементами
          while (
            items.some(
              (i) => Math.abs(i.x - newX) < 80 && Math.abs(i.y - newY) < 80,
            )
          ) {
            newX += offset;
            newY += offset;
          }

          const folderCount = items.filter(
            (item) =>
              item.type === "folder" && item.name.includes(output.folderName),
          ).length;

          dispatch(
            createFolderThunk({
              name:
                folderCount > 0
                  ? `${output.folderName} ${folderCount + 1}`
                  : output.folderName,
              x: newX,
              y: newY,
              parentId: output.parentId,
              type: "folder",
            }),
          );

          setHistory(
            addHistory(history, cmd, `Folder created: ${output.folderName}`),
          );
        } else if (output.type === "touch") {
          let newX = window.innerWidth / 2;
          let newY = window.innerHeight / 2;
          const offset = 10;

          while (
            items.some(
              (i) => Math.abs(i.x - newX) < 80 && Math.abs(i.y - newY) < 80,
            )
          ) {
            newX += offset;
            newY += offset;
          }

          const docsCount = items.filter(
            (item) =>
              item.type === "txt" &&
              item.name.toLowerCase().includes(output.fileName.toLowerCase()),
          ).length;

          dispatch(
            createFolderThunk({
              name:
                docsCount > 0
                  ? `${output.fileName} ${docsCount + 1}`
                  : output.fileName,
              x: newX,
              y: newY,
              parentId: output.parentId,
              type: "txt",
            }),
          );

          setHistory(
            addHistory(history, cmd, `File created: ${output.fileName}`),
          );
        }
      } else {
        // обычная строка вывода
        setHistory(
          addHistory(
            history,
            cmd,
            typeof output === "string" ? output : undefined,
          ),
        );
      }

      setInput("");
      setHistoryIndex(null); // сброс позиции в истории после отправки команды
    } else if (e.key === "Tab") {
      e.preventDefault();
      const { newInput, suggestions } = handleTabCompletion(
        input,
        items,
        currentFolderId,
      );
      setInput(newInput);
      if (suggestions?.length) {
        setHistory(addHistory(history, input, suggestions.join("  ")));
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (commandHistory.length === 0) return;

      setHistoryIndex((prev) => {
        const newIndex =
          prev === null ? commandHistory.length - 1 : Math.max(0, prev - 1);
        setInput(commandHistory[newIndex]);
        return newIndex;
      });
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (commandHistory.length === 0) return;

      setHistoryIndex((prev) => {
        if (prev === null) return null;

        const newIndex = prev + 1;
        if (newIndex >= commandHistory.length) {
          setInput(""); // очищаем input после последней команды
          return null;
        } else {
          setInput(commandHistory[newIndex]);
          return newIndex;
        }
      });
    }
  };

  return (
    <div className={cls.terminal} onClick={() => inputRef.current?.focus()}>
      <div className={cls.history}>
        {history.map((line, i) => (
          <div key={i}>{line}</div>
        ))}
      </div>
      <div className={cls.inputLine}>
        <span>{user?.login || "Guest"}</span>
        <span>{currentPath}</span>
        <span>$</span>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          autoFocus
        />
      </div>
    </div>
  );
};
