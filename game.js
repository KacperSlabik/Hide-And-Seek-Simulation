// Importy klas
import { Board } from "./board.js";
import { Obstacles } from "./obstacles.js";
import { Player } from "./player.js";

// Inicjalizacja obiektów
const board = new Board(1000, 1000);
const seeker = new Player(0, 0, 1, 1, "seeker", "red"); // Gracz typu "seeker"
const hidder = []; // Tablica graczy typu "hidder"
const obstacles = new Obstacles();

// Funkcja do generowania losowych liczb z zakresu min-max (włącznie z min i max)
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Funkcja do losowego ustawienia określonej liczby graczy typu "hidder" na planszy, unikając kolizji z przeszkodami
function placeHidders(numHidders) {
  for (let i = 0; i < numHidders; i++) {
    let x, y;
    do {
      x = getRandomInt(0, board.width - 20);
      y = getRandomInt(0, board.height - 20);
    } while (checkCollisionWithObstacles({ x: x, y: y })); // Sprawdź, czy wybrana pozycja koliduje z przeszkodami

    hidder[i].x = x;
    hidder[i].y = y;
  }
}

// Funkcja rysująca planszę
function drawBoard() {
  board.ctx.clearRect(0, 0, board.width, board.height);
  board.ctx.strokeStyle = "black";
  board.ctx.lineWidth = 2;
  board.ctx.strokeRect(0, 0, board.width, board.height);
  obstacles.drawObstacles(board.ctx);
  if (seeker.type === "seeker") {
    const sightRange = 50;
    board.ctx.fillStyle = "rgba(255, 255, 0, 0.2)";
    board.ctx.beginPath();
    board.ctx.arc(seeker.x + 10, seeker.y + 10, sightRange, 0, Math.PI * 2);
    board.ctx.fill();
  }
}

// Funkcja rysująca gracza
function drawPlayer(player) {
  board.ctx.fillStyle = player.type === "seeker" ? "red" : "blue";
  board.ctx.beginPath();
  board.ctx.arc(player.x + 10, player.y + 10, 10, 0, Math.PI * 2);
  board.ctx.fill();
}

// Funkcja sprawdzająca kolizję z krawędziami planszy
function checkCollisionWithBoard(player) {
  let collided = false;
  if (
    player.x < 0 ||
    player.x > board.width - 20 ||
    player.y < 0 ||
    player.y > board.height - 20
  ) {
    player.speedX *= -1;
    player.speedY *= -1;
    collided = true;
  }
  return collided;
}

// Funkcja sprawdzająca kolizję z przeszkodami
function checkCollisionWithObstacles(player) {
  for (let i = 0; i < obstacles.obstacles.length; i++) {
    const obstacle = obstacles.obstacles[i];
    if (
      player.x + 20 > obstacle.x &&
      player.x < obstacle.x + obstacle.width &&
      player.y + 20 > obstacle.y &&
      player.y < obstacle.y + obstacle.height
    ) {
      player.speedX *= -1;
      player.speedY *= -1;
      return true;
    }
  }
  return false;
}

// Funkcja sprawdzająca pole widzenia dla wszystkich graczy typu "hidder" w tablicy
function checkSight() {
  const sightRange = 50;
  hidder.forEach((hidderPlayer) => {
    const distance = Math.sqrt(
      Math.pow(seeker.x - hidderPlayer.x, 2) +
        Math.pow(seeker.y - hidderPlayer.y, 2)
    );
    if (distance <= sightRange) {
    }
  });
}

// Funkcja aktualizująca grę
function update() {
  seeker.movePlayer();
  hidder.forEach((hidderPlayer) => {
    hidderPlayer.movePlayer(); // Przesuń każdego gracza typu "hidder"
  });

  hidder.forEach((hidderPlayer) => {
    hidderPlayer.runAwayFrom(seeker.x, seeker.y); // Przesuń każdego gracza typu "hidder"
  });
  checkCollisionWithBoard(seeker);
  hidder.forEach((hidderPlayer) => {
    checkCollisionWithBoard(hidderPlayer);
  });
  checkCollisionWithObstacles(seeker);
  hidder.forEach((hidderPlayer) => {
    checkCollisionWithObstacles(hidderPlayer);
  });

  checkSight();
}

// Funkcja głównej pętli gry
function gameLoop() {
  update();
  drawBoard();
  drawPlayer(seeker);
  for (let i = 0; i < hidder.length; i++) {
    drawPlayer(hidder[i]);
  }
  requestAnimationFrame(gameLoop);
}

// Inicjalizacja przeszkód
obstacles.generateObstacles(20, board.width, board.height);

// Inicjalizacja graczy typu "hidder" i ustawienie ich na planszy
const numHidders = 5; // Można zmienić na dowolną inną wartość
for (let i = 0; i < numHidders; i++) {
  hidder.push(new Player(0, 0, 0.5, 0.5, "hidder", "blue"));
}
placeHidders(numHidders);

// Uruchomienie głównej pętli gry
gameLoop();
