import Game from './game.js';
import SimulationChart from './chart.js';
import Obstacle from './obstacle.js';

const WIDTH = 800;
const HEIGHT = 800;

let simulations = [];
let pointsResults = [];
let hiderTimesResults = [];
let simulationParams = [];

async function fetchObstacleSets() {
	const response = await fetch('obstacles.json');
	const obstacleSets = await response.json();
	return obstacleSets;
}

async function startSimulation() {
	const startButton = document.getElementById('startButton');
	startButton.disabled = true;

	const obstacleSets = await fetchObstacleSets();

	const numSimulations = parseInt(
		document.getElementById('numSimulations').value
	);
	const numHiders = parseInt(document.getElementById('numHiders').value);
	const viewRadius = parseInt(document.getElementById('viewRadius').value);
	const seekerSpeed = parseInt(document.getElementById('seekerSpeed').value);
	const hiderSpeed = parseInt(document.getElementById('hiderSpeed').value);
	const hiderViewRadius = parseInt(
		document.getElementById('hiderViewRadius').value
	);
	const numPoints = parseInt(document.getElementById('numPoints').value);
	const simulationSpeed = parseInt(
		document.getElementById('simulationSpeed').value
	);

	const selectedSet = document.querySelector(
		'input[name="obstacleSet"]:checked'
	).value;
	const obstacleData = obstacleSets[selectedSet];
	const obstacles = obstacleData.map(
		(data) =>
			new Obstacle(data.x, data.y, data.width, data.height, data.permeable)
	);

	simulationParams.push({
		numSimulations,
		numHiders,
		viewRadius,
		seekerSpeed,
		hiderSpeed,
		hiderViewRadius,
		numPoints,
		simulationSpeed,
		selectedSet,
	});

	const simulation = new Simulation(
		numSimulations,
		numHiders,
		viewRadius,
		seekerSpeed,
		hiderSpeed,
		hiderViewRadius,
		numPoints,
		simulationSpeed,
		obstacles,
		() => {
			simulations.push(simulation.results);
			pointsResults.push(simulation.pointsResults);
			hiderTimesResults.push(simulation.hiderTimesResults);
			startButton.disabled = false;
			const continueButton = document.getElementById('continueButton');
			continueButton.style.display = 'inline-block';
		}
	);

	simulation.startSimulation();
}

function continueSimulation() {
	const continueButton = document.getElementById('continueButton');
	continueButton.style.display = 'none';

	startSimulation();
}

function finishSimulations() {
	const chart = new SimulationChart(
		'resultsChart',
		'pointsChart',
		'hiderTimesChart'
	);
	chart.generateComparisonChart(simulations);
	chart.generatePointsChart(pointsResults);
	chart.generateHiderTimesChart(hiderTimesResults);
	renderAllResultsTables(simulations, simulationParams);
}

function reloadPage() {
	window.location.reload();
}

document
	.getElementById('startButton')
	.addEventListener('click', startSimulation);
document
	.getElementById('continueButton')
	.addEventListener('click', continueSimulation);
document
	.getElementById('finishButton')
	.addEventListener('click', finishSimulations);
document.getElementById('reloadButton').addEventListener('click', reloadPage);

function renderAllResultsTables(simulations, params) {
	const resultsTable = document.getElementById('resultsTable');
	resultsTable.innerHTML = '';

	simulations.forEach((simulationResults, index) => {
		const headerRow = `
      <tr>
        <th>Simulation #</th>
        <th>Game Time</th>
        <th>Hider Times</th>
        <th>Points Collected</th>
        <th>Win Status</th>
      </tr>
    `;

		const rows = simulationResults
			.map(
				(result) => `
      <tr>
        <td>${result.simulationNumber}</td>
        <td>${result.gameTime}</td>
        <td>${result.hiderTimes.join(', ')}</td>
        <td>${result.pointsCollected}</td>
        <td>${result.winStatus}</td>
      </tr>
    `
			)
			.join('');

		const totalGameTime = simulationResults.reduce(
			(sum, result) => sum + result.gameTime,
			0
		);
		const averageGameTime = (totalGameTime / simulationResults.length).toFixed(
			2
		);

		const paramList = `
      <ul>
        <li>Number of Simulations: ${params[index].numSimulations}</li>
        <li>Number of Hiders: ${params[index].numHiders}</li>
        <li>View Radius: ${params[index].viewRadius}</li>
        <li>Seeker Speed: ${params[index].seekerSpeed}</li>
        <li>Hider Speed: ${params[index].hiderSpeed}</li>
        <li>Hider View Radius: ${params[index].hiderViewRadius}</li>
        <li>Number of Points: ${params[index].numPoints}</li>
        <li>Simulation Speed: ${params[index].simulationSpeed}</li>
        <li>Obstacle Set: ${params[index].selectedSet}</li>
      </ul>
    `;

		const tableHTML = headerRow + rows;
		const tableWrapper = document.createElement('div');
		tableWrapper.innerHTML = `<h3>Results Table Set ${
			index + 1
		}</h3>${paramList}<table>${tableHTML}</table><h4>Average Game Time: ${averageGameTime}s</h4>`;
		resultsTable.appendChild(tableWrapper);
	});
}

