import React, { JSX, ReactNode } from "react";

import cls from "./IconComponent.module.scss";
import { classNames } from "@/helpers/classNames/classNames";

export type IconComponentProps = {
  id?: string;
  viewBox?: string;
  fill?: string;
  stroke?: string;
  width?: number;
  height?: number;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
  onClick?: (e: React.MouseEvent) => void;
  pathColor?: string;
  children?: ReactNode;
};

export type IconProps = IconComponentProps;

const IconComponent: React.FC<IconComponentProps> = ({
  className,
  children,
  onClick,
  style,
  size = 24,
  fill = "currentColor",
  viewBox = "0 0 24 24",
  height = 24,
  width = 24,
}): JSX.Element => {
  return (
    <svg
      onClick={onClick}
      viewBox={viewBox}
      fill={fill}
      style={style}
      // @ts-expect-error: Type
      size={{ width: `${size}px`, height: `${size}px`, ...size }}
      height={height}
      width={width}
      className={classNames(cls.IconComponent, {}, [className])}
    >
      {children}
    </svg>
  );
};

export default IconComponent;
