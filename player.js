// Klasa Player
export class Player {
  constructor(x, y, speedX, speedY, type, color) {
    this.x = x;
    this.y = y;
    this.speedX = speedX; // Przechowuje szybkość ruchu gracza
    this.speedY = speedY; // Przechowuje szybkość ruchu gracza
    this.color = color;
    this.directionTimer = 0; // Timer do śledzenia czasu od ostatniej zmiany kierunku
    this.changeDirectionInterval = Math.random() * 2000 + 1000; // Losowy czas między zmianami kierunku (od 1s do 3s)
    this.directions = ["up", "down", "left", "right"]; // Dostępne kierunki
    this.currentDirection = this.randomDirection(); // Losowy kierunek początkowy
  }

  move(dx, dy) {
    this.x += dx;
    this.y += dy;
  }

  movePlayer() {
    this.directionTimer += 16; // 16ms to czas między klatkami w animacji (przy 60 FPS)

    // Jeśli upłynął czas na zmianę kierunku
    if (this.directionTimer >= this.changeDirectionInterval) {
      this.directionTimer = 0; // Zresetuj timer
      this.changeDirectionInterval = Math.random() * 4000 + 1000; // Wygeneruj nowy losowy czas między zmianami kierunku
      this.currentDirection = this.randomDirection(); // Losowy nowy kierunek
    }

    // Określ kierunek ruchu na podstawie aktualnego kierunku
    let dx = 0;
    let dy = 0;
    switch (this.currentDirection) {
      case "up":
        dy = -this.speedY;
        break;
      case "down":
        dy = this.speedY;
        break;
      case "left":
        dx = -this.speedX;
        break;
      case "right":
        dx = this.speedX;
        break;
    }

    // Wykonaj ruch
    this.move(dx, dy);
  }

  runAwayFrom(seekerX, seekerY) {
    const dx = this.x - seekerX;
    const dy = this.y - seekerY;
    if (Math.abs(dx) > Math.abs(dy)) {
      // Poruszaj się w poziomie, aby oddalić się od seeker'a
      this.currentDirection = dx > 0 ? "right" : "left";
    } else {
      // Poruszaj się w pionie, aby oddalić się od seeker'a
      this.currentDirection = dy > 0 ? "down" : "up";
    }
  }

  // Metoda do losowania nowego kierunku ruchu
  randomDirection() {
    const index = Math.floor(Math.random() * this.directions.length);
    return this.directions[index];
  }
}
