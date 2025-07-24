import { useCallback, useEffect } from 'react'
import { useCursorWasm } from './hooks/useCursorWasm';

export const WasmVer = () => {
  const {
    canvasRefWasm,
    isCursorImgLoadedWasm,
    isWasmReady,
    updateWasmCursorPosition,
    get_user_cursor_positions,
  } = useCursorWasm();

  const animateCursorWasm = useCallback(() => {

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

  }, [canvasRefWasm, get_user_cursor_positions, updateWasmCursorPosition]);

  useEffect(() => {
    if (isWasmReady && isCursorImgLoadedWasm) {
      const id = setInterval(animateCursorWasm, 1);

      return () => {
        clearInterval(id);
      };
    }
  }, [isWasmReady, isCursorImgLoadedWasm, animateCursorWasm]);

  return (
    <canvas
      className="cursor-canvas"
      id="cursorCanvas"
      ref={canvasRefWasm}
      style={{ width: "100%", height: "100%" }}
    />
  )
}
