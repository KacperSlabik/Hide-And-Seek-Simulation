import Player from "./player.js";

export default class Hider extends Player {
  constructor(x, y, radius, speed, viewRadius) {
    super(x, y, radius, speed, "blue");
    this.found = false; 
    this.viewRadius = viewRadius; 
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
        this.direction = dx > 0 ? 3 : 2; 
      } else {
        this.direction = dy > 0 ? 1 : 0;
      }
      this.moveTime = ((Math.floor(Math.random() * 5) + 1) * 60) / this.speed; 


    } else {
 
      const dx = this.x - seeker.x;
      const dy = this.y - seeker.y;

      if (Math.abs(dx) > Math.abs(dy)) {
        this.direction = dx > 0 ? 3 : 2;
      } else {
        this.direction = dy > 0 ? 1 : 0; 
      }
      this.moveTime = ((Math.floor(Math.random() * 3) + 1) * 60) / this.speed; 
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
      newX = point.x;
      newY = point.y;
    } else {
      if (Math.abs(dx) > Math.abs(dy)) {
        newX += dx > 0 ? this.speed : -this.speed;
        this.direction = dx > 0 ? 3 : 2; 
      } else {
        newY += dy > 0 ? this.speed : -this.speed;
        this.direction = dy > 0 ? 1 : 0; 
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
      directions = dx > 0 ? [3, 0, 1, 2] : [2, 0, 1, 3]; 
    } else {
      directions = dy > 0 ? [1, 2, 3, 0] : [0, 2, 3, 1]; 
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
    if (this.found) return; 

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
    super.draw(ctx);
    this.drawViewRadius(ctx, obstacles); 
  }
}
