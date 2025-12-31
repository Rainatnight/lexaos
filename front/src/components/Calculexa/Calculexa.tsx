import React, { useState } from "react";
import cls from "./Calculexa.module.scss";

export const Calculexa = () => {
  const [value, setValue] = useState("0");

  const handleClick = (val: string) => {
    if (val === "AC") return setValue("0");

    if (val === "=") {
      try {
        setValue(String(eval(value)));
      } catch {
        setValue("Error");
      }
      return;
    }

    setValue((prev) =>
      prev === "0" && !isNaN(Number(val)) ? val : prev + val
    );
  };

  const buttons = [
    "AC",
    "+/-",
    "%",
    "/",
    "7",
    "8",
    "9",
    "*",
    "4",
    "5",
    "6",
    "-",
    "1",
    "2",
    "3",
    "+",
    "0",
    ".",
    "=",
  ];

  return (
    <div className={cls.calc}>
      <div className={cls.display}>{value}</div>

      <div className={cls.buttons}>
        {buttons.map((b) => (
          <button
            key={b}
            className={`${cls.btn} ${
              ["+", "-", "*", "/", "="].includes(b) ? cls.operator : ""
            } ${b === "0" ? cls.zero : ""}`}
            onClick={() => handleClick(b)}
          >
            {b}
          </button>
        ))}
      </div>
    </div>
  );
};