class Simulation {
	constructor(
		numSimulations,
		numHiders,
		viewRadius,
		seekerSpeed,
		hiderSpeed,
		hiderViewRadius,
		numPoints,
		simulationSpeed,
		obstacles,
		onComplete
	) {
		this.numSimulations = numSimulations;
		this.numHiders = numHiders;
		this.viewRadius = viewRadius;
		this.seekerSpeed = seekerSpeed;
		this.hiderSpeed = hiderSpeed;
		this.hiderViewRadius = hiderViewRadius;
		this.numPoints = numPoints;
		this.simulationSpeed = simulationSpeed;
		this.obstacles = obstacles;
		this.currentSimulation = 0;
		this.results = [];
		this.pointsResults = [];
		this.hiderTimesResults = [];
		this.currentGame = null;
		this.onComplete = onComplete;
		this.startTime = null;
		this.overallInterval = null;
		this.simulationGameTime = 0;
	}

	startSimulation() {
		this.restartSimulation();
		this.startTime = Date.now();
		this.updateOverallTime();
		this.runNextSimulation();
	}

	restartSimulation() {
		if (this.currentGame) {
			this.currentGame.stop();
		}
		this.currentSimulation = 0;
		this.results = [];
		this.pointsResults = [];
		this.hiderTimesResults = [];
		const timerElement = document.getElementById('timer');
		if (timerElement) {
			timerElement.textContent = `Time: 0s`;
		}
		const secondTimerElement = document.getElementById('secondTimer');
		if (secondTimerElement) {
			secondTimerElement.textContent = `Simulation Time: ${Math.floor(
				this.simulationGameTime
			)}s`;
		}
		const currentSimulationElement =
			document.getElementById('currentSimulation');
		if (currentSimulationElement) {
			currentSimulationElement.textContent = `Current Simulation: 0`;
		}

		// Clear the canvas
		const canvas = document.getElementById('gameCanvas');
		const ctx = canvas.getContext('2d');
		ctx.clearRect(0, 0, canvas.width, canvas.height);

		// Clear overall timer
		const overallTimerElement = document.getElementById('overallTimer');
		if (overallTimerElement) {
			overallTimerElement.textContent = `Overall Time: 0s`;
		}
		if (this.overallInterval) {
			clearInterval(this.overallInterval);
		}
	}

	updateOverallTime() {
		const overallTimerElement = document.getElementById('overallTimer');
		if (overallTimerElement) {
			this.overallInterval = setInterval(() => {
				const elapsedTime = Math.floor((Date.now() - this.startTime) / 1000);
				overallTimerElement.textContent = `Overall Time: ${elapsedTime}s`;
			}, 1000);
		}
	}

	updateSimulationTime() {
		this.simulationGameTime += 1 / this.simulationSpeed;
		const secondTimerElement = document.getElementById('secondTimer');
		if (secondTimerElement) {
			secondTimerElement.textContent = `Simulation Time: ${Math.floor(
				this.simulationGameTime * this.simulationSpeed
			)}s`;
		}
	}

	runNextSimulation() {
		if (this.currentSimulation >= this.numSimulations) {
			if (this.onComplete) {
				clearInterval(this.overallInterval);
				this.onComplete();
			}
			return;
		}

		this.currentSimulation++;
		const currentSimulationElement =
			document.getElementById('currentSimulation');
		if (currentSimulationElement) {
			currentSimulationElement.textContent = `Current Simulation: ${this.currentSimulation}`;
		}

		this.currentGame = new Game(
			this.numHiders,
			this.viewRadius,
			this.seekerSpeed,
			this.hiderSpeed,
			this.hiderViewRadius,
			this.numPoints,
			this.simulationSpeed,
			this.handleGameEnd.bind(this),
			this.updateSimulationTime.bind(this)
		);
		this.currentGame.setObstacles(this.obstacles);
		this.currentGame.start();
	}

	handleGameEnd(gameTime, hiderTimes, pointsCollected, winStatus) {
		this.results.push({
			simulationNumber: this.currentSimulation,
			gameTime: gameTime,
			hiderTimes: hiderTimes.map((time) => Math.round(time * 100) / 100),
			pointsCollected: pointsCollected,
			winStatus: winStatus ? 'Yes' : 'No',
		});

		this.pointsResults.push({
			simulationNumber: this.currentSimulation,
			pointsCollected,
		});
		this.hiderTimesResults.push({
			simulationNumber: this.currentSimulation,
			hiderTimes,
		});

		setTimeout(() => this.runNextSimulation(), 1000);
	}
}

export default Simulation;
