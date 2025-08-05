// Import các class cần thiết từ Colyseus schema
import { Schema, MapSchema, defineTypes, ArraySchema } from "@colyseus/schema";
// Import schema Player
import { Player } from "./Player.js";
import { Bullet } from "./Bullet.js";

// Schema định nghĩa state của phòng game
export class MyRoomState extends Schema {
    constructor() {
        super();
        // Khởi tạo map để lưu trữ tất cả người chơi trong phòng
        this.players = new MapSchema();
        // Khởi tạo mảng bullets
        this.bullets = new ArraySchema();
    }
}

// Định nghĩa kiểu dữ liệu cho MyRoomState
defineTypes(MyRoomState, {
    players: { map: Player }, // Map chứa các Player object
    bullets: [Bullet],        // Mảng bullets
});

