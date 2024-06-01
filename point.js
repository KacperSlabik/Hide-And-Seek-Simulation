export default class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.radius = 5;
    this.color = "yellow";
    this.width = this.radius * 2;
    this.height = this.radius * 2;
  }

  draw(ctx) {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
    ctx.fill();
    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  collidesWith(other) {
    const margin = 20;
    return !(
      this.x + this.width + margin < other.x ||
      this.x > other.x + other.width + margin ||
      this.y + this.height + margin < other.y ||
      this.y > other.y + other.height + margin
    );
  }
}
