import Head from "next/head";
import { Geist, Geist_Mono } from "next/font/google";
import MainComponent from "@/components/MainComponent/MainComponent";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import ParticlesBG from "@/components/ParticlesBackground";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function Home() {
  const { backgroundType, backgroundValue } = useSelector(
    (state: RootState) => state.theme
  );

  return (
    <>
      <Head>
        <title>Lexa OS</title>
        <meta name="description" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/img/favicon32x.png" sizes="32x32" />
        <link rel="icon" href="/img/favicon16x.png" sizes="16x16" />
      </Head>

      <div
        className={`${geistSans.variable} ${geistMono.variable}`}
        style={{ position: "relative", height: "100vh" }}
      >
        {/* Фон */}
        {backgroundType === "color" ? (
          <div
            style={{
              backgroundColor: backgroundValue,
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              zIndex: 0,
            }}
          />
        ) : (
          <ParticlesBG
            preset={backgroundValue as "stars" | "snow" | "firefly"}
          />
        )}

        {/* Основной контент */}
        <main
          style={{
            position: "relative",
            zIndex: 1,
            width: "100%",
            height: "100%",
          }}
        >
          <MainComponent />
        </main>
      </div>
    </>
  );
}
