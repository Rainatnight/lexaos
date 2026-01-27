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

  const [history, setHistory] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [currentPath, setCurrentPath] = useState<string>("~");
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, [history]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      if (!input.trim()) return;

      if (input.trim().toLowerCase() === "clear") {
        setHistory([]);
        setInput("");
        return;
      }

      const output = handleCommand(
        input,
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
        setHistory(addHistory(history, input));
      } else {
        setHistory(
          addHistory(
            history,
            input,
            typeof output === "string" ? output : undefined,
          ),
        );
      }

      setInput("");
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
