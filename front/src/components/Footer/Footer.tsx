import React, {
  FC,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Calendar from "react-calendar";
import { useTranslation } from "next-i18next";

import InstrumentsIcon from "@/shared/api/ui/Icons/InstrumentsIcon";
import i18next from "@/shared/api/config/i18n/i18next";

import { Menu } from "./Menu/Menu";
import { BottomPanel } from "./BottomPanel/BottomPanel";

import "react-calendar/dist/Calendar.css";
import cls from "./Footer.module.scss";

const Footer: FC = () => {
  const [time, setTime] = useState<Date>(new Date());
  const [showCalendar, setShowCalendar] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [isClient, setIsClient] = useState<boolean>(false);

  const calendarRef = useRef<HTMLDivElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const { t, i18n } = useTranslation("footer");

  const { formattedTime, formattedDate } = useMemo(() => {
    const hours = String(time.getHours()).padStart(2, "0");
    const minutes = String(time.getMinutes()).padStart(2, "0");
    const day = String(time.getDate()).padStart(2, "0");
    const month = String(time.getMonth() + 1).padStart(2, "0");
    const year = time.getFullYear();

    return {
      formattedTime: `${hours}:${minutes}`,
      formattedDate: `${day}.${month}.${year}`,
    };
  }, [time]);

  const toggleLanguage = useCallback(() => {
    const newLang = i18n.language === "ru" ? "en" : "ru";
    i18next.changeLanguage(newLang);
    localStorage.setItem("currentLanguage", newLang);
  }, [i18n.language]);

  const toggleCalendar = useCallback(() => {
    setShowCalendar((prev) => !prev);
  }, []);

  const toggleMenu = useCallback(() => {
    setShowModal((prev) => !prev);
  }, []);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    const storedLang = localStorage.getItem("currentLanguage");
    const browserLang =
      typeof navigator !== "undefined"
        ? navigator.language.slice(0, 2).toLowerCase()
        : "ru";

    i18next.changeLanguage(storedLang ?? browserLang);
  }, [isClient]);

  // click outside: calendar
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
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showCalendar]);

  // click outside: menu
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
      {/* LEFT */}
      <div className={cls.left}>
        <div className={cls.hover} onClick={toggleMenu}>
          <InstrumentsIcon />
        </div>
        {/* <div className={cls.hover}>
          <SearchIcon />
        </div> */}
      </div>

      {/* MIDDLE */}
      <div className={cls.mid}>
        <BottomPanel />
      </div>

      {/* RIGHT */}
      <div className={cls.right}>
        <div className={cls.hover} onClick={toggleLanguage}>
          {t("РУС")}
        </div>

        <div className={cls.time} onClick={toggleCalendar}>
          <div>{isClient ? formattedTime : "--:--"}</div>
          <div>{isClient ? formattedDate : "--.--.----"}</div>
        </div>
      </div>

      {/* CALENDAR */}
      {showCalendar && (
        <div className={cls.calendarWrapper} ref={calendarRef}>
          <Calendar
            showFixedNumberOfWeeks
            locale={i18n.language}
            value={time}
            tileClassName={({ date, view }) => {
              if (view !== "month") return "";

              const today = new Date();
              today.setHours(0, 0, 0, 0);

              const current = new Date(date);
              current.setHours(0, 0, 0, 0);

              if (current < today) return cls.pastDay;
              if (current > today) return cls.futureDay;
              return cls.today;
            }}
          />
        </div>
      )}

      {/* MENU */}
      {showModal && <Menu menuRef={menuRef} />}
    </div>
  );
};

export default Footer;
