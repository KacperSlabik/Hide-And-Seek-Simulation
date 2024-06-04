import Player from "./player.js";

export default class Hider extends Player {
  constructor(x, y, radius, speed, viewRadius) {
    super(x, y, radius, speed, "blue");
    this.found = false; // Mark as not found initially
    this.viewRadius = viewRadius; // Add viewRadius to Hider
  }

  escapeFrom(seeker, obstacles) {
    const nearestObstacle = this.findNearestPermeableObstacle(
      obstacles,
      seeker
    );
    if (nearestObstacle) {
      const dx = nearestObstacle.x + nearestObstacle.width / 2 - this.x;
      const dy = nearestObstacle.y + nearestObstacle.height / 2 - this.y;

      if (Math.abs(dx) > Math.abs(dy)) {
        this.direction = dx > 0 ? 3 : 2; // move right if dx > 0, left if dx < 0
      } else {
        this.direction = dy > 0 ? 1 : 0; // move down if dy > 0, up if dy < 0
      }
      this.moveTime = ((Math.floor(Math.random() * 5) + 1) * 60) / this.speed; // time to move in one direction (1 to 5 seconds)

      // console.log(
      //   `Hider escaping from seeker towards nearest permeable obstacle facing ${this.getDirectionString()}`
      // );
    } else {
      // Move directly away from seeker if no suitable permeable obstacle is found
      const dx = this.x - seeker.x;
      const dy = this.y - seeker.y;

      if (Math.abs(dx) > Math.abs(dy)) {
        this.direction = dx > 0 ? 3 : 2; // move right if dx > 0, left if dx < 0
      } else {
        this.direction = dy > 0 ? 1 : 0; // move down if dy > 0, up if dy < 0
      }
      this.moveTime = ((Math.floor(Math.random() * 3) + 1) * 60) / this.speed; // time to move in one direction (1 to 3 seconds)

      // console.log(
      //   `Hider escaping from seeker facing ${this.getDirectionString()}`
      // );
    }
  }

  findNearestPermeableObstacle(obstacles, seeker) {
    let nearestObstacle = null;
    let minDistance = Infinity;

    for (let obstacle of obstacles) {
      if (obstacle.permeable) {
        const hiderDistance = this.getDistanceTo(obstacle);
        const seekerDistance = seeker.getDistanceTo(obstacle);

        if (hiderDistance < seekerDistance && hiderDistance < minDistance) {
          minDistance = hiderDistance;
          nearestObstacle = obstacle;
        }
      }
    }

    return nearestObstacle;
  }

  isInsidePermeableObstacle(obstacles) {
    for (let obstacle of obstacles) {
      if (obstacle.permeable && this.isInsideObstacle(obstacle)) {
        return true;
      }
    }
    return false;
  }

  isInsideObstacle(obstacle) {
    return (
      this.x + this.radius > obstacle.x &&
      this.x - this.radius < obstacle.x + obstacle.width &&
      this.y + this.radius > obstacle.y &&
      this.y - this.radius < obstacle.y + obstacle.height
    );
  }

  canSee(point, obstacles) {
    const dx = point.x - this.x;
    const dy = point.y - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > this.viewRadius) {
      return false;
    }

    for (let obstacle of obstacles) {
      if (
        !obstacle.permeable &&
        this.lineIntersectsRectangle(this.x, this.y, point.x, point.y, obstacle)
      ) {
        return false;
      }
    }

    return true;
  }

  moveTowardsPoint(point, WIDTH, HEIGHT, obstacles) {
    let newX = this.x;
    let newY = this.y;

    const dx = point.x - this.x;
    const dy = point.y - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < this.speed) {
      // Jeśli jesteśmy bardzo blisko punktu, przejdź bezpośrednio do niego
      newX = point.x;
      newY = point.y;
    } else {
      // Normalny ruch w kierunku punktu
      if (Math.abs(dx) > Math.abs(dy)) {
        newX += dx > 0 ? this.speed : -this.speed;
        this.direction = dx > 0 ? 3 : 2; // Right or left
      } else {
        newY += dy > 0 ? this.speed : -this.speed;
        this.direction = dy > 0 ? 1 : 0; // Down or up
      }
    }

    // Sprawdź, czy możemy się przemieścić na nową pozycję
    if (!this.canMoveTo(newX, newY, WIDTH, HEIGHT, obstacles)) {
      // Jeśli nie, znajdź alternatywną trasę
      this.avoidObstacle(dx, dy, WIDTH, HEIGHT, obstacles);
    } else {
      this.x = newX;
      this.y = newY;
    }
  }

  avoidObstacle(dx, dy, WIDTH, HEIGHT, obstacles) {
    let directions = [];

    if (Math.abs(dx) > Math.abs(dy)) {
      directions = dx > 0 ? [3, 0, 1, 2] : [2, 0, 1, 3]; // right or left
    } else {
      directions = dy > 0 ? [1, 2, 3, 0] : [0, 2, 3, 1]; // down or up
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

  canMoveTo(newX, newY, WIDTH, HEIGHT, obstacles) {
    if (
      newX - this.radius < 0 ||
      newX + this.radius > WIDTH ||
      newY - this.radius < 0 ||
      newY + this.radius > HEIGHT
    ) {
      return false;
    }

    for (let obstacle of obstacles) {
      if (
        newX + this.radius > obstacle.x &&
        newX - this.radius < obstacle.x + obstacle.width &&
        newY + this.radius > obstacle.y &&
        newY - this.radius < obstacle.y + obstacle.height
      ) {
        return false;
      }
    }

    return true;
  }

  hasCollectedPoint(point) {
    const dx = point.x - this.x;
    const dy = point.y - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    return distance < this.radius + point.radius;
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
    if (this.found) return; // Don't draw view radius if the hider is found

    ctx.fillStyle = "rgba(0, 0, 255, 0.3)";
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
    super.draw(ctx); // Draw the hider
    this.drawViewRadius(ctx, obstacles); // Draw the view radius
  }
}
