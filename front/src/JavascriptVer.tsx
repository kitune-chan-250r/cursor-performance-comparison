import { Fragment, useCallback, useEffect, useRef, useState } from 'react'
import { useCursor } from './hooks/useCursor';

export const JavascriptVer = () => {
  const { canvasRef, cursorPotisions, updateCursorPosition } = useCursor();
  const [fps, setFps] = useState(0);
  const frames = useRef<number[]>([]);

  const animateCursor = useCallback(() => {
    const now = performance.now();

    frames.current = frames.current.filter((time) => now - time < 1000);
    frames.current.push(now);

    setFps(frames.current.length);

    cursorPotisions.current.forEach((pos, user) => {
      if (!canvasRef.current) return;
      pos.x += 1; // Move cursor to the right
      if (pos.x >= canvasRef.current.width) {
        pos.x = 0;
      }
      updateCursorPosition(user, pos);
    });
    return requestAnimationFrame(animateCursor);
  }, [canvasRef, cursorPotisions, updateCursorPosition]);

  useEffect(() => {
    const frameId = animateCursor();

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [animateCursor]);

  return (
    <Fragment>
      <canvas
        className="cursor-canvas"
        id="cursorCanvas"
        ref={canvasRef}
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
