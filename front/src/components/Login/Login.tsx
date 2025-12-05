import React, { useState } from "react";
import Image from "next/image";
import cls from "./Login.module.scss";
import { Input } from "@/shared/api/ui/Input/Input";
import { useTranslation } from "react-i18next";
import { Text, TextVariants } from "@/shared/api/ui/Text/Text";
import { useRouter } from "next/router";
import { api } from "@/shared/api/api";
import useSession from "@/shared/hooks/useSession";

export const Login = () => {
  const router = useRouter();
  const session = useSession();

  const { t } = useTranslation("login");
  const [password, setPassword] = useState("");
  const [login, setLogin] = useState("");
  const [error, setError] = useState<null | string>(null);

  const anonLogin = () => {
    router.push("/");
  };

  const loginFunc = () => {
    api
      .put("/login", { login, password })
      .then(({ data }) => {
        session.login(data.token, data.expiredToken, data.userId);
        session.setUser({
          login: data.login,
          id: data.userId,
        });
        router.push("/");
      })
      .catch((e) => {
        setError(e.response?.data?.msg);
      });
  };

  const createAcc = () => {
    api
      .post("/create", { login, password })
      .then(({ data }) => {
        session.login(data.token, data.expiredToken, data.userId);
        session.setUser({
          login: data.login,
          id: data.userId,
        });
        router.push("/");
      })
      .catch((e) => {
        setError(e.response?.data?.msg);
      });
  };

  return (
    <div className={cls.wrapper}>
      <div className={cls.background}></div>
      <div className={cls.content}>
        <div className={cls.centerBlock}>
          <Image
            src="/img/icons/user1.png"
            alt="User Icon"
            className={cls.img}
            width={100}
            height={100}
          />
          <Input
            className={cls.input}
            value={login}
            placeholder={t("Логин")}
            onChange={(v) => setLogin(v.toLowerCase())}
          />
          <Input
            className={cls.input}
            value={password}
            placeholder={t("Пароль")}
            onChange={(v) => setPassword(v.toLowerCase())}
          />
          {login && password && (
            <>
              <Text className={cls.enter} onClick={loginFunc}>
                {t("Войти")}
              </Text>
              <Text className={cls.enter} onClick={createAcc}>
                {t("Создать аккаунт")}
              </Text>
            </>
          )}

          {error && <Text variant={TextVariants.ERROR}>{error}</Text>}
        </div>

        <Text className={cls.anon} onClick={anonLogin}>
          {t("Войти как гость")}
        </Text>
      </div>
    </div>
  );
};
