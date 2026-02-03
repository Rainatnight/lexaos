import React, { useRef, useEffect, useState } from "react";
import * as monaco from "monaco-editor";
import styles from "./SandBoxVS.module.scss";

export default function SandBoxVS() {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  const [logs, setLogs] = useState<string[]>([]);
  const runCode = () => {
    if (!editorRef.current || !iframeRef.current) return;

    const code = editorRef.current.getValue();

    iframeRef.current.srcdoc = `
    <html>
      <body>
        <script>
          const log = (...args) => parent.postMessage({ type: 'log', data: args }, '*');
          console.log = log;
          try {
            ${code}
          } catch (e) {
            log('Ошибка:', e);
          }
        <\/script>
      </body>
    </html>
  `;

    setLogs([]);
  };

  useEffect(() => {
    const container = document.getElementById("editor");
    if (container) {
      editorRef.current = monaco.editor.create(container, {
        value: "// Пиши JS здесь\nconsole.log('Hello World');",
        language: "javascript",
        theme: "vs-dark",
        automaticLayout: true,
      });
    }

    return () => editorRef?.current?.dispose();
  }, []);

  useEffect(() => {
    const handler = (event) => {
      if (event.data.type === "log") {
        setLogs((prev) => [...prev, event.data.data.join(" ")]);
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  return (
    <div className={styles.container}>
      <div id="editor" className={styles.editor}></div>

      <button onClick={runCode} className={styles.button}>
        Запустить код
      </button>

      <div className={styles.terminal}>
        {logs.map((log, i) => (
          <div key={i}>{log}</div>
        ))}
      </div>

      <iframe
        ref={iframeRef}
        sandbox="allow-scripts"
        className={styles.iframe}
        title="sandbox"
      ></iframe>
    </div>
  );
}
