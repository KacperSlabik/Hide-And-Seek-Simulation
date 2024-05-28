class Seeker {
  constructor(x, y, radius) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = "red";
    this.speed = 1;
    this.viewRadius = 50;
    this.direction = Math.floor(Math.random() * 4);
    this.moveTime = (Math.floor(Math.random() * 3) + 1) * 60;
  }

  changeDirection() {
    this.direction = Math.floor(Math.random() * 4);
    this.moveTime = (Math.floor(Math.random() * 5) + 1) * 60; // time to move in one direction (1 to 3 seconds)
  }

  move(WIDTH, HEIGHT, obstacles) {
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
      this.moveTime = (Math.floor(Math.random() * 5) + 1) * 60; // time to move in one direction (1 to 3 seconds)
    }

    this.moveTime--;
  }

  chase(target, WIDTH, HEIGHT, obstacles) {
    if (!this.canSee(target, obstacles)) {
      return;
    }

    let newX = this.x;
    let newY = this.y;

    if (target.x > this.x && this.x + this.radius + this.speed < WIDTH) {
      newX += this.speed;
    } else if (target.x < this.x && this.x - this.radius - this.speed > 0) {
      newX -= this.speed;
    }

    if (target.y > this.y && this.y + this.radius + this.speed < HEIGHT) {
      newY += this.speed;
    } else if (target.y < this.y && this.y - this.radius - this.speed > 0) {
      newY -= this.speed;
    }

    if (this.canMoveTo(newX, newY, WIDTH, HEIGHT, obstacles)) {
      this.x = newX;
      this.y = newY;
    }
  }

  canSee(target, obstacles) {
    const dx = target.x - this.x;
    const dy = target.y - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > this.viewRadius) {
      return false;
    }

    for (let obstacle of obstacles) {
      if (
        this.lineIntersectsRectangle(
          this.x,
          this.y,
          target.x,
          target.y,
          obstacle
        )
      ) {
        return false;
      }
    }

    return true;
  }

  lineIntersectsRectangle(x1, y1, x2, y2, rect) {
    const { x, y, width, height } = rect;

    // Check if the line intersects any of the rectangle's sides
    return (
      this.lineIntersectsLine(x1, y1, x2, y2, x, y, x + width, y) ||
      this.lineIntersectsLine(x1, y1, x2, y2, x, y, x, y + height) ||
      this.lineIntersectsLine(
        x1,
        y1,
        x2,
        y2,
        x + width,
        y,
        x + width,
        y + height
      ) ||
      this.lineIntersectsLine(
        x1,
        y1,
        x2,
        y2,
        x,
        y + height,
        x + width,
        y + height
      )
    );
  }

  lineIntersectsLine(x1, y1, x2, y2, x3, y3, x4, y4) {
    const denominator = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
    if (denominator === 0) return false;

    const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denominator;
    const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denominator;

    return t >= 0 && t <= 1 && u >= 0 && u <= 1;
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

  isObstacleBlocking(x, y, obstacles) {
    for (let obstacle of obstacles) {
      if (this.lineIntersectsRectangle(this.x, this.y, x, y, obstacle)) {
        return true;
      }
    }
    return false;
  }

  drawViewRadius(ctx, obstacles) {
    ctx.fillStyle = "rgba(255, 0, 0, 0.3)";
    ctx.beginPath();

    let startAngle, endAngle;
    switch (this.direction) {
      case 0: // up
        startAngle = Math.PI;
        endAngle = 2 * Math.PI;
        break;
      case 1: // down
        startAngle = 0;
        endAngle = Math.PI;
        break;
      case 2: // left
        startAngle = 0.5 * Math.PI;
        endAngle = 1.5 * Math.PI;
        break;
      case 3: // right
        startAngle = -0.5 * Math.PI;
        endAngle = 0.5 * Math.PI;
        break;
    }

    const step = Math.PI / 180;
    ctx.moveTo(this.x, this.y);
    for (let angle = startAngle; angle < endAngle; angle += step) {
      const x = this.x + this.viewRadius * Math.cos(angle);
      const y = this.y + this.viewRadius * Math.sin(angle);
      if (!this.isObstacleBlocking(x, y, obstacles)) {
        ctx.lineTo(x, y);
      } else {
        ctx.moveTo(this.x, this.y);
      }
    }
    ctx.closePath();
    ctx.fill();
  }

  draw(ctx, obstacles) {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();

    this.drawViewRadius(ctx, obstacles);
  }
}

export default Seeker;
