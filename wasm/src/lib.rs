use std::{cell::RefCell, collections::HashMap};

use serde::{Deserialize, Serialize};
use tsify_next::Tsify;
use wasm_bindgen::prelude::*;
use web_sys::CanvasRenderingContext2d;

#[derive(Tsify, Serialize, Deserialize, Clone)]
#[tsify(into_wasm_abi, from_wasm_abi)]
pub struct CursorPosition {
    x: f64,
    y: f64,
}

#[derive(Tsify, Serialize, Deserialize, Clone)]
#[tsify(into_wasm_abi, from_wasm_abi)]
pub struct UserCursorPositionMap(HashMap<String, CursorPosition>);

thread_local! {
    static USER_CURSOR_POSITIONS: RefCell<UserCursorPositionMap> = RefCell::new(UserCursorPositionMap(HashMap::new()));
    static CANVAS_CONTEXT: RefCell<Option<CanvasRenderingContext2d>> = RefCell::new(None);
}

/**
 * canvas_contextをキャッシュする
 */
pub fn cache_canvas_context() {
    let document = web_sys::window().unwrap().document().unwrap();
    let canvas_element = document.get_element_by_id("cursorCanvas").unwrap();
    let canvas = canvas_element
        .dyn_into::<web_sys::HtmlCanvasElement>()
        .unwrap();

    let context = canvas
        .get_context("2d")
        .unwrap()
        .unwrap()
        .dyn_into::<web_sys::CanvasRenderingContext2d>()
        .unwrap();

    CANVAS_CONTEXT.replace(Some(context));
}

/**
 * ユーザーのカーソル位置を初期化する
 * この関数は、WASMモジュールが初期化された際に呼び出される
 */
pub fn initialize_user_cursor_positions() {
    let users = [
        "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R",
        "S", "T",
    ];
    let mut initial_position = CursorPosition { x: 0.0, y: 0.0 };
    users.iter().for_each(|user| {
        USER_CURSOR_POSITIONS.with(|positions_cell| {
            let mut cursor_positions = positions_cell.borrow_mut();
            cursor_positions
                .0
                .insert(user.to_string(), initial_position.clone());
        });
        initial_position.y += 50.0;
    });
}

/**
 * wasmモジュールが初期化された際に、ユーザーのカーソル位置を初期化する
 */
#[wasm_bindgen(start)]
pub fn init() {
    #[wasm_bindgen]
    extern "C" {
        #[wasm_bindgen(js_namespace = console)]
        fn log(s: &str);
    }

    // canvas要素をキャッシュ
    cache_canvas_context();
    // ユーザーのカーソル位置を初期化
    initialize_user_cursor_positions();

    log("WASM module initialized. User cursor positions map is ready.");
    USER_CURSOR_POSITIONS.with(|cell| {
        cell.borrow().0.iter().for_each(|(user, pos)| {
            log(&format!("User: {}, Position: ({}, {})", user, pos.x, pos.y));
        });
    })
}

/**
 * canvasの指定されたポジションにカーソルを描画する
 */
pub fn draw_cursor(
    image: web_sys::HtmlImageElement,
    context: &CanvasRenderingContext2d,
    pos: CursorPosition,
    cursor_size: f64,
) {
    context
        .draw_image_with_html_image_element_and_dw_and_dh(
            &image,
            pos.x,
            pos.y,
            cursor_size,
            cursor_size,
        )
        .unwrap();
}

/**
 * 全てのユーザのカーソルを描画する
 */
pub fn draw_all_cursor(
    positions: UserCursorPositionMap,
    image: web_sys::HtmlImageElement,
    cursor_size: f64,
) {
    // キャッシュされたコンテキストを取得
    // let context_guard = CANVAS_CONTEXT.lock().unwrap();
    // if let Some(context) = &*context_guard {
    //     let canvas = context.canvas().unwrap();
    //     context.clear_rect(0.0, 0.0, canvas.width() as f64, canvas.height() as f64);

    //     positions.0.values().for_each(|pos| {
    //         draw_cursor(image.clone(), context.clone(), pos.clone(), cursor_size);
    //     });
    // }
    CANVAS_CONTEXT.with(|context_cell| {
        if let Some(context) = &*context_cell.borrow() {
            let canvas = context.canvas().unwrap();
            context.clear_rect(0.0, 0.0, canvas.width() as f64, canvas.height() as f64);

            positions.0.values().for_each(|pos| {
                draw_cursor(image.clone(), context, pos.clone(), cursor_size);
            });
        }
    });
}

/**
 * ユーザーのカーソル位置を更新し、全てのユーザーのカーソルを描画する
 */
#[wasm_bindgen]
pub fn update_cursor_position(
    user_id: String,
    pos: CursorPosition,
    image: web_sys::HtmlImageElement,
    cursor_size: f64,
) {
    // カーソル位置を更新
    USER_CURSOR_POSITIONS.with(|cell| {
        cell.borrow_mut().0.insert(user_id, pos);
    });

    // そのうえで全ユーザーのカーソルを描画
    draw_all_cursor(get_user_cursor_positions(), image, cursor_size);
}

#[wasm_bindgen]
pub fn get_user_cursor_positions() -> UserCursorPositionMap {
    USER_CURSOR_POSITIONS.with(|position_cell| position_cell.borrow().clone())
}
