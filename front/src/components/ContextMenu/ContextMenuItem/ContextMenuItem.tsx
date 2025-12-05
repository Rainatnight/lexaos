import React, { useState, useRef, useEffect } from "react";
import { MenuOption } from "../Main/ContextMenu";
import cls from "./ContextMenuItem.module.scss";
import { classNames } from "@/helpers/classNames/classNames";

export const ContextMenuItem: React.FC<{
  option: MenuOption;
  onClose: () => void;
}> = ({ option, onClose }) => {
  const [submenuVisible, setSubmenuVisible] = useState(false);
  const [submenuPosition, setSubmenuPosition] = useState<"left" | "right">(
    "right"
  );

  const liRef = useRef<HTMLLIElement | null>(null);
  const submenuRef = useRef<HTMLUListElement | null>(null);

  useEffect(() => {
    if (!submenuVisible) return;

    const calculatePosition = () => {
      const li = liRef.current;
      const submenu = submenuRef.current;
      if (!li || !submenu) return;

      const padding = 8; // отступ от края окна
      const liRect = li.getBoundingClientRect();
      const submenuWidth =
        submenu.offsetWidth || submenu.getBoundingClientRect().width;

      // если справа не вмещается -> открываем влево
      if (liRect.right + submenuWidth > window.innerWidth - padding) {
        setSubmenuPosition("left");
        return;
      }

      // если слева не вмещается -> открываем вправо
      if (liRect.left - submenuWidth < padding) {
        setSubmenuPosition("right");
        return;
      }

      // по умолчанию вправо
      setSubmenuPosition("right");
    };

    calculatePosition();
    window.addEventListener("resize", calculatePosition);
    return () => window.removeEventListener("resize", calculatePosition);
  }, [submenuVisible]);

  return (
    <li
      ref={liRef}
      onMouseEnter={() => setSubmenuVisible(true)}
      onMouseLeave={() => setSubmenuVisible(false)}
      onClick={() => {
        option.action?.();
        onClose();
      }}
      className={classNames(
        cls.item,
        { [cls.underline]: option.hasUnderline },
        []
      )}
    >
      <span>{option.label}</span>
      {option.submenu && <span style={{ float: "right" }}>{">"}</span>}

      {option.submenu && submenuVisible && (
        <ul
          ref={submenuRef}
          className={classNames(cls.submenu, {}, [
            submenuPosition === "left" ? cls.left : cls.right,
          ])}
        >
          {option.submenu.map((sub, idx) => (
            <li
              key={idx}
              onClick={(e) => {
                e.stopPropagation();
                sub.action?.();
                onClose();
              }}
            >
              <span>{sub.label}</span>
              {sub.selected && <span className={cls.star}>★</span>}
            </li>
          ))}
        </ul>
      )}
    </li>
  );
};
