import Game from "./game.js";

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

  simulation = new Simulation(
    numSimulations,
    numHiders,
    numObstacles,
    viewRadius,
    seekerSpeed,
    hiderSpeed,
    permeablePercent,
    () => {
      startButton.disabled = false;
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
    numObstacles,
    viewRadius,
    seekerSpeed,
    hiderSpeed,
    permeablePercent,
    onComplete
  ) {
    this.numSimulations = numSimulations;
    this.numHiders = numHiders;
    this.numObstacles = numObstacles;
    this.viewRadius = viewRadius;
    this.seekerSpeed = seekerSpeed;
    this.hiderSpeed = hiderSpeed;
    this.permeablePercent = permeablePercent;
    this.currentSimulation = 0;
    this.results = [];
    this.currentGame = null;
    this.onComplete = onComplete;
  }

  startSimulation() {
    this.restartSimulation();
    this.clearResultsTable();
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

    // Clear the canvas
    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
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

  runNextSimulation() {
    if (this.currentSimulation >= this.numSimulations) {
      this.displayResults();
      if (this.onComplete) {
        this.onComplete();
      }
      return;
    }

    this.currentSimulation++;
    this.currentGame = new Game(
      this.numHiders,
      this.numObstacles,
      this.viewRadius,
      this.seekerSpeed,
      this.hiderSpeed,
      this.permeablePercent,
      this.handleGameEnd.bind(this)
    );
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
