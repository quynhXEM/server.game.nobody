import { Room } from "@colyseus/core";
import { MyRoomState } from "./schema/MyRoomState.js";
import { Player } from "./schema/Player.js";
import { Bullet } from "./schema/Bullet.js";

// Hàm chuẩn hóa góc về [0, 360)
function normalizeAngle(angle) {
  angle = angle % 360;
  if (angle < 0) angle += 360;
  return angle;
}

// Hàm tính vị trí mới dựa vào input
function getNextPosition(player, payload, moveSpeed) {
  let angle = player.angle;
  if (payload.left) angle -= 5;
  if (payload.right) angle += 5;
  angle = normalizeAngle(angle);

  const rad = angle * Math.PI / 180;
  let newX = player.x;
  let newY = player.y;
  if (payload.up) {
    newX += Math.cos(rad) * moveSpeed;
    newY += Math.sin(rad) * moveSpeed;
  }
  if (payload.down) {
    newX -= Math.cos(rad) * moveSpeed;
    newY -= Math.sin(rad) * moveSpeed;
  }
  return { newX, newY, angle };
}

// Hàm kiểm tra va chạm với các player khác
function isColliding(newX, newY, sessionId, players, radius) {
  for (let [otherId, otherPlayer] of players.entries()) {
    if (otherId === sessionId) continue;
    const dx = otherPlayer.x - newX;
    const dy = otherPlayer.y - newY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < radius * 2) return true;
  }
  return false;
}

export class MyRoom extends Room {
  maxClients = 4;
  state = new MyRoomState();

  onCreate(options) {
    console.log("Phòng đã được tạo:", this.roomId);

    // Lắng nghe sự kiện bắn đạn
    this.onMessage("shoot", (client) => {
      const player = this.state.players.get(client.sessionId);
      if (!player) return;
      // Tạo viên đạn mới tại vị trí và hướng của player
      const bullet = new Bullet(player.x, player.y, player.angle, client.sessionId);
      this.state.bullets.push(bullet);
    });

    // Xử lý di chuyển
    this.onMessage("move", (client, payload) => {
      const player = this.state.players.get(client.sessionId);
      if (!player) return;

      const moveSpeed = 5;
      const radius = 50;
      const mapWidth = 3600;
      const mapHeight = 1800;

      // Tính toán vị trí và góc mới
      let { newX, newY, angle } = getNextPosition(player, payload, moveSpeed);

      // Giới hạn player trong map
      newX = Math.max(radius, Math.min(mapWidth - radius, newX));
      newY = Math.max(radius, Math.min(mapHeight - radius, newY));

      // Kiểm tra va chạm
      if (!isColliding(newX, newY, client.sessionId, this.state.players, radius)) {
        player.x = newX;
        player.y = newY;
      }
      player.angle = angle;
    });

    // Tick cập nhật đạn
    this.setSimulationInterval((dt) => {
      this.updateBullets();
    }, 1000 / 60); // 60 lần/giây
  }

  updateBullets() {
    const mapWidth = 3600;
    const mapHeight = 1800;
    const removeIndexes = [];
    for (let i = 0; i < this.state.bullets.length; i++) {
      const bullet = this.state.bullets[i];
      const rad = bullet.angle * Math.PI / 180;
      bullet.x += Math.cos(rad) * bullet.speed;
      bullet.y += Math.sin(rad) * bullet.speed;
      // Xóa đạn nếu ra khỏi map
      if (
        bullet.x < 0 || bullet.x > mapWidth ||
        bullet.y < 0 || bullet.y > mapHeight
      ) {
        removeIndexes.push(i);
      }
    }
    // Xóa đạn khỏi state (từ cuối về đầu để không lệch index)
    for (let i = removeIndexes.length - 1; i >= 0; i--) {
      this.state.bullets.splice(removeIndexes[i], 1);
    }
  }

  onJoin(client, options) {
    console.log(client.sessionId, "đã tham gia!");

    const mapWidth = 3600;
    const mapHeight = 1800;

    const player = new Player();
    player.x = Math.random() * mapWidth;
    player.y = Math.random() * mapHeight;

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
