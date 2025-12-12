import React, { useState, useRef } from "react";
import cls from "./TextEditor.module.scss";

export const TextEditor = () => {
  const editorRef = useRef(null);
  const [content, setContent] = useState("");
  const [currentColor, setCurrentColor] = useState("#000000");
  const [currentFontSize, setCurrentFontSize] = useState("16px");

  // Apply style to selection or to caret (so next typed text has that style)
  const applyStyle = (style) => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;

    const range = sel.getRangeAt(0);

    // If text is selected → wrap selection with styled span
    if (!range.collapsed) {
      const span = document.createElement("span");
      Object.assign(span.style, style);
      span.appendChild(range.extractContents());
      range.insertNode(span);

      // keep selection on the newly inserted span
      sel.removeAllRanges();
      const newRange = document.createRange();
      newRange.selectNodeContents(span);
      sel.addRange(newRange);

      // focus editor
      if (editorRef.current) (editorRef.current as HTMLElement).focus();
      return;
    }

    // No selection → create an empty styled span containing a zero-width-space
    const span = document.createElement("span");
    span.textContent = "\u200B"; // zero-width space
    Object.assign(span.style, style);

    range.insertNode(span);

    // place caret inside the span after the zero-width-space so typed text inherits style
    sel.removeAllRanges();
    const r = document.createRange();
    // span.firstChild is the text node with the ZWS; set start after that char (offset 1)
    if (span.firstChild) {
      r.setStart(span.firstChild, 1);
      r.collapse(true);
      sel.addRange(r);
    }

    // focus editor
    if (editorRef.current) (editorRef.current as HTMLElement).focus();
  };

  const onInput = (e) => {
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

        <input
          type="color"
          className={cls.color}
          value={currentColor}
          onChange={(e) => {
            const c = e.target.value;
            setCurrentColor(c);
            applyStyle({ color: c });
          }}
        />

        <button
          className={cls.boldBtn}
          onMouseDown={(ev) => ev.preventDefault()} // prevent blurring the editor
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
        // ensure base color is black unless styled
        style={{ color: "#000000" }}
      />
    </div>
  );
};
