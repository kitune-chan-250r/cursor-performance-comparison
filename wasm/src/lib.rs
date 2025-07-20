use std::collections::HashMap;

use serde::{Deserialize, Serialize};
use wasm_bindgen::prelude::*;
use tsify_next::Tsify;
use web_sys::CanvasRenderingContext2d;

pub fn add(left: u64, right: u64) -> u64 {
    left + right
}

#[derive(Tsify, Serialize, Deserialize, Clone)]
#[tsify(into_wasm_abi, from_wasm_abi)]
pub struct CursorPosition {
    x: f64,
    y: f64,
}

#[derive(Tsify, Serialize, Deserialize, Clone)]
#[tsify(into_wasm_abi, from_wasm_abi)]
pub struct UserCursorPositionMap(HashMap<String, CursorPosition>);


// #[wasm_bindgen]
pub fn draw_cursor(image: web_sys::HtmlImageElement, context: CanvasRenderingContext2d, pos: CursorPosition, cursor_size: f64) {
    context.draw_image_with_html_image_element_and_dw_and_dh(&image, pos.x, pos.y, cursor_size, cursor_size).unwrap();
}

#[wasm_bindgen]
pub fn draw_all_cursor(positions: UserCursorPositionMap, image: web_sys::HtmlImageElement, cursor_size: f64) {
    let document = web_sys::window().unwrap().document().unwrap();
    let canvas_element = document.get_element_by_id("cursorCanvas").unwrap();
    let canvas = canvas_element
        .dyn_into::<web_sys::HtmlCanvasElement>()
        .unwrap();

    let context = canvas.get_context("2d")
        .unwrap()
        .unwrap()
        .dyn_into::<web_sys::CanvasRenderingContext2d>()
        .unwrap();

    context.clear_rect(0.0, 0.0, canvas.width() as f64, canvas.height() as f64);

    positions.0.values()
        .for_each(|pos| {
            draw_cursor(image.clone(), context.clone(), pos.clone(), cursor_size);
        });
}
