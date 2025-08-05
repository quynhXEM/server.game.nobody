import { Schema, type, defineTypes } from "@colyseus/schema";

export class Bullet extends Schema {
  constructor(x = 0, y = 0, angle = 0, ownerId = "") {
    super();
    this.x = x;
    this.y = y;
    this.angle = angle;
    this.ownerId = ownerId;
    this.speed = 20;
    this.lifeTime = 0; // Thời gian sống của đạn (giây)
  }
}
defineTypes(Bullet, {
  x: "number",
  y: "number",
  angle: "number",
  ownerId: "string",
  speed: "number",
});