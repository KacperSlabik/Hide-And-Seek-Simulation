import Obstacle from "./obstacle.js";
import Hider from "./hider.js";
import Seeker from "./seeker.js";
import Point from "./point.js";

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const WIDTH = 800;
const HEIGHT = 800;
const MIN_DISTANCE_FROM_EDGE = 10;
const MIN_DISTANCE_FROM_OBSTACLE = 10;

class Game {
  constructor(
    numHiders,
    viewRadius,
    seekerSpeed,
    hiderSpeed,
    hiderViewRadius,
    numPoints,
    simulationSpeed,
    onGameEnd,
    updateSimulationTime
  ) {
    this.numHiders = numHiders;
    this.viewRadius = viewRadius;
    this.seekerSpeed = seekerSpeed * simulationSpeed;
    this.hiderSpeed = hiderSpeed * simulationSpeed;
    this.hiderViewRadius = hiderViewRadius;
    this.numPoints = numPoints;
    this.simulationSpeed = simulationSpeed;
    this.obstacles = [];
    this.hiders = [];
    this.points = [];
    this.seeker = null;
    this.gameTime = 0;
    this.simulationGameTime = 0;
    this.hiderTimes = [];
    this.pointsCollected = 0; // Track collected points
    this.onGameEnd = onGameEnd;
    this.updateSimulationTime = updateSimulationTime;
    this.gameInterval = null;
    this.animationFrameId = null;
    this.timerElement = document.getElementById("timer");
    this.initSeeker();
  }

  setObstacles(obstacles) {
    this.obstacles = obstacles;
    this.initHiders();
    this.generatePoints(this.numPoints);
    console.log(obstacles);
  }

  initHiders() {
    const segmentSize = 2;
    const segmentWidth = WIDTH / segmentSize;
    const segmentHeight = HEIGHT / segmentSize;

    for (let i = 0; i < this.numHiders; i++) {
      let x, y;
      let validPosition = false;
      while (!validPosition) {
        const segmentX = Math.floor(Math.random() * segmentSize);
        const segmentY = Math.floor(Math.random() * segmentSize);

        if (segmentX === 0 && segmentY === 0) {
          continue;
        }

        x =
          Math.floor(Math.random() * (segmentWidth - 20)) +
          segmentX * segmentWidth +
          10;
        y =
          Math.floor(Math.random() * (segmentHeight - 20)) +
          segmentY * segmentHeight +
          10;

        const newHider = new Hider(
          x,
          y,
          10,
          this.hiderSpeed,
          this.hiderViewRadius
        );
        if (this.isPositionValid(newHider)) {
          validPosition = true;
          this.hiders.push(newHider);
        }
      }
    }
  }

  generatePoints(numPoints) {
    for (let i = 0; i < numPoints; i++) {
      let x, y;
      let validPosition = false;
      while (!validPosition) {
        x =
          Math.floor(
            Math.random() * (WIDTH - MIN_DISTANCE_FROM_EDGE * 2 - 10)
          ) + MIN_DISTANCE_FROM_EDGE;
        y =
          Math.floor(
            Math.random() * (HEIGHT - MIN_DISTANCE_FROM_EDGE * 2 - 10)
          ) + MIN_DISTANCE_FROM_EDGE;

        const newPoint = new Point(x, y);
        if (this.isPositionValid(newPoint)) {
          validPosition = true;
          this.points.push(newPoint);
        }
      }
    }
  }

  isPositionValid(newItem) {
    if (
      this.hiders.some((hider) => hider.collidesWith(newItem)) ||
      this.points.some((point) => point.collidesWith(newItem)) ||
      this.collidesWithObstacle(newItem)
    ) {
      return false;
    }
    return true;
  }

