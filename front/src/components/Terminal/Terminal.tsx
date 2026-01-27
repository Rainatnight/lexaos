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

      if (cmd.toLowerCase() === "clear") {
        setHistory([]);
        setInput("");
        setHistoryIndex(null);
        return;
      }

      // сохраняем только команду для стрелок
      setCommandHistory((prev) => [...prev, cmd]);

      const output = handleCommand(
        cmd,
        items,
        user?.login,
        currentFolderId,
        currentPath,
        setCurrentFolderId,
        setCurrentPath,
      );

      if (
        output &&
        typeof output === "object" &&
        output.type === "openFolder"
      ) {
        dispatch(
          openFolder({
            id: output.id,
            x: window.innerWidth / 2,
            y: window.innerHeight / 2,
          }),
        );
        setHistory(addHistory(history, cmd));
      } else {
        setHistory(
          addHistory(
            history,
            cmd,
            typeof output === "string" ? output : undefined,
          ),
        );
      }

      setInput("");
      setHistoryIndex(null); // сброс позиции после ввода
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
          setInput("");
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
