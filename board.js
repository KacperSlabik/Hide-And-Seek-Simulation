export class Board {
	constructor(width, height) {
		this.width = width;
		this.height = height;
		this.canvas = document.getElementById('gameCanvas');
		this.ctx = this.canvas.getContext('2d');
	}
}
