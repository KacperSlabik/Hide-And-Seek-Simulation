import Obstacle from "./obstacle.js";
import Hider from "./hider.js";
import Seeker from "./seeker.js";

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const WIDTH = 800;
const HEIGHT = 800;

class Game {
  constructor(numHiders, viewRadius, seekerSpeed, hiderSpeed, onGameEnd) {
    this.numHiders = numHiders;
    this.viewRadius = viewRadius;
    this.seekerSpeed = seekerSpeed;
    this.hiderSpeed = hiderSpeed;
    this.obstacles = []; // Initialize as an array
    this.hiders = [];
    this.seeker = null;
    this.gameTime = 0;
    this.hiderTimes = [];
    this.onGameEnd = onGameEnd;
    this.gameInterval = null;
    this.animationFrameId = null;
    this.timerElement = document.getElementById("timer");
    this.initSeeker();
  }

  setObstacles(obstacles) {
    this.obstacles = obstacles;
    this.initHiders(); // Initialize hiders after setting obstacles
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

        const newHider = new Hider(x, y, 10, this.hiderSpeed);
        if (this.isPositionValid(newHider)) {
          validPosition = true;
          this.hiders.push(newHider);
        }
      }
    }
  }

  isPositionValid(newHider) {
    if (this.hiders.some((hider) => hider.collidesWith(newHider))) {
      return false;
    }

    if (this.collidesWithObstacle(newHider)) {
      return false;
    }

    return true;
  }

  collidesWithObstacle(newHider) {
    return this.obstacles.some(
      (obstacle) =>
        !(
          newHider.x + newHider.radius < obstacle.x ||
          newHider.x - newHider.radius > obstacle.x + obstacle.width ||
          newHider.y + newHider.radius < obstacle.y ||
          newHider.y - newHider.radius > obstacle.y + obstacle.height
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
        hider.color = "yellow";
        hider.speed = 0;
        hider.found = true; // Mark this hider as found
        this.hiderTimes.push(this.gameTime);
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
    this.gameTime += 1;
    if (this.timerElement) {
      this.timerElement.textContent = `Time: ${this.gameTime}s`;
    }
  }

  gameLoop() {
    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    for (let obstacle of this.obstacles) {
      obstacle.draw(ctx);
    }

    let allHidersCaught = true;
    for (let hider of this.hiders) {
      if (hider.speed > 0) {
        allHidersCaught = false;
        this.checkVisibility(this.seeker, hider, this.obstacles);
      }
      hider.move(WIDTH, HEIGHT, this.obstacles);
      hider.draw(ctx, this.obstacles);
    }

    if (allHidersCaught) {
      clearInterval(this.gameInterval);
      this.onGameEnd(this.gameTime, this.hiderTimes);
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

  start() {
    if (this.gameInterval) {
      clearInterval(this.gameInterval);
    }
    this.gameTime = 0;
    this.hiderTimes = [];
    if (this.timerElement) {
      this.timerElement.textContent = `Time: ${this.gameTime}s`;
    }
    this.gameInterval = setInterval(this.updateGameTime.bind(this), 1000);
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
