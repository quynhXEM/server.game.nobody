// Import các class cần thiết từ Colyseus schema
import { Schema, MapSchema, defineTypes } from "@colyseus/schema";
// Import schema Player
import { Player } from "./Player.js";

// Schema định nghĩa state của phòng game
export class MyRoomState extends Schema {
    constructor() {
        super();
        // Khởi tạo map để lưu trữ tất cả người chơi trong phòng
        this.players = new MapSchema();
    }
}

// Định nghĩa kiểu dữ liệu cho MyRoomState
defineTypes(MyRoomState, {
    players: { map: Player }, // Map chứa các Player object
});

