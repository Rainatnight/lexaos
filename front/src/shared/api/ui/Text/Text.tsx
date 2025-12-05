import React, { ReactNode } from "react";

import cls from "./Text.module.scss";
import { classNames } from "@/helpers/classNames/classNames";

export enum TextVariants {
  ERROR = "error",
  SUCCESS = "success",
  HELPER = "helper",

  XL3 = "xl3",
  XL2 = "xl2",
  XL1 = "xl1",
  XL = "xl",
  BASE_LIGHT = "base_light",
  S_LIGHT = "s_light",
  LIGHT = "light",
  BASE = "base",
  BASE_22 = "base_22",
  BASE_12 = "base_12",
  BASE_14 = "base_14",
  LIGHT_13 = "light_13",
}

type Props = {
  className?: string;
  variant?: TextVariants;
  title?: string;
  children: ReactNode;
  onClick?: any;
};

export const Text: React.FC<Props> = ({
  children,
  className,
  variant = TextVariants.BASE,
  title = "",
  onClick,
}) => {
  return (
    <>
      {variant === TextVariants.ERROR && (
        <p
          title={title}
          className={classNames(cls.error, {}, [className])}
          onClick={onClick}
        >
          {children}
        </p>
      )}

      {variant === TextVariants.HELPER && (
        <p
          title={title}
          className={classNames(cls.helper, {}, [className])}
          onClick={onClick}
        >
          {children}
        </p>
      )}

      {variant === TextVariants.SUCCESS && (
        <p
          title={title}
          className={classNames(cls.success, {}, [className])}
          onClick={onClick}
        >
          {children}
        </p>
      )}

      {variant === TextVariants.XL2 && (
        <h2
          title={title}
          className={classNames(cls.xl2, {}, [className])}
          onClick={onClick}
        >
          {children}
        </h2>
      )}

      {variant === TextVariants.XL1 && (
        <h1
          title={title}
          className={classNames(cls.xl1, {}, [className])}
          onClick={onClick}
        >
          {children}
        </h1>
      )}

      {variant === TextVariants.XL && (
        <h4
          title={title}
          className={classNames(cls.xl, {}, [className])}
          onClick={onClick}
        >
          {children}
        </h4>
      )}

      {variant === TextVariants.BASE_LIGHT && (
        <p
          title={title}
          onClick={onClick}
          className={classNames(cls.base_light, {}, [className])}
        >
          {children}
        </p>
      )}

      {variant === TextVariants.S_LIGHT && (
        <p
          title={title}
          className={classNames(cls.s_light, {}, [className])}
          onClick={onClick}
        >
          {children}
        </p>
      )}

      {variant === TextVariants.LIGHT && (
        <p
          title={title}
          className={classNames(cls.light, {}, [className])}
          onClick={onClick}
        >
          {children}
        </p>
      )}

      {variant === TextVariants.BASE && (
        <p
          title={title}
          className={classNames(cls.base, {}, [className])}
          onClick={onClick}
        >
          {children}
        </p>
      )}

      {variant === TextVariants.BASE_22 && (
        <p
          title={title}
          className={classNames(cls.base_22, {}, [className])}
          onClick={onClick}
        >
          {children}
        </p>
      )}

      {variant === TextVariants.BASE_12 && (
        <p
          title={title}
          className={classNames(cls.base_12, {}, [className])}
          onClick={onClick}
        >
          {children}
        </p>
      )}

      {variant === TextVariants.BASE_14 && (
        <p
          title={title}
          className={classNames(cls.base_14, {}, [className])}
          onClick={onClick}
        >
          {children}
        </p>
      )}

      {variant === TextVariants.LIGHT_13 && (
        <p
          title={title}
          className={classNames(cls.light_13, {}, [className])}
          onClick={onClick}
        >
          {children}
        </p>
      )}
    </>
  );
};
