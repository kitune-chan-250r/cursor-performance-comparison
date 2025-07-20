import { useCallback, useEffect } from "react";
import { useCursor } from "./hooks/useCursor";

export const Cursor = () => {
  const { canvasRef, cursorPotisions, updateCursorPosition } = useCursor();

  const animateCursor = useCallback(() => {
    // 全てのカーソルを横に1pxずつ動かす
    // 最初は+1pxずつ右に動かし、画面の右端に到達したら左端に戻る

    cursorPotisions.current.forEach((pos, user) => {
      if (!canvasRef.current) return;
      // Example animation logic: move cursor down by 1 pixel
      pos.x += 1;
      if (pos.x >= canvasRef.current.width) {
        pos.x = 0; // Reset to top if it goes off screen
      }
      updateCursorPosition(user, pos);
    });
    requestAnimationFrame(animateCursor);
  }, [canvasRef, cursorPotisions, updateCursorPosition]);

  useEffect(() => {
    animateCursor();
  }, [animateCursor]);

  return (
    <div
      className="cursor-container"
      style={{
        width: "100dvw",
        height: "100dvh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}>
      <canvas className="cursor-canvas" ref={canvasRef} style={{ width: "100%", height: "100%" }} />
    </div>
  );
};
