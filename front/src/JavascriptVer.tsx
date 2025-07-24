import { useCallback, useEffect } from 'react'
import { useCursor } from './hooks/useCursor';

export const JavascriptVer = () => {
  const { canvasRef, cursorPotisions, updateCursorPosition } = useCursor();

  const animateCursor = useCallback(() => {
    cursorPotisions.current.forEach((pos, user) => {
      if (!canvasRef.current) return;
      pos.x += 1; // Move cursor to the right
      if (pos.x >= canvasRef.current.width) {
        pos.x = 0;
      }
      updateCursorPosition(user, pos);
    });
  }, [canvasRef, cursorPotisions, updateCursorPosition]);

  useEffect(() => {
    const id = setInterval(animateCursor, 1);
    return () => {
      clearInterval(id);
    };
  }, [animateCursor]);

  return (
    <canvas
      className="cursor-canvas"
      id="cursorCanvas"
      ref={canvasRef}
      style={{ width: "100%", height: "100%" }}
    />
  )
}
