import { Room } from "@colyseus/core";
import { MyRoomState } from "./schema/MyRoomState.js";
import { Player } from "./schema/Player.js";

export class MyRoom extends Room {
  maxClients = 4;
  state = new MyRoomState();

  onCreate(options) {
    console.log("Phòng đã được tạo:", this.roomId);
    
    // Xử lý input từ người chơi
    this.onMessage("move", (client, payload) => {
      // Lấy tham chiếu đến người chơi đã gửi tin nhắn
      const player = this.state.players.get(client.sessionId);
      if (!player) return; // Nếu không tìm thấy người chơi thì bỏ qua
      
      const velocity = 2; // Tốc độ di chuyển

      // Tính toán vector di chuyển
      let moveX = 0;
      let moveY = 0;

      // Xử lý di chuyển theo trục X
      if (payload.left) {
        moveX -= 1;
      } else if (payload.right) {
        moveX += 1;
      }

      // Xử lý di chuyển theo trục Y
      if (payload.up) {
        moveY -= 1;
      } else if (payload.down) {
        moveY += 1;
      }

      // Chuẩn hóa vector di chuyển để tránh di chuyển nhanh hơn khi đi đường chéo
      if (moveX !== 0 || moveY !== 0) {
        // Tính độ dài vector
        const length = Math.sqrt(moveX * moveX + moveY * moveY);
        // Chuẩn hóa và áp dụng velocity
        moveX = (moveX / length) * velocity;
        moveY = (moveY / length) * velocity;
        
        // Cập nhật vị trí
        player.x += moveX;
        player.y += moveY;
      }
    });
  }

  onJoin(client, options) {
    console.log(client.sessionId, "đã tham gia!");

    const mapWidth = 800; // Chiều rộng bản đồ
    const mapHeight = 600; // Chiều cao bản đồ

    // Tạo instance Player mới
    const player = new Player();

    // Đặt người chơi ở vị trí ngẫu nhiên trên bản đồ
    player.x = (Math.random() * mapWidth);
    player.y = (Math.random() * mapHeight);

    // Thêm người chơi vào map players theo sessionId
    // (client.sessionId là duy nhất cho mỗi kết nối!)
    this.state.players.set(client.sessionId, player);
  }

  onLeave(client, consented) {
    console.log(client.sessionId, "đã rời khỏi!");

    this.state.players.delete(client.sessionId);
  }

  onDispose() {
    console.log("phòng", this.roomId, "đang được hủy...");
  }

}