  collidesWithObstacle(newItem) {
    return this.obstacles.some(
      (obstacle) =>
        !(
          newItem.x + newItem.radius + MIN_DISTANCE_FROM_OBSTACLE <
            obstacle.x ||
          newItem.x - newItem.radius - MIN_DISTANCE_FROM_OBSTACLE >
            obstacle.x + obstacle.width ||
          newItem.y + newItem.radius + MIN_DISTANCE_FROM_OBSTACLE <
            obstacle.y ||
          newItem.y - newItem.radius - MIN_DISTANCE_FROM_OBSTACLE >
            obstacle.y + obstacle.height
        )
    );
  }

  initSeeker() {
    const x = 10;
    const y = 10;
    this.seeker = new Seeker(x, y, 10, this.viewRadius, this.seekerSpeed);
  }

  checkCollision() {
    for (let hider of this.hiders) {
      if (
        !hider.found &&
        this.seeker.collidesWith(hider) &&
        !hider.isInsidePermeableObstacle(this.obstacles)
      ) {
        console.log(`Hider found at (${hider.x}, ${hider.y})`);
        hider.color = "rgba(0, 0, 255, 0.2)";
        hider.speed = 0;
        hider.found = true;
        this.hiderTimes.push(Math.floor(this.gameTime * 100) / 100);
      }
    }
  }

  checkVisibility(seeker, hider, obstacles) {
    const visible = seeker.canSee(hider, obstacles);
    if (visible) {
      hider.escapeFrom(seeker, obstacles);
    }
    return visible;
  }

  updateGameTime() {
    this.gameTime += 1 / this.simulationSpeed;
    if (this.timerElement) {
      this.timerElement.textContent = `Time: ${Math.floor(this.gameTime)}s`;
    }
  }

  gameLoop() {
    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    for (let obstacle of this.obstacles) {
      obstacle.draw(ctx);
    }

    for (let point of this.points) {
      point.draw(ctx);
    }

    let allHidersCaught = true;
    for (let hider of this.hiders) {
      if (hider.speed > 0) {
        allHidersCaught = false;
        this.checkVisibility(this.seeker, hider, this.obstacles);
      }

      const visiblePoint = this.points.find((point) =>
        hider.canSee(point, this.obstacles)
      );
      if (visiblePoint) {
        hider.moveTowardsPoint(visiblePoint, WIDTH, HEIGHT, this.obstacles);
        if (hider.hasCollectedPoint(visiblePoint)) {
          this.points = this.points.filter((point) => point !== visiblePoint);
          this.pointsCollected++; // Increment points collected
        }
      } else {
        hider.move(WIDTH, HEIGHT, this.obstacles);
      }

      hider.draw(ctx, this.obstacles);
    }

    if (allHidersCaught) {
      this.endGame(false);
      return;
    }

    if (this.points.length === 0) {
      this.endGame(true);
      return;
    }

    const visibleHider = this.hiders.find(
      (hider) =>
        this.checkVisibility(this.seeker, hider, this.obstacles) &&
        hider.speed > 0
    );
    if (visibleHider) {
      this.seeker.chase(visibleHider, WIDTH, HEIGHT, this.obstacles);
    } else {
      this.seeker.move(WIDTH, HEIGHT, this.obstacles);
    }
    this.seeker.draw(ctx, this.obstacles);

    this.checkCollision();

    this.animationFrameId = requestAnimationFrame(this.gameLoop.bind(this));
  }

  endGame(winStatus) {
    clearInterval(this.gameInterval);
    cancelAnimationFrame(this.animationFrameId);
    this.onGameEnd(
      Math.floor(this.gameTime),
      this.hiderTimes,
      this.pointsCollected,
      winStatus
    );
  }

  start() {
    if (this.gameInterval) {
      clearInterval(this.gameInterval);
    }
    this.gameTime = 0;
    this.hiderTimes = [];
    this.pointsCollected = 0; // Reset collected points
    if (this.timerElement) {
      this.timerElement.textContent = `Time: ${this.gameTime}s`;
    }
    this.gameInterval = setInterval(() => {
      this.updateGameTime();
      this.updateSimulationTime();
    }, 1000 / this.simulationSpeed);
    this.gameLoop();
  }

  stop() {
    if (this.gameInterval) {
      clearInterval(this.gameInterval);
    }
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }
}

export default Game;
