class Obstacle {
  constructor(x, y, width, height, permeable = false) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.permeable = permeable;
  }

  draw(ctx) {
    ctx.fillStyle = this.permeable ? "gray" : "black";
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

export default Obstacle;
