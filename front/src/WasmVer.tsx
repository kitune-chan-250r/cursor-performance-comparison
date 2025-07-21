import { Fragment, useCallback, useEffect, useRef, useState } from 'react'
import { useCursorWasm } from './hooks/useCursorWasm';

export const WasmVer = () => {
  const [fps, setFps] = useState(0);
  const frames = useRef<number[]>([]);
  const {
    canvasRefWasm,
    isCursorImgLoadedWasm,
    isWasmReady,
    updateWasmCursorPosition,
    get_user_cursor_positions,
  } = useCursorWasm();

  const animateCursorWasm = useCallback(() => {
    const now = performance.now();

    frames.current = frames.current.filter((time) => now - time < 1000);
    frames.current.push(now);

    setFps(frames.current.length);

    // cursorPotisionsWasm.current.forEach((pos, user) => {
    //   if (!canvasRefWasm.current) return;
    //   pos.x += 1; // Move cursor to the right
    //   if (pos.x >= canvasRefWasm.current.width) {
    //     pos.x = 0;
    //   }
    //   updateCursorPositionWasm(user, pos);
    // });

    const userCursorPotisions = get_user_cursor_positions();
    userCursorPotisions.forEach((pos, user) => {
      if (!canvasRefWasm.current) return;
      pos.x += 1; // Move cursor to the right
      if (pos.x >= canvasRefWasm.current.width) {
        pos.x = 0;
      }
      updateWasmCursorPosition(user, pos);
    });

    return requestAnimationFrame(animateCursorWasm);
  }, [canvasRefWasm, get_user_cursor_positions, updateWasmCursorPosition]);

  useEffect(() => {
    if (isWasmReady && isCursorImgLoadedWasm) {
      const frameId = animateCursorWasm();

      return () => {
        cancelAnimationFrame(frameId);
      };
    }
  }, [isWasmReady, isCursorImgLoadedWasm, animateCursorWasm]);

  return (
    <Fragment>
      <canvas
        className="cursor-canvas"
        id="cursorCanvas"
        ref={canvasRefWasm}
        style={{ width: "100%", height: "100%" }}
      />
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
    </Fragment>
  )
}
