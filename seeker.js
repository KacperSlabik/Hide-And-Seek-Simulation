import Player from "./player.js";

export default class Seeker extends Player {
  constructor(x, y, radius, viewRadius, speed) {
    super(x, y, radius, speed, "red");
    this.viewRadius = viewRadius;
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

  chase(target, WIDTH, HEIGHT, obstacles) {
    if (!this.canSee(target, obstacles)) {
      return;
    }

    let newX = this.x;
    let newY = this.y;

    const dx = target.x - this.x;
    const dy = target.y - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < this.speed) {
      newX = target.x;
      newY = target.y;
    } else {
      if (Math.abs(dx) > Math.abs(dy)) {
        newX += dx > 0 ? this.speed : -this.speed;
        this.direction = dx > 0 ? 3 : 2; // Right or left
      } else {
        newY += dy > 0 ? this.speed : -this.speed;
        this.direction = dy > 0 ? 1 : 0; // Down or up
      }
    }

    if (!this.canMoveTo(newX, newY, WIDTH, HEIGHT, obstacles)) {
      this.avoidObstacle(dx, dy, WIDTH, HEIGHT, obstacles);
    } else {
      this.x = newX;
      this.y = newY;
    }
  }

  avoidObstacle(dx, dy, WIDTH, HEIGHT, obstacles) {
    let directions = [];

    if (Math.abs(dx) > Math.abs(dy)) {
      directions = dx > 0 ? [3, 0, 1] : [2, 0, 1]; // right or left
    } else {
      directions = dy > 0 ? [1, 2, 3] : [0, 2, 3]; // down or up
    }

    for (let direction of directions) {
      let newX = this.x;
      let newY = this.y;

      switch (direction) {
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
        this.direction = direction;
        break;
      }
    }
  }

  canSee(hider, obstacles) {
    const dx = hider.x - this.x;
    const dy = hider.y - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > this.viewRadius) {
      return false;
    }

    if (hider.isInsidePermeableObstacle(obstacles)) {
      return false;
    }

    for (let obstacle of obstacles) {
      if (
        !obstacle.permeable &&
        this.lineIntersectsRectangle(this.x, this.y, hider.x, hider.y, obstacle)
      ) {
        return false;
      }
    }

    return true;
  }

  isPointInsideRectangle(px, py, rect) {
    return (
      px > rect.x &&
      px < rect.x + rect.width &&
      py > rect.y &&
      py < rect.y + rect.height
    );
  }

  lineIntersectsRectangle(x1, y1, x2, y2, rect) {
    const { x, y, width, height } = rect;
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
    super.draw(ctx);
    this.drawViewRadius(ctx, obstacles); 
  }
}
