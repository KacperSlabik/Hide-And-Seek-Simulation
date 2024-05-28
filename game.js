import Obstacle from "./obstacle.js";
import Hider from "./hider.js";
import Seeker from "./seeker.js";

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const WIDTH = 800;
const HEIGHT = 800;
const GRID_SIZE = 40;
const NUM_CELLS = WIDTH / GRID_SIZE;

class Game {
  constructor() {
    this.obstacles = [];
    this.hiders = [];
    this.seeker = null;
    this.visitedCells = Array(NUM_CELLS)
      .fill()
      .map(() => Array(NUM_CELLS).fill(false));

    this.initObstacles();
    this.initHiders();
    this.initSeeker();
  }

  initObstacles() {
    let i = 0;
    while (i < 20) {
      const width = Math.floor(Math.random() * 120) + 30;
      const height = Math.floor(Math.random() * 120) + 30;
      const x = Math.floor(Math.random() * (WIDTH - width - 40)) + 20;
      const y = Math.floor(Math.random() * (HEIGHT - height - 40)) + 20;
      const newObstacle = new Obstacle(x, y, width, height);

      if (
        !this.obstacles.some((obstacle) => obstacle.collidesWith(newObstacle))
      ) {
        this.obstacles.push(newObstacle);
        i++;
      }
    }
  }

  initHiders() {
    const segmentSize = 2; // Liczba segmentów na osi x i y
    const segmentWidth = WIDTH / segmentSize;
    const segmentHeight = HEIGHT / segmentSize;

    for (let i = 0; i < 1; i++) {
      let x, y;
      let validPosition = false;
      while (!validPosition) {
        // Wybierz losowy segment
        const segmentX = Math.floor(Math.random() * segmentSize);
        const segmentY = Math.floor(Math.random() * segmentSize);

        // Losuj współrzędne wewnątrz wybranego segmentu
        x =
          Math.floor(Math.random() * (segmentWidth - 20)) +
          segmentX * segmentWidth +
          10;
        y =
          Math.floor(Math.random() * (segmentHeight - 20)) +
          segmentY * segmentHeight +
          10;

        const newHider = new Hider(x, y, 10); // Radius 10
        validPosition = this.isPositionValid(newHider);
      }
      this.hiders.push(new Hider(x, y, 10));
    }
  }

  isPositionValid(newHider) {
    if (this.obstacles.some((obstacle) => obstacle.collidesWith(newHider))) {
      return false;
    }

    if (this.hiders.some((hider) => hider.collidesWith(newHider))) {
      return false;
    }

    return true;
  }

  initSeeker() {
    const x = 10; // Adjusted to account for radius
    const y = 10; // Adjusted to account for radius
    this.seeker = new Seeker(x, y, 10); // Radius 10
  }

  checkCollision() {
    for (let hider of this.hiders) {
      const dx = this.seeker.x - hider.x;
      const dy = this.seeker.y - hider.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < this.seeker.radius + hider.radius) {
        hider.color = "yellow";
        hider.speed = 0; // Stop the hider from moving
        return hider;
      }
    }
    return null;
  }

  checkVisibility(seeker, hider) {
    const dx = hider.x - seeker.x;
    const dy = hider.y - seeker.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < seeker.viewRadius;
  }

  gameLoop() {
    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    // Draw obstacles
    for (let obstacle of this.obstacles) {
      obstacle.draw(ctx);
    }

    // Move and draw hiders
    for (let hider of this.hiders) {
      if (hider.speed > 0) {
        const dx = this.seeker.x - hider.x;
        const dy = this.seeker.y - hider.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < 60) {
          hider.escapeFrom(this.seeker);
        }
      }
      hider.move(WIDTH, HEIGHT, this.obstacles);
      hider.draw(ctx);
    }

    // Move and draw seeker
    const visibleHider = this.hiders.find(
      (hider) =>
        this.checkVisibility(this.seeker, hider) && hider.color !== "yellow"
    );
    if (visibleHider) {
      this.seeker.chase(visibleHider, WIDTH, HEIGHT, this.obstacles);
    } else {
      this.seeker.move(WIDTH, HEIGHT, this.obstacles);
    }
    this.seeker.draw(ctx, this.obstacles);

    // Check for collisions
    this.checkCollision();

    requestAnimationFrame(this.gameLoop.bind(this));
  }

  start() {
    this.gameLoop();
  }
}

const game = new Game();
game.start();
