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
import { handleEnterKey } from "./utils/handleEnter";
import {
  handleArrowDown,
  handleArrowUp,
  handleTabKey,
} from "./utils/handleNavigation";

export const Terminal = () => {
  const dispatch = useAppDispatch();
  const { user } = useSession();
  const items = useSelector((state: RootState) => state.desktop.items);
  const [history, setHistory] = useState<string[]>([]);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [currentPath, setCurrentPath] = useState<string>("~");
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [historyIndex, setHistoryIndex] = useState<any>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, [history]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleEnterKey({
        cmd: input,
        history,
        setHistory,
        commandHistory,
        setCommandHistory,
        items,
        userLogin: user?.login,
        currentFolderId,
        setCurrentFolderId,
        currentPath,
        setCurrentPath,
        dispatch,
      });
      setInput("");
      setHistoryIndex(null);
    } else if (e.key === "Tab") {
      e.preventDefault();
      handleTabKey(
        input,
        items,
        currentFolderId,
        history,
        setInput,
        setHistory,
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      handleArrowUp(commandHistory, setHistoryIndex, setInput);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      handleArrowDown(commandHistory, setHistoryIndex, setInput);
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
