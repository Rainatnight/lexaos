import { useCallback } from "react";
import Particles from "react-tsparticles";
import type { Engine } from "tsparticles-engine";
import { loadStarsPreset } from "tsparticles-preset-stars";
import { loadSnowPreset } from "tsparticles-preset-snow";
import { loadFireflyPreset } from "tsparticles-preset-firefly";

export default function ParticlesBG({
  preset,
}: {
  preset: "stars" | "snow" | "firefly";
}) {
  const particlesInit = useCallback(async (engine: Engine) => {
    // грузим все пресеты, которые нужны
    await loadStarsPreset(engine);
    await loadSnowPreset(engine);
    await loadFireflyPreset(engine);
  }, []);

  return (
    <Particles id="tsparticles" init={particlesInit} options={{ preset }} />
  );
}
