import React, { useState, useRef } from "react";
import cls from "./TextEditor.module.scss";

const COLORS = [
  "#000000",
  "#FF0000",
  "#00FF00",
  "#0000FF",
  "#FFA500",
  "#800080",
  "#008080",
  "#FFC0CB",
];

const FONT_SIZES = ["14px", "16px", "18px", "24px", "32px"];

export const TextEditor = () => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [currentColor, setCurrentColor] = useState("#000000");
  const [currentFontSize, setCurrentFontSize] = useState("16px");
  const [isBold, setIsBold] = useState(false);

  const applyStyle = (style: {
    color?: string;
    fontSize?: string;
    fontWeight?: string;
  }) => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;

    const range = sel.getRangeAt(0);

    if (!range.collapsed) {
      // есть выделение → обернуть в span
      const span = document.createElement("span");
      if (style.color) span.style.color = style.color;
      if (style.fontSize) span.style.fontSize = style.fontSize;
      if (style.fontWeight) span.style.fontWeight = style.fontWeight;
      span.appendChild(range.extractContents());
      range.insertNode(span);

      // сохраняем выделение
      sel.removeAllRanges();
      const newRange = document.createRange();
      newRange.selectNodeContents(span);
      sel.addRange(newRange);
    } else {
      // нет выделения → вставляем пустой span для наследования
      const span = document.createElement("span");
      if (style.color) span.style.color = style.color;
      if (style.fontSize) span.style.fontSize = style.fontSize;
      if (style.fontWeight) span.style.fontWeight = style.fontWeight;
      span.textContent = "\u200B"; // zero-width-space
      range.insertNode(span);

      const newRange = document.createRange();
      newRange.setStart(span.firstChild!, 1);
      newRange.collapse(true);
      sel.removeAllRanges();
      sel.addRange(newRange);
    }

    editorRef.current?.focus();
  };

  return (
    <div className={cls.wrap}>
      <div className={cls.toolbar}>
        {/* Font size */}
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

        {/* Colors */}
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

        {/* Bold */}
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
      </div>

      <div
        ref={editorRef}
        className={cls.editor}
        contentEditable
        suppressContentEditableWarning
        style={{ color: "#000000", fontSize: "16px" }}
      />
    </div>
  );
};
