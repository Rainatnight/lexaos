import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import cls from "./MainComponent.module.scss";

import { ContextMenu } from "../ContextMenu/Main/ContextMenu";
import Footer from "../Footer/Footer";
import { DesktopLayout } from "../DesktopLayout/DesktopLayout";
import { RootState } from "@/store";

const MainComponent = () => {
  const [desktopMenu, setDesktopMenu] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const selectedItemId = useSelector(
    (state: RootState) => state.desktop.selectedItemId
  );

  const handleDesktopContextMenu = (x: number, y: number) => {
    if (!selectedItemId) setDesktopMenu({ x, y });
  };

  const handleClickOutside = () => setDesktopMenu(null);

  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => e.preventDefault();
    document.addEventListener("contextmenu", handleContextMenu, true); // true = capture
    return () =>
      document.removeEventListener("contextmenu", handleContextMenu, true);
  }, []);

  return (
    <div className={cls.main} onClick={handleClickOutside}>
      <div className={cls.content}>
        <DesktopLayout onBackgroundContextMenu={handleDesktopContextMenu} />

        {desktopMenu && !selectedItemId && (
          <ContextMenu
            x={desktopMenu.x}
            y={desktopMenu.y}
            onClose={() => setDesktopMenu(null)}
          />
        )}
      </div>
      <Footer />
    </div>
  );
};

export default MainComponent;
