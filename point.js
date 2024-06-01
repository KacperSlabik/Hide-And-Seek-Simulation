export default class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.radius = 5;
    this.color = "yellow";
  }

  draw(ctx) {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);
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
