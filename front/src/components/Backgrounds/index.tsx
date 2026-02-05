"use client";

import { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import type * as THREEType from "three";
import type { RootState } from "@/store";

export type VantaType = "net" | "fog" | "cells" | "dots";

export default function Background() {
  const ref = useRef<HTMLDivElement>(null);

  const { backgroundType, backgroundValue } = useSelector(
    (state: RootState) => state.theme,
  );

  useEffect(() => {
    // работаем только если тип preset
    if (backgroundType !== "preset") return;

    let vantaEffect: any;

    const init = async () => {
      const THREE = (await import("three")) as typeof THREEType;

      const effectsMap: Record<VantaType, string> = {
        net: "vanta.net.min",
        fog: "vanta.fog.min",
        cells: "vanta.cells.min",
        dots: "vanta.dots.min",
      };

      const type: VantaType = effectsMap[backgroundValue as VantaType]
        ? (backgroundValue as VantaType)
        : "net";

      const effectModule = await import(`vanta/dist/${effectsMap[type]}`);
      const Effect = effectModule.default;

      vantaEffect = Effect({
        el: ref.current,
        THREE,
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        backgroundColor: 0x000000,
        color: 0xffffff,
      });
    };

    init();

    return () => {
      if (vantaEffect) vantaEffect.destroy();
    };
  }, [backgroundType, backgroundValue]);

  return (
    <div
      ref={ref}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: -1,
      }}
    />
  );
}
