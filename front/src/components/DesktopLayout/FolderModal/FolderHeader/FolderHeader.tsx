import React from "react";
import cls from "./FolderHeader.module.scss";

export const FolderHeader = ({
  item,
  handleMinimize,
  handleMaximize,
  maximized,
  handleCloseWindow,
}) => {
  return (
    <div className={cls.folderHeader}>
      <span>{item.name || "Папка"}</span>
      <div className={cls.controls}>
        <button onClick={handleMinimize}>−</button>

        {/* □ меняется на ⧉ при максимизации */}
        <button onClick={handleMaximize}>{maximized ? "⧉" : "□"}</button>

        <button onClick={handleCloseWindow}>×</button>
      </div>
    </div>
  );
};
