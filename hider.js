class Hider {
  constructor(x, y, radius, speed) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = "blue";
    this.speed = speed;
    this.changeDirection();
  }

  changeDirection() {
    this.direction = Math.floor(Math.random() * 4);
    this.moveTime = ((Math.floor(Math.random() * 3) + 1) * 60) / this.speed; // time to move in one direction (1 to 3 seconds)
    console.log(`Hider changed direction to: ${this.getDirectionString()}`);
  }

  getDirectionString() {
    switch (this.direction) {
      case 0:
        return "up";
      case 1:
        return "down";
      case 2:
        return "left";
      case 3:
        return "right";
      default:
        return "unknown";
    }
  }

  escapeFrom(seeker) {
    const dx = this.x - seeker.x;
    const dy = this.y - seeker.y;

    if (Math.abs(dx) > Math.abs(dy)) {
      this.direction = dx > 0 ? 3 : 2; // move right if dx > 0, left if dx < 0
    } else {
      this.direction = dy > 0 ? 1 : 0; // move down if dy > 0, up if dy < 0
    }
    this.moveTime = ((Math.floor(Math.random() * 5) + 1) * 60) / this.speed; // time to move in one direction (1 to 5 seconds)

    console.log(
      `Hider escaping from seeker facing ${this.getDirectionString()}`
    );
  }

  move(WIDTH, HEIGHT, obstacles) {
    if (this.speed === 0) return; // Stop moving if speed is zero

    if (this.moveTime <= 0) {
      this.changeDirection();
    }

    let newX = this.x;
    let newY = this.y;

    switch (this.direction) {
      case 0: // up
        newY -= this.speed;
        break;
      case 1: // down
        newY += this.speed;
        break;
      case 2: // left
        newX -= this.speed;
        break;
      case 3: // right
        newX += this.speed;
        break;
    }

    if (this.canMoveTo(newX, newY, WIDTH, HEIGHT, obstacles)) {
      this.x = newX;
      this.y = newY;
    } else {
      this.changeDirection();
    }

    this.moveTime--;

    console.log(
      `Hider moved to (${this.x}, ${
        this.y
      }) facing ${this.getDirectionString()}`
    );
  }

  canMoveTo(x, y, WIDTH, HEIGHT, obstacles) {
    if (
      x - this.radius < 0 ||
      x + this.radius > WIDTH ||
      y - this.radius < 0 ||
      y + this.radius > HEIGHT
    ) {
      return false;
    }

    for (let obstacle of obstacles) {
      if (
        !obstacle.permeable &&
        !(
          x + this.radius < obstacle.x ||
          x - this.radius > obstacle.x + obstacle.width ||
          y + this.radius < obstacle.y ||
          y - this.radius > obstacle.y + obstacle.height
        )
      ) {
        return false;
      }
    }

    return true;
  }

  collidesWith(other) {
    const dx = this.x - other.x;
    const dy = this.y - other.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < this.radius + other.radius;
  }

  draw(ctx) {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}

export default Hider;