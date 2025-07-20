import { useCallback, useEffect, useRef, useState } from "react";
import init, { draw_all_cursor } from "../../pkg/canvas_draw_lib.js";
import type { CursorPosition } from "./useCursor.js";

const USERS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
const CURSOR_SIZE = 50; // Size of the cursor in pixels

export const useCursorWasm = () => {
  const [isWasmReady, setIsWasmReady] = useState(false);
  // canvas要素への参照
  const canvasRefWasm = useRef<HTMLCanvasElement>(null);
  // カーソル画像への参照
  const cursorImageRef = useRef<HTMLImageElement>(null);
  // カーソルのロードが完了したかどうかの状態
  const [isCursorImgLoadedWasm, setIsCursorImgLoaded] = useState(false);
  // ユーザーごとのカーソル位置を管理するMap
  const cursorPotisionsWasm = useRef(new Map<string, CursorPosition>());

  const initializeWasm = useCallback(async () => {
    try {
      const wasmModule = await init();
      if (wasmModule) {
        setIsWasmReady(true);
      }
    } catch (error) {
      console.error("Failed to initialize WebAssembly module:", error);
    }
  }, []);

  /**
   * canvas要素とそのコンテキストを取得する関数
   * canvasが存在しない場合はエラーを投げる
   */
  const getCanvasAndCtx = useCallback(() => {
    const canvas = canvasRefWasm.current;
    if (!canvas) throw new Error("Canvas reference is not set");
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Failed to get canvas context");
    return { canvas, ctx };
  }, []);

  /**
   * 各ユーザーの初期カーソル位置を設定する関数
   * 縦に並べる
   */
  const initializeCursorPositions = useCallback(() => {
    let cursorY = 0;
    USERS.forEach((user, index) => {
      cursorPotisionsWasm.current.set(user, { x: 0, y: cursorY });
      cursorY = index * CURSOR_SIZE;
    });
  }, []);

  const initializeCanvas = useCallback(() => {
    const { canvas, ctx } = getCanvasAndCtx();
    // デバイスピクセル比を取得
    const dpr = window.devicePixelRatio || 1;

    // キャンバスの論理サイズを設定
    const displayWidth = canvas.clientWidth;
    const displayHeight = canvas.clientHeight;

    // キャンバスのバッファサイズをデバイスピクセル比に合わせて設定
    canvas.width = displayWidth * dpr;
    canvas.height = displayHeight * dpr;

    // コンテキストのスケールを設定
    ctx.scale(dpr, dpr);

    // 画質向上のための設定
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
  }, [getCanvasAndCtx]);

  /**
   * 初期化時にカーソル画像を読み込む関数
   * 画像の読み込みが完了したら、isCursorImgLoadedをtrueに設定し、
   * cursorImageRefに画像を保存
   */
  const initializeCursorImage = useCallback(async () => {
    const cursorImage = new Image();
    // 画像サイズを使用サイズに近いものに設定
    cursorImage.width = CURSOR_SIZE * 2; // 実際の使用サイズの2倍程度が推奨
    cursorImage.height = CURSOR_SIZE * 2;
    cursorImage.src = "/cursor-svgrepo-com.png";
    cursorImage.onload = () => {
      cursorImageRef.current = cursorImage;
      console.info("Cursor image loaded successfully");
      setIsCursorImgLoaded(true);
    };
  }, []);

  useEffect(() => {
    void (async () => {
      initializeWasm();
      initializeCursorPositions();
      initializeCanvas();
      await initializeCursorImage();
    })();
  }, [initializeCanvas, initializeCursorImage, initializeCursorPositions, initializeWasm]);

  /**
   * ユーザーのカーソル位置を更新する関数
   */
  const updateCursorPositionWasm = useCallback(
    (user: string, pos: CursorPosition) => {
      if (!cursorImageRef.current || !isCursorImgLoadedWasm) return;
      if (!USERS.includes(user)) {
        console.warn(`User ${user} is not recognized.`);
        return;
      }
      cursorPotisionsWasm.current.set(user, pos);
      draw_all_cursor(cursorPotisionsWasm.current, cursorImageRef.current, CURSOR_SIZE);
    },
    [isCursorImgLoadedWasm]
  );

  return {
    canvasRefWasm,
    cursorPotisionsWasm,
    updateCursorPositionWasm,
    isWasmReady,
    isCursorImgLoadedWasm,
  };
};
