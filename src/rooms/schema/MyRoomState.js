// Import các class cần thiết từ Colyseus schema
import { Schema, MapSchema, defineTypes } from "@colyseus/schema";
// Import schema Player
import { Player } from "./Player.js";
import { Bullet } from "./Bullet.js";

// Schema định nghĩa state của phòng game
export class MyRoomState extends Schema {
    constructor() {
        super();
        // Khởi tạo map để lưu trữ tất cả người chơi trong phòng
        this.players = new MapSchema();
        // Khởi tạo mảng bullets lưu trữ tất cả đạn trong phòng
        this.bullets = new MapSchema();
    }
}

// Định nghĩa kiểu dữ liệu cho MyRoomState
defineTypes(MyRoomState, {
    players: { map: Player }, // Map chứa các Player object
    bullets: { map: Bullet }, // Map chứa các Bullet object
});

