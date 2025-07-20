import { useState } from "react";
import { WasmVer } from "./WasmVer";
import { JavascriptVer } from "./JavascriptVer";
import { Switch } from "antd";

export const Cursor = () => {
  const [isWasmMode, setIsWasmMode] = useState(false);

  const toggleMode = () => {
    setIsWasmMode((prev) => !prev);
  };

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
      <Switch
        checkedChildren="Javascript"
        unCheckedChildren="Wasm"
        defaultChecked
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
