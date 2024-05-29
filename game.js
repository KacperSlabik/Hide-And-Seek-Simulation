import Obstacle from "./obstacle.js";
import Hider from "./hider.js";
import Seeker from "./seeker.js";

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const WIDTH = 800;
const HEIGHT = 800;
const GRID_SIZE = 40;

class Game {
  constructor(
    numHiders,
    numObstacles,
    viewRadius,
    seekerSpeed,
    hiderSpeed,
    permeablePercent
  ) {
    this.numHiders = numHiders;
    this.numObstacles = numObstacles;
    this.viewRadius = viewRadius;
    this.seekerSpeed = seekerSpeed;
    this.hiderSpeed = hiderSpeed;
    this.permeablePercent = permeablePercent;
    this.obstacles = [];
    this.hiders = [];
    this.seeker = null;
    this.gameTime = 0;
    this.gameInterval = null;
    this.timerElement = document.getElementById("timer");
    this.initObstacles();
    this.initHiders();
    this.initSeeker();
  }

  initObstacles() {
    let i = 0;
    while (i < this.numObstacles) {
      const width = Math.floor(Math.random() * 120) + 30;
      const height = Math.floor(Math.random() * 120) + 30;
      const x = Math.floor(Math.random() * (WIDTH - width - 40)) + 20;
      const y = Math.floor(Math.random() * (HEIGHT - height - 40)) + 20;
      const permeable = Math.random() < this.permeablePercent / 100;
      const newObstacle = new Obstacle(x, y, width, height, permeable);

      if (
        !this.obstacles.some((obstacle) => obstacle.collidesWith(newObstacle))
      ) {
        this.obstacles.push(newObstacle);
        i++;
      }
    }
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
        validPosition = this.isPositionValid(newHider);
      }
      this.hiders.push(new Hider(x, y, 10, this.hiderSpeed));
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
      if (this.seeker.collidesWith(hider)) {
        hider.color = "yellow";
        hider.speed = 0;
      }
    }
  }

  checkVisibility(seeker, hider) {
    const visible = seeker.canSee(hider, this.obstacles);
    if (visible) {
      hider.escapeFrom(seeker);
    }
    //   hider.move(WIDTH, HEIGHT, this.obstacles);
    // }
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
        this.checkVisibility(this.seeker, hider);
      }
      hider.move(WIDTH, HEIGHT, this.obstacles);
      hider.draw(ctx, this.obstacles);
    }

    if (allHidersCaught) {
      clearInterval(this.gameInterval);
      alert(`Game over! Time: ${this.gameTime}s`);
      return;
    }

    const visibleHider = this.hiders.find(
      (hider) => this.checkVisibility(this.seeker, hider) && hider.speed > 0
    );
    if (visibleHider) {
      this.seeker.chase(visibleHider, WIDTH, HEIGHT, this.obstacles);
    } else {
      this.seeker.move(WIDTH, HEIGHT, this.obstacles);
    }
    this.seeker.draw(ctx, this.obstacles);

    this.checkCollision();

    requestAnimationFrame(this.gameLoop.bind(this));
  }

  start() {
    if (this.gameInterval) {
      clearInterval(this.gameInterval);
    }
    this.gameTime = 0;
    if (this.timerElement) {
      this.timerElement.textContent = `Time: ${this.gameTime}s`;
    }
    this.gameInterval = setInterval(this.updateGameTime.bind(this), 1000);
    this.gameLoop();
  }
}

window.startGame = function () {
  if (window.currentGame) {
    clearInterval(window.currentGame.gameInterval); // Clear the interval of the previous game
    window.currentGame = null;
  }

  const numHiders = parseInt(document.getElementById("numHiders").value);
  const numObstacles = parseInt(document.getElementById("numObstacles").value);
  const viewRadius = parseInt(document.getElementById("viewRadius").value);
  const seekerSpeed = parseInt(document.getElementById("seekerSpeed").value);
  const hiderSpeed = parseInt(document.getElementById("hiderSpeed").value);
  const permeablePercent = parseInt(
    document.getElementById("permeablePercent").value
  );

  window.currentGame = new Game(
    numHiders,
    numObstacles,
    viewRadius,
    seekerSpeed,
    hiderSpeed,
    permeablePercent
  );
  window.currentGame.start();
};
