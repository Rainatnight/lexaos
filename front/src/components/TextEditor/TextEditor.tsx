import React, { useState, useRef, useEffect } from "react";
import cls from "./TextEditor.module.scss";
import { useAppDispatch } from "@/shared/hooks/useAppDispatch";
import { saveTextFileThunk } from "@/store/slices/desktopThunks";
import { api } from "@/shared/api/api";
import { getFilePath } from "@/helpers/getFilePath/getFilePath";
import { COLORS, FONT_SIZES } from "./helpers";

export const TextEditor = ({ item }) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [currentColor, setCurrentColor] = useState("#000000");
  const [currentFontSize, setCurrentFontSize] = useState("16px");
  const [isBold, setIsBold] = useState(false);

  const dispatch = useAppDispatch();

  const insertNodeAtCursor = (node: Node) => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;

    const range = sel.getRangeAt(0);
    range.deleteContents();
    range.insertNode(node);

    range.setStartAfter(node);
    range.collapse(true);

    sel.removeAllRanges();
    sel.addRange(range);

    editorRef.current?.focus();
  };

  const uploadFile = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    // const res = await api.post<{ data: string }>("/files/upload", formData, {
    //   headers: { "Content-Type": "multipart/form-data; charset=UTF-16" },
    // });

    const res = await api.post<{ data: string }>("/files/upload", formData, {});

    return res.data.data;
  };

  const applyStyle = (style: {
    color?: string;
    fontSize?: string;
    fontWeight?: string;
  }) => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;

    const range = sel.getRangeAt(0);

    if (!range.collapsed) {
      const span = document.createElement("span");
      if (style.color) span.style.color = style.color;
      if (style.fontSize) span.style.fontSize = style.fontSize;
      if (style.fontWeight) span.style.fontWeight = style.fontWeight;

      span.appendChild(range.extractContents());
      range.insertNode(span);

      sel.removeAllRanges();
      const newRange = document.createRange();
      newRange.selectNodeContents(span);
      sel.addRange(newRange);
    } else {
      const span = document.createElement("span");
      if (style.color) span.style.color = style.color;
      if (style.fontSize) span.style.fontSize = style.fontSize;
      if (style.fontWeight) span.style.fontWeight = style.fontWeight;

      span.textContent = "\u200B";
      range.insertNode(span);

      const newRange = document.createRange();
      newRange.setStart(span.firstChild!, 1);
      newRange.collapse(true);

      sel.removeAllRanges();
      sel.addRange(newRange);
    }

    editorRef.current?.focus();
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileId = await uploadFile(file);

    if (file.type.startsWith("image/")) {
      const img = document.createElement("img");
      img.dataset.fileId = fileId;
      img.src = getFilePath(fileId);
      img.style.maxWidth = "100%";
      img.contentEditable = "false";

      insertNodeAtCursor(img);
    } else {
      const link = document.createElement("a");
      link.dataset.fileId = fileId;
      link.href = getFilePath(fileId);
      link.textContent = file.name;
      link.contentEditable = "false";

      insertNodeAtCursor(link);
    }

    e.target.value = "";
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();

    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    const fileId = await uploadFile(file);

    if (file.type.startsWith("image/")) {
      const img = document.createElement("img");
      img.src = getFilePath(fileId);
      img.style.maxWidth = "100%";

      insertNodeAtCursor(img);
    } else {
      const link = document.createElement("a");
      link.href = getFilePath(fileId);
      link.textContent = file.name;

      insertNodeAtCursor(link);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();

    const text = e.clipboardData.getData("text/plain");
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;

    const range = sel.getRangeAt(0);
    range.deleteContents();

    const textNode = document.createTextNode(text);
    range.insertNode(textNode);

    range.setStartAfter(textNode);
    range.collapse(true);

    sel.removeAllRanges();
    sel.addRange(range);
  };

  const handleSave = () => {
    const html = editorRef.current?.innerHTML || "";

    dispatch(
      saveTextFileThunk({
        id: item.id,
        content: html,
      }),
    );
  };
  useEffect(() => {
    if (!editorRef.current) return;

    editorRef.current.innerHTML = item?.content || "";

    const elements = editorRef.current.querySelectorAll("[data-file-id]");

    elements.forEach((el) => {
      const fileId = el.getAttribute("data-file-id");
      if (!fileId) return;

      if (el.tagName === "IMG") {
        el.setAttribute("src", getFilePath(fileId));
      }

      if (el.tagName === "A") {
        el.setAttribute("href", getFilePath(fileId));
      }
    });
  }, [item]);

  return (
    <div className={cls.wrap}>
      <div className={cls.toolbar}>
        {/* font size */}
        <select
          className={cls.select}
          value={currentFontSize}
          onChange={(e) => {
            const size = e.target.value;
            setCurrentFontSize(size);
            applyStyle({ fontSize: size });
          }}
        >
          {FONT_SIZES.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>

        {COLORS.map((c) => (
          <button
            key={c}
            className={cls.colorBtn}
            style={{
              backgroundColor: c,
              border: c === currentColor ? "2px solid #000" : "1px solid #ccc",
            }}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              setCurrentColor(c);
              applyStyle({ color: c });
            }}
          />
        ))}

        {/* bold */}
        <button
          className={`${cls.boldBtn} ${isBold ? cls.active : ""}`}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => {
            setIsBold(!isBold);
            applyStyle({ fontWeight: isBold ? "normal" : "bold" });
          }}
        >
          B
        </button>

        {/* attach file */}
        <button
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => fileInputRef.current?.click()}
        >
          📎
        </button>

        <input
          ref={fileInputRef}
          type="file"
          hidden
          onChange={handleFileSelect}
        />

        {/* save */}
        <button
          className={cls.save}
          onMouseDown={(e) => e.preventDefault()}
          onClick={handleSave}
        >
          Сохранить
        </button>
      </div>

      <div
        ref={editorRef}
        className={cls.editor}
        contentEditable
        suppressContentEditableWarning
        onPaste={handlePaste}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        style={{ color: "#000000", fontSize: "16px" }}
      />
    </div>
  );
};
