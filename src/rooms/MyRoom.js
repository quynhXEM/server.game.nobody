import { Room } from "@colyseus/core";
import { MyRoomState } from "./schema/MyRoomState.js";
import { Player } from "./schema/Player.js";
import { Bullet } from "./schema/Bullet.js";

export class MyRoom extends Room {
  static CONFIG = {
    MAP_WIDTH: 3600,
    MAP_HEIGHT: 1800,
    PLAYER_RADIUS: 60,
    PLAYER_MOVE_SPEED: 5,
    BULLET_RADIUS: 8,
    OUT_OF_MAP: -9999,
  };
  maxClients = 4;
  state = new MyRoomState();
  bulletId = 0;

  static normalizeAngle(angle) {
    angle = angle % 360;
    if (angle < 0) angle += 360;
    return angle;
  }

  static getNextPosition(player, payload) {
    let angle = player.angle;
    if (payload.left) angle -= 5;
    if (payload.right) angle += 5;
    angle = MyRoom.normalizeAngle(angle);
    const rad = angle * Math.PI / 180;
    let newX = player.x;
    let newY = player.y;
    if (payload.up) {
      newX += Math.cos(rad) * MyRoom.CONFIG.PLAYER_MOVE_SPEED;
      newY += Math.sin(rad) * MyRoom.CONFIG.PLAYER_MOVE_SPEED;
    }
    if (payload.down) {
      newX -= Math.cos(rad) * MyRoom.CONFIG.PLAYER_MOVE_SPEED;
      newY -= Math.sin(rad) * MyRoom.CONFIG.PLAYER_MOVE_SPEED;
    }
    return { newX, newY, angle };
  }

  static isAlivePlayer(player) {
    return player && !player.isDead;
  }

  static isColliding(newX, newY, sessionId, players, radius) {
    for (let [otherId, otherPlayer] of players.entries()) {
      if (otherId === sessionId || otherPlayer.isDead) continue;
      const dx = otherPlayer.x - newX;
      const dy = otherPlayer.y - newY;
      if (Math.sqrt(dx * dx + dy * dy) < radius * 2) return true;
    }
    return false;
  }

  onCreate(options) {
    console.log("Phòng đã được tạo:", this.roomId);

    this.onMessage("shoot", (client) => {
      const player = this.state.players.get(client.sessionId);
      if (!MyRoom.isAlivePlayer(player)) return;
      this.bulletId++;
      const rad = player.angle * Math.PI / 180;
      const { PLAYER_RADIUS, BULLET_RADIUS } = MyRoom.CONFIG;
      const bulletX = player.x + Math.cos(rad) * (PLAYER_RADIUS + BULLET_RADIUS);
      const bulletY = player.y + Math.sin(rad) * (PLAYER_RADIUS + BULLET_RADIUS);
      const bullet = new Bullet(this.bulletId, bulletX, bulletY, player.angle, client.sessionId);
      this.state.bullets.set(bullet.id, bullet);
    });

    this.onMessage("move", (client, payload) => {
      const player = this.state.players.get(client.sessionId);
      if (!MyRoom.isAlivePlayer(player)) return;
      let { newX, newY, angle } = MyRoom.getNextPosition(player, payload);
      const { PLAYER_RADIUS, MAP_WIDTH, MAP_HEIGHT } = MyRoom.CONFIG;
      newX = Math.max(PLAYER_RADIUS, Math.min(MAP_WIDTH - PLAYER_RADIUS, newX));
      newY = Math.max(PLAYER_RADIUS, Math.min(MAP_HEIGHT - PLAYER_RADIUS, newY));
      if (!MyRoom.isColliding(newX, newY, client.sessionId, this.state.players, PLAYER_RADIUS)) {
        player.x = newX;
        player.y = newY;
      }
      player.angle = angle;
    });

    this.onMessage("player_hit", (client, { playerId, bulletId }) => {
      const player = this.state.players.get(playerId);
      if (MyRoom.isAlivePlayer(player)) {
        player.isDead = true;
        player.x = MyRoom.CONFIG.OUT_OF_MAP;
        player.y = MyRoom.CONFIG.OUT_OF_MAP;
        this.state.bullets.delete(bulletId);
      }
    });

    this.setSimulationInterval(() => {
      this.updateBullets();
    }, 1000 / 60);
  }

  updateBullets() {
    if (this.state.bullets.size === 0) return;
    const removeIds = [];
    const { MAP_WIDTH, MAP_HEIGHT } = MyRoom.CONFIG;
    const deltaTime = 1 / 60;
    for (let [id, bullet] of this.state.bullets.entries()) {
      // Cập nhật vị trí
      const rad = bullet.angle * Math.PI / 180;
      bullet.x += Math.cos(rad) * bullet.speed;
      bullet.y += Math.sin(rad) * bullet.speed;
      // Cập nhật thời gian sống
      bullet.lifeTime = (bullet.lifeTime || 0) + deltaTime;
      if (bullet.lifeTime > 2) {
        removeIds.push(id);
        continue;
      }
      // Xử lý va chạm biên và phản xạ
      let bouncedX = false, bouncedY = false;
      if (bullet.x < 0) {
        bullet.x = 0;
        bouncedX = true;
      } else if (bullet.x > MAP_WIDTH) {
        bullet.x = MAP_WIDTH;
        bouncedX = true;
      }
      if (bullet.y < 0) {
        bullet.y = 0;
        bouncedY = true;
      } else if (bullet.y > MAP_HEIGHT) {
        bullet.y = MAP_HEIGHT;
        bouncedY = true;
      }
      if (bouncedX) bullet.angle = 180 - bullet.angle;
      if (bouncedY) bullet.angle = -bullet.angle;
      if (bouncedX || bouncedY) bullet.angle = MyRoom.normalizeAngle(bullet.angle);
    }
    for (let id of removeIds) {
      this.state.bullets.delete(id);
    }
  }

  onJoin(client, options) {
    console.log(client.sessionId, "đã tham gia!");
    const player = new Player();
    player.x = Math.random() * MyRoom.CONFIG.MAP_WIDTH;
    player.y = Math.random() * MyRoom.CONFIG.MAP_HEIGHT;
    this.state.players.set(client.sessionId, player);
  }

  onLeave(client, consented) {
    console.log(client.sessionId, "đã rời khỏi!");
    this.state.players.delete(client.sessionId);
  }

  onDispose() {
    this.bulletId = 0;
    console.log("phòng", this.roomId, "đang được hủy...");
  }
}
