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
    if (!browserSocket || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const scaleX = imgRef.current!.naturalWidth / rect.width;
    const scaleY = imgRef.current!.naturalHeight / rect.height;

    browserSocket.emit("click", {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
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
    if (!browserSocket || !containerRef.current) return;

    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;

      browserSocket.emit("resize", {
        width: Math.floor(width),
        height: Math.floor(height),
      });
    });

    ro.observe(containerRef.current);

    return () => ro.disconnect();
  }, [browserSocket, containerRef.current]);

  if (!user?.id) {
    return (
      <p className={cls.guest}>
        {"Для использования браузера необходимо авторизоваться"}
      </p>
    );
  }

  return (
    <div ref={containerRef} className={cls.wrap}>
      <div className={cls.controls}>
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className={cls.urlInput}
          placeholder="Введите URL"
        />
        <button className={cls.goButton} onClick={openUrl}>
          Go
        </button>
      </div>

      <div
        className={cls.browser}
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
