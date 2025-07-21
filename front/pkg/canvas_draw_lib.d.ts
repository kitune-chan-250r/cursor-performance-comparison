/* tslint:disable */
/* eslint-disable */
/**
 *
 * * wasmモジュールが初期化された際に、ユーザーのカーソル位置を初期化する
 * 
 */
export function init(): void;
/**
 *
 * * ユーザーのカーソル位置を更新し、全てのユーザーのカーソルを描画する
 * 
 */
export function update_cursor_position(user_id: string, pos: CursorPosition, image: HTMLImageElement, cursor_size: number): void;
export function get_user_cursor_positions(): UserCursorPositionMap;
export interface CursorPosition {
    x: number;
    y: number;
}

export type UserCursorPositionMap = Map<string, CursorPosition>;


export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly init: () => void;
  readonly update_cursor_position: (a: number, b: number, c: any, d: any, e: number) => void;
  readonly get_user_cursor_positions: () => any;
  readonly __wbindgen_malloc: (a: number, b: number) => number;
  readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
  readonly __wbindgen_exn_store: (a: number) => void;
  readonly __externref_table_alloc: () => number;
  readonly __wbindgen_export_4: WebAssembly.Table;
  readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;
/**
* Instantiates the given `module`, which can either be bytes or
* a precompiled `WebAssembly.Module`.
*
* @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
*
* @returns {InitOutput}
*/
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
* If `module_or_path` is {RequestInfo} or {URL}, makes a request and
* for everything else, calls `WebAssembly.instantiate` directly.
*
* @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
*
* @returns {Promise<InitOutput>}
*/
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
