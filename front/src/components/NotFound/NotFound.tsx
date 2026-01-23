import Link from "next/link";
import styles from "./NotFound.module.scss";
import { useTranslation } from "react-i18next";

export default function NotFound() {
  const { t } = useTranslation("notfound");

  return (
    <div className={styles.container}>
      <div className={styles.background}></div>
      <div className={styles.content}>
        <h1 className={styles.code}>404</h1>
        <p className={styles.text}>
          {t("Упс! Похоже, вы попали в пространство, которого не существует.")}
        </p>
        <Link href="/" className={styles.button}>
          {t("Вернуться на главную")}
        </Link>
      </div>
    </div>
  );
}
