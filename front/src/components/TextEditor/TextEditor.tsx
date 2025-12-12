import React, { useState, useRef } from "react";
import cls from "./TextEditor.module.scss";

export const TextEditor = () => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [content, setContent] = useState("");
  const [currentColor, setCurrentColor] = useState("#000000");
  const [currentFontSize, setCurrentFontSize] = useState("16px");

  const COLORS = [
    "#000000", // черный
    "#FF0000", // красный
    "#00FF00", // зеленый
    "#0000FF", // синий
    "#FFA500", // оранжевый
    "#800080", // фиолетовый
    "#008080", // бирюзовый
    "#808080", // серый
  ];

  const applyStyle = (style: {
    color?: string;
    fontSize?: string;
    fontWeight?: string;
  }) => {
    const sel = window.getSelection();
    if (!sel) return;

    if (!sel.isCollapsed) {
      const range = sel.getRangeAt(0);
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
      if (style.color) document.execCommand("foreColor", false, style.color);
      if (style.fontWeight === "bold") document.execCommand("bold", false);
      if (style.fontSize) {
        document.execCommand("fontSize", false, "7");
        const editor = editorRef.current;
        if (editor) {
          const spans = editor.querySelectorAll("font[size='7']");
          spans.forEach((f) => {
            (f as HTMLElement).style.fontSize = style.fontSize!;
            f.removeAttribute("size");
          });
        }
      }
    }

    if (editorRef.current) editorRef.current.focus();
  };

  const onInput = (e: React.FormEvent<HTMLDivElement>) => {
    setContent(e.currentTarget.innerHTML);
  };

  return (
    <div className={cls.wrap}>
      <div className={cls.toolbar}>
        <select
          className={cls.select}
          value={currentFontSize}
          onChange={(e) => {
            const v = e.target.value;
            setCurrentFontSize(v);
            applyStyle({ fontSize: v });
          }}
        >
          <option value="14px">14px</option>
          <option value="16px">16px</option>
          <option value="18px">18px</option>
          <option value="24px">24px</option>
          <option value="32px">32px</option>
        </select>

        {/* Цвета */}
        {COLORS.map((c) => (
          <button
            key={c}
            className={cls.colorBtn}
            style={{
              backgroundColor: c,
              border: currentColor === c ? "2px solid #000" : "1px solid #ccc",
            }}
            onMouseDown={(ev) => ev.preventDefault()}
            onClick={() => {
              setCurrentColor(c);
              applyStyle({ color: c });
            }}
          />
        ))}

        <button
          className={cls.boldBtn}
          onMouseDown={(ev) => ev.preventDefault()}
          onClick={() => applyStyle({ fontWeight: "bold" })}
        >
          B
        </button>
      </div>

      <div
        ref={editorRef}
        className={cls.editor}
        contentEditable
        suppressContentEditableWarning
        onInput={onInput}
        style={{ color: "#000000", fontSize: currentFontSize }}
      />
    </div>
  );
};
