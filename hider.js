import Player from "./player.js";

export default class Hider extends Player {
  constructor(x, y, radius, speed) {
    super(x, y, radius, speed, "blue");
    this.found = false; // Mark as not found initially
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

      console.log(
        `Hider escaping from seeker towards nearest permeable obstacle facing ${this.getDirectionString()}`
      );
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

      console.log(
        `Hider escaping from seeker facing ${this.getDirectionString()}`
      );
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
}
