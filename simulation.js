import Game from "./game.js";
import SimulationChart from "./chart.js";
import Obstacle from "./obstacle.js";

const WIDTH = 800;
const HEIGHT = 800;

let simulation;

async function fetchObstacleSets() {
  const response = await fetch("obstacles.json");
  const obstacleSets = await response.json();
  return obstacleSets;
}

async function startSimulation() {
  const startButton = document.getElementById("startButton");
  startButton.disabled = true;

  const obstacleSets = await fetchObstacleSets();

  const numSimulations = parseInt(
    document.getElementById("numSimulations").value
  );
  const numHiders = parseInt(document.getElementById("numHiders").value);
  const viewRadius = parseInt(document.getElementById("viewRadius").value);
  const seekerSpeed = parseInt(document.getElementById("seekerSpeed").value);
  const hiderSpeed = parseInt(document.getElementById("hiderSpeed").value);
  const hiderViewRadius = parseInt(
    document.getElementById("hiderViewRadius").value
  );
  const numPoints = parseInt(document.getElementById("numPoints").value);
  const simulationSpeed = parseInt(
    document.getElementById("simulationSpeed").value
  );

  const selectedSet = document.querySelector(
    'input[name="obstacleSet"]:checked'
  ).value;
  const obstacleData = obstacleSets[selectedSet];
  const obstacles = obstacleData.map(
    (data) =>
      new Obstacle(data.x, data.y, data.width, data.height, data.permeable)
  );

  simulation = new Simulation(
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
      startButton.disabled = false;
      const chart = new SimulationChart("resultsChart", "hiderChart");
      chart.generateChart(simulation.results);
      chart.generateHiderChart(simulation.results);
    }
  );

  simulation.startSimulation();
}

function reloadPage() {
  window.location.reload();
}

document
  .getElementById("startButton")
  .addEventListener("click", startSimulation);
document.getElementById("reloadButton").addEventListener("click", reloadPage);

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
    this.currentGame = null;
    this.onComplete = onComplete;
    this.startTime = null;
    this.overallInterval = null;
    this.simulationGameTime = 0;
  }

  startSimulation() {
    this.restartSimulation();
    this.clearResultsTable();
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
    const timerElement = document.getElementById("timer");
    if (timerElement) {
      timerElement.textContent = `Time: 0s`;
    }
    const secondTimerElement = document.getElementById("secondTimer");
    if (secondTimerElement) {
      secondTimerElement.textContent = `Simulation Time: ${Math.floor(
        this.simulationGameTime
      )}s`;
    }
    const currentSimulationElement =
      document.getElementById("currentSimulation");
    if (currentSimulationElement) {
      currentSimulationElement.textContent = `Current Simulation: 0`;
    }

    // Clear the canvas
    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Clear overall timer
    const overallTimerElement = document.getElementById("overallTimer");
    if (overallTimerElement) {
      overallTimerElement.textContent = `Overall Time: 0s`;
    }
    if (this.overallInterval) {
      clearInterval(this.overallInterval);
    }
  }

  clearResultsTable() {
    const resultsTable = document.getElementById("resultsTable");
    resultsTable.innerHTML = `
      <tr>
        <th>Simulation #</th>
        <th>Game Time</th>
        <th>Hider Times</th>
        <th>Points Collected</th>
        <th>Win Status</th>
      </tr>
    `;
  }

  updateOverallTime() {
    const overallTimerElement = document.getElementById("overallTimer");
    if (overallTimerElement) {
      this.overallInterval = setInterval(() => {
        const elapsedTime = Math.floor((Date.now() - this.startTime) / 1000);
        overallTimerElement.textContent = `Overall Time: ${elapsedTime}s`;
      }, 1000);
    }
  }

  updateSimulationTime() {
    this.simulationGameTime += 1 / this.simulationSpeed;
    const secondTimerElement = document.getElementById("secondTimer");
    if (secondTimerElement) {
      secondTimerElement.textContent = `Simulation Time: ${Math.floor(
        this.simulationGameTime * this.simulationSpeed
      )}s`;
    }
  }

  runNextSimulation() {
    if (this.currentSimulation >= this.numSimulations) {
      this.displayResults();
      if (this.onComplete) {
        clearInterval(this.overallInterval); // Stop the overall timer
        this.onComplete();
      }
      return;
    }

    this.currentSimulation++;
    const currentSimulationElement =
      document.getElementById("currentSimulation");
    if (currentSimulationElement) {
      currentSimulationElement.textContent = `Current Simulation: ${this.currentSimulation}`;
    }

    this.currentGame = new Game(
      this.numHiders,
      this.viewRadius,
      this.seekerSpeed,
      this.hiderSpeed,
      this.hiderViewRadius, // Pass the hider's view radius
      this.numPoints, // Pass the number of points
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
      winStatus: winStatus ? "Yes" : "No",
    });

    // Short delay before the next simulation
    setTimeout(() => this.runNextSimulation(), 1000);
  }

  displayResults() {
    const resultsTable = document.getElementById("resultsTable");

    let totalTime = 0;

    for (let result of this.results) {
      const hiderTimes = result.hiderTimes.join(", ");
      resultsTable.innerHTML += `
        <tr>
          <td>${result.simulationNumber}</td>
          <td>${result.gameTime}</td>
          <td>${hiderTimes}</td>
          <td>${result.pointsCollected}</td>
          <td>${result.winStatus}</td>
        </tr>
      `;

      totalTime += result.gameTime;
    }

    const averageTime = totalTime / this.results.length;
    resultsTable.innerHTML += `
      <tr>
        <td colspan="4">Average Game Time</td>
        <td>${averageTime.toFixed(2)}</td>
      </tr>
    `;
  }
}

export default Simulation;
