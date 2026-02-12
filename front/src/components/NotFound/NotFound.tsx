import Link from "next/link";
import { useTranslation } from "react-i18next";
import cls from "./NotFound.module.scss";

export default function NotFound() {
  const { t } = useTranslation("notfound");

  return (
    <div className={cls.container}>
      <div className={cls.background}></div>
      <div className={cls.content}>
        <h1 className={cls.code}>404</h1>
        <p className={cls.text}>
          {t("Упс! Похоже, вы попали в пространство, которого не существует.")}
        </p>
        <Link href="/" className={cls.button}>
          {t("Вернуться на главную")}
        </Link>
      </div>
    </div>
  );
}
