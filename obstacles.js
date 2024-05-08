export class Obstacles {
	constructor() {
		this.obstacles = [];
	}

	generateObstacles(numObstacles, maxWidth, maxHeight) {
		const minDistance = 20; // Minimalna odległość między przeszkodami

		for (let i = 0; i < numObstacles; i++) {
			let x, y, width, height;
			do {
				// Losujemy pozycję i rozmiar przeszkody
				x = Math.random() * (maxWidth - 50); // Losowa pozycja X
				y = Math.random() * (maxHeight - 50); // Losowa pozycja Y
				width = Math.random() * 90 + 20; // Losowa szerokość przeszkody od 10 do 60
				height = Math.random() * 90 + 20; // Losowa wysokość przeszkody od 10 do 60
			} while (this.isTooClose(x, y, width, height, minDistance)); // Sprawdź, czy nowa przeszkoda jest wystarczająco odległa od innych

			this.obstacles.push({ x, y, width, height });
		}
	}

	isTooClose(newX, newY, newWidth, newHeight, minDistance) {
		for (let i = 0; i < this.obstacles.length; i++) {
			const obstacle = this.obstacles[i];
			// Obliczamy odległość między środkami przeszkód
			const distance = Math.sqrt(
				(obstacle.x - newX) ** 2 + (obstacle.y - newY) ** 2
			);
			// Sprawdzamy, czy odległość jest mniejsza niż minimalna wymagana
			if (
				distance <
				minDistance +
					Math.max(newWidth, newHeight, obstacle.width, obstacle.height)
			) {
				return true; // Jeśli odległość jest za mała, zwracamy true
			}
		}
		return false; // Jeśli odległość jest wystarczająco duża, zwracamy false
	}

	drawObstacles(ctx) {
		ctx.fillStyle = 'black'; // Kolor przeszkód
		this.obstacles.forEach((obstacle) => {
			ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height); // Rysowanie przeszkód jako prostokątów
		});
	}
}
