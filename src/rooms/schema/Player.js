// Import các class cần thiết từ Colyseus schema
import { Schema, type, defineTypes } from "@colyseus/schema";

// Schema định nghĩa thông tin người chơi
export class Player extends Schema {
    constructor() {
        super();
        // Khởi tạo vị trí ban đầu của người chơi
        this.name = "Player";
        this.id = "x";
        this.hp = 100;
        this.maxHp = 100;
        this.atk = 10;
        this.x = 0; // Tọa độ X
        this.y = 0; // Tọa độ Y
        this.angle = 0; // Hướng, đơn vị radian
    }
}

// Định nghĩa kiểu dữ liệu cho Player
defineTypes(Player, {
    name: "string",
    id: "string",
    hp: "number",
    atk: "number",
    maxHp: "number",
    x: "number", // Tọa độ X (số)
    y: "number", // Tọa độ Y (số)
    angle: "number", // Hướng, radian
});
