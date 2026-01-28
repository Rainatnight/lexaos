import useSession from "@/shared/hooks/useSession";
import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import cls from "./Browser.module.scss";

export default function Browser() {
  const { token, user } = useSession();
  const imgRef = useRef<HTMLImageElement>(null);
  const [url, setUrl] = useState("https://www.google.com");
  const [browserSocket, setBrowserSocket] = useState<any | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 1280, height: 720 });

  useEffect(() => {
    const bs = io(
      `${process.env.NEXT_PUBLIC_SOCKET}/browser` ||
        "http://localhost:5000/browser",
      {
        extraHeaders: { authorization: token as string },
      },
    );

    setBrowserSocket(bs);

    bs.on("screen", (data: any) => {
      if (!imgRef.current) return;
      const blob = new Blob([data], { type: "image/jpeg" });
      imgRef.current.src = URL.createObjectURL(blob);
    });

    return () => {
      bs.disconnect();
    };
  }, []);

  const sendClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!browserSocket) return;
    const rect = e.currentTarget.getBoundingClientRect();
    browserSocket.emit("click", {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const sendType = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!browserSocket) return;
    browserSocket.emit("type", { text: e.key });
  };

  const sendScroll = (e: React.WheelEvent<HTMLDivElement>) => {
    if (!browserSocket) return;
    browserSocket.emit("scroll", { deltaY: e.deltaY });
  };

  const openUrl = () => {
    if (!browserSocket) return;
    browserSocket.emit("url", { url });
  };

  useEffect(() => {
    if (!browserSocket) return;

    const updateSize = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      browserSocket.emit("resize", {
        width: Math.floor(rect.width),
        height: Math.floor(rect.height),
      });
    };

    // первый вызов
    updateSize();

    // слушаем изменение окна
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, [browserSocket]);

  if (!user?.id) {
    return (
      <p className={cls.guest}>
        {"Для использования браузера необходимо авторизоваться"}
      </p>
    );
  }

  return (
    <div ref={containerRef}>
      <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          style={{ flex: 1 }}
        />
        <button onClick={openUrl}>Go</button>
      </div>

      <div
        style={{ border: "1px solid #ccc", width: 1280, height: 720 }}
        onClick={sendClick}
        onKeyDown={sendType}
        onWheel={sendScroll}
        tabIndex={0}
      >
        <img ref={imgRef} style={{ width: "100%", height: "100%" }} />
      </div>
    </div>
  );
}
