import React, { useState, useRef, useEffect } from "react";
import cls from "./Terminal.module.scss";
import useSession from "@/shared/hooks/useSession";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import {
  addHistory,
  handleCommand,
  handleTabCompletion,
} from "./utils/helpers";

export const Terminal = () => {
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
      setHistory(addHistory(history, input, output || undefined));
      setInput("");
    } else if (e.key === "Tab") {
      e.preventDefault();
      const { newInput, suggestions } = handleTabCompletion(
        input,
        items,
        currentFolderId,
      );
      setInput(newInput);
      if (suggestions?.length)
        setHistory(addHistory(history, input, suggestions.join("  ")));
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
