import { useCallback, useEffect, useRef, useState } from "react";

export interface CursorPosition {
  x: number;
  y: number;
}

const USERS = [
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L",
  "M",
  "N",
  "O",
  "P",
  "Q",
  "R",
  "S",
  "T",
];

/**
 * 1から始まる数値をExcelのカラム名のような文字列に変換します。
 * (例: 1 -> A, 26 -> Z, 27 -> AA)
 * @param num 変換する数値 (1以上の整数)
 * @returns 変換後の文字列
 */
const numberToColumnString = (num: number): string => {
  let result = "";
  while (num > 0) {
    const remainder = (num - 1) % 26;
    result = String.fromCharCode(65 + remainder) + result; // 65は'A'のASCIIコード
    num = Math.floor((num - 1) / 26);
  }
  return result;
};

/**
 * 指定された要素の数だけ文字列型の要素を含む配列を初期化します。
 * 要素は 'A', 'B', 'C', ..., 'Z', 'AA', 'AB', ... のように設定されます。
 * @param count 配列の要素数
 * @returns 初期化された文字列配列
 */
const initializeStringArray = (count: number): string[] => {
  if (count < 0) {
    return [];
  }

  const result: string[] = [];
  for (let i = 1; i <= count; i++) {
    result.push(numberToColumnString(i));
  }
  return result;
};

const users = [...initializeStringArray(200)];

const CURSOR_SIZE = 50; // Size of the cursor in pixels

export const useCursor = () => {
  // canvas要素への参照
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // カーソル画像への参照
  const cursorImageRef = useRef<HTMLImageElement>(null);
  // カーソルのロードが完了したかどうかの状態
  const [isCursorImgLoaded, setIsCursorImgLoaded] = useState(false);
  // ユーザーごとのカーソル位置を管理するMap
  const cursorPotisions = useRef(new Map<string, CursorPosition>());

  /**
   * canvas要素とそのコンテキストを取得する関数
   * canvasが存在しない場合はエラーを投げる
   */
  const getCanvasAndCtx = useCallback(() => {
    const canvas = canvasRef.current;
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
    users.forEach((user, index) => {
      cursorPotisions.current.set(user, { x: 0, y: cursorY });
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

  /**
   * カーソルを指定された位置に描画する関数
   * isCursorImgLoadedがtrueでない場合は何もしない
   */
  const drawCursor = useCallback(
    (pos: CursorPosition) => {
      const { ctx } = getCanvasAndCtx();
      if (!isCursorImgLoaded || !cursorImageRef.current) return;

      // Clear the canvas before drawing
      // ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.imageSmoothingEnabled = true;

      // Draw the cursor image at the specified position
      ctx.drawImage(cursorImageRef.current, pos.x, pos.y, CURSOR_SIZE, CURSOR_SIZE);
    },
    [getCanvasAndCtx, isCursorImgLoaded]
  );

  /**
   * 全てのカーソルを描画する関数
   */
  const drawAllCursors = useCallback(() => {
    if (!isCursorImgLoaded || !cursorImageRef.current) return;

    const { canvas, ctx } = getCanvasAndCtx();
    // Clear the canvas before drawing
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    cursorPotisions.current.forEach((pos) => {
      // console.info(`Drawing cursor at position: ${JSON.stringify(pos)}`);
      drawCursor(pos);
    });
  }, [drawCursor, getCanvasAndCtx, isCursorImgLoaded]);

  /**
   * ユーザーのカーソル位置を更新する関数
   */
  const updateCursorPosition = useCallback(
    (user: string, pos: CursorPosition) => {
      if (!USERS.includes(user)) {
        console.warn(`User ${user} is not recognized.`);
        return;
      }
      cursorPotisions.current.set(user, pos);
      // console.info(`Updated cursor position for user ${user}: ${JSON.stringify(pos)}`);
      drawAllCursors();
    },
    [drawAllCursors]
  );

  /**
   * カーソル描画前の初期化処理
   */
  useEffect(() => {
    const { canvas, ctx } = getCanvasAndCtx();

    // Initialize cursor positions and image
    void (async () => {
      initializeCanvas();
      initializeCursorPositions();
      initializeCursorImage();

      console.info(`initialize compleated. ${JSON.stringify(cursorPotisions.current, null, 2)}`);
    })();

    // Clean up on unmount
    return () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    };
  }, [getCanvasAndCtx, initializeCanvas, initializeCursorImage, initializeCursorPositions]);

  useEffect(() => {
    if (isCursorImgLoaded) {
      console.info(`Cursor image loaded, drawing cursors...`);
      drawAllCursors();
    }
  }, [drawAllCursors, isCursorImgLoaded]);

  return { canvasRef, cursorPotisions, updateCursorPosition };
};
