export default class Player {
  constructor(x, y, radius, speed, color) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.speed = speed;
    this.color = color;
    this.changeDirection();
  }

  changeDirection() {
    this.direction = Math.floor(Math.random() * 4);
    this.moveTime = ((Math.floor(Math.random() * 3) + 1) * 60) / this.speed; 
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

  move(WIDTH, HEIGHT, obstacles) {
    if (this.speed === 0) return; 

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

  getDistanceTo(obstacle) {
    const obstacleCenterX = obstacle.x + obstacle.width / 2;
    const obstacleCenterY = obstacle.y + obstacle.height / 2;
    return Math.sqrt(
      Math.pow(obstacleCenterX - this.x, 2) +
        Math.pow(obstacleCenterY - this.y, 2)
    );
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
