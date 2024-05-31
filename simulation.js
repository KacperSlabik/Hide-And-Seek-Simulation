import Game from "./game.js";
import SimulationChart from "./chart.js";
import Obstacle from "./obstacle.js";

const WIDTH = 800;
const HEIGHT = 800;

let simulation;

function startSimulation() {
  const startButton = document.getElementById("startButton");
  startButton.disabled = true;

  const numSimulations = parseInt(
    document.getElementById("numSimulations").value
  );
  const numHiders = parseInt(document.getElementById("numHiders").value);
  const numObstacles = parseInt(document.getElementById("numObstacles").value);
  const viewRadius = parseInt(document.getElementById("viewRadius").value);
  const seekerSpeed = parseInt(document.getElementById("seekerSpeed").value);
  const hiderSpeed = parseInt(document.getElementById("hiderSpeed").value);
  const permeablePercent = parseInt(
    document.getElementById("permeablePercent").value
  );

  const obstacles = generateObstacles(numObstacles, permeablePercent);

  simulation = new Simulation(
    numSimulations,
    numHiders,
    viewRadius,
    seekerSpeed,
    hiderSpeed,
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

function generateObstacles(numObstacles, permeablePercent) {
  const obstacles = [];
  let i = 0;
  while (i < numObstacles) {
    const width = Math.floor(Math.random() * 120) + 30;
    const height = Math.floor(Math.random() * 120) + 30;
    const x = Math.floor(Math.random() * (WIDTH - width - 40)) + 20;
    const y = Math.floor(Math.random() * (HEIGHT - height - 40)) + 20;
    const permeable = Math.random() < permeablePercent / 100;
    const newObstacle = new Obstacle(x, y, width, height, permeable);

    if (!obstacles.some((obstacle) => obstacle.collidesWith(newObstacle))) {
      obstacles.push(newObstacle);
      i++;
    }
  }
  return obstacles;
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
    obstacles,
    onComplete
  ) {
    this.numSimulations = numSimulations;
    this.numHiders = numHiders;
    this.viewRadius = viewRadius;
    this.seekerSpeed = seekerSpeed;
    this.hiderSpeed = hiderSpeed;
    this.obstacles = obstacles;
    this.currentSimulation = 0;
    this.results = [];
    this.currentGame = null;
    this.onComplete = onComplete;
    this.startTime = null;
    this.overallInterval = null;
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
      this.handleGameEnd.bind(this)
    );
    this.currentGame.setObstacles(this.obstacles);
    this.currentGame.start();
  }

  handleGameEnd(gameTime, hiderTimes) {
    this.results.push({
      simulationNumber: this.currentSimulation,
      gameTime: gameTime,
      hiderTimes: hiderTimes,
    });

    // Short delay before the next simulation
    setTimeout(() => this.runNextSimulation(), 100);
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
        </tr>
      `;

      totalTime += result.gameTime;
    }

    const averageTime = totalTime / this.results.length;
    resultsTable.innerHTML += `
      <tr>
        <td colspan="2">Average Game Time</td>
        <td>${averageTime.toFixed(2)}</td>
      </tr>
    `;
  }
}

export default Simulation;
