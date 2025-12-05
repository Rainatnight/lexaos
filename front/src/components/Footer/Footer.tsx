import React, { useEffect, useRef, useState } from "react";
import InstrumentsIcon from "@/shared/api/ui/Icons/InstrumentsIcon";
import SearchIcon from "@/shared/api/ui/Icons/SearchIcon";
import { useTranslation } from "react-i18next";
import i18next from "@/shared/api/config/i18n/i18next";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import cls from "./Footer.module.scss";
import { Menu } from "./Menu/Menu";
import { BottomPanel } from "./BottomPanel/BottomPanel";

const Footer = () => {
  const [time, setTime] = useState(new Date());
  const { t, i18n } = useTranslation("footer");
  const [showCalendar, setShowCalendar] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const calendarRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const hours = String(time.getHours()).padStart(2, "0");
  const minutes = String(time.getMinutes()).padStart(2, "0");
  const day = String(time.getDate()).padStart(2, "0");
  const month = String(time.getMonth() + 1).padStart(2, "0");
  const year = time.getFullYear();

  const formattedTime = `${hours}:${minutes}`;
  const formattedDate = ` ${day}.${month}.${year}`;

  const toggleLanguage = () => {
    const newLang = i18n.language === "ru" ? "en" : "ru";
    i18next.changeLanguage(newLang);
    localStorage.setItem("currentLanguage", newLang);
  };

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const language =
      localStorage.getItem("currentLanguage") ||
      (navigator ? navigator.language.substr(0, 2).toLowerCase() : "ru");
    i18next.changeLanguage(language);
  }, []);

  // закрытие при клике вне календаря
  useEffect(() => {
    if (!showCalendar) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        calendarRef.current &&
        !calendarRef.current.contains(e.target as Node)
      ) {
        setShowCalendar(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showCalendar]);

  useEffect(() => {
    if (!showModal) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowModal(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showModal]);

  return (
    <div className={cls.footer}>
      <div className={cls.left}>
        <div className={cls.hover} onClick={() => setShowModal(!showModal)}>
          <InstrumentsIcon />
        </div>
        <div className={cls.hover}>
          <SearchIcon />
        </div>
      </div>

      <div className={cls.mid}>
        <BottomPanel />
      </div>

      <div className={cls.right}>
        <div className={cls.hover} onClick={toggleLanguage}>
          {t("РУС")}
        </div>
        <div
          className={cls.time}
          onClick={() => setShowCalendar(!showCalendar)}
        >
          <div>{formattedTime}</div>
          <div>{formattedDate}</div>
        </div>
      </div>

      {showCalendar && (
        <div className={cls.calendarWrapper} ref={calendarRef}>
          <Calendar
            showFixedNumberOfWeeks={true}
            locale={i18n.language}
            value={time}
            tileClassName={({ date, view }) => {
              if (view === "month") {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const d = new Date(date);
                d.setHours(0, 0, 0, 0);

                if (d < today) return cls.pastDay; // прошедшие
                if (d > today) return cls.futureDay; // будущие
                return cls.today; // сегодня
              }
              return "";
            }}
          />
        </div>
      )}

      {showModal && (
        <>
          <Menu menuRef={menuRef} />
        </>
      )}
    </div>
  );
};

export default Footer;
