import Game from "./game.js";

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
    if (this.currentGame && this.currentGame.gameInterval) {
      clearInterval(this.currentGame.gameInterval);
    }
    this.currentSimulation = 0;
    this.results = [];
    this.gameTime = 0;
    this.hiderTimes = [];
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

    this.runNextSimulation();
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
