import { useCallback, useEffect, useRef, useState } from "react";
import { WasmVer } from "./WasmVer";
import { JavascriptVer } from "./JavascriptVer";
import { Switch } from "antd";

export const Cursor = () => {
  const [isWasmMode, setIsWasmMode] = useState(localStorage.getItem("cursorMode") === "true");
  const frames = useRef<number[]>([]);
  const [fps, setFps] = useState(0);

  const toggleMode = () => {
    localStorage.setItem("cursorMode", (!isWasmMode).toString());
    setIsWasmMode((prev) => !prev);
  };

  const updateFrame = useCallback(() => {
    const now = performance.now();

    frames.current = frames.current.filter((time) => now - time < 1000);
    frames.current.push(now);

    setFps(frames.current.length);

    return requestAnimationFrame(updateFrame);
  }, []);

  useEffect(() => {
    const frameId = updateFrame();

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [updateFrame]);

  return (
    <div
      className="cursor-container"
      style={{
        width: "100dvw",
        height: "100dvh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 10,
          right: 10,
          background: "rgba(0,0,0,0.5)",
          color: "white",
          padding: "5px 10px",
          borderRadius: "4px",
        }}
      >
        FPS: {fps}
      </div>
      <Switch
        checkedChildren="Javascript"
        unCheckedChildren="Wasm"
        // defaultChecked
        checked={!isWasmMode}
        onChange={toggleMode}
        style={{
          position: "absolute",
          top: 10,
          left: 10,
          zIndex: 1000,
          outline: "none",
        }}
      />

      {isWasmMode ? (
        <WasmVer />
      ) : (
        <JavascriptVer />
      )}
    </div>
  );
};
