class SimulationChart {
  constructor(resultsChartId, hiderChartId) {
    this.resultsChartId = resultsChartId;
    this.hiderChartId = hiderChartId;
    this.resultsChart = null;
    this.hiderChart = null;
  }

  generateComparisonChart(simulations) {
    const datasets = simulations.map((simulation, index) => ({
      label: `Simulation Set ${index + 1}`,
      data: simulation.map((result) => ({
        x: result.simulationNumber,
        y: result.gameTime,
      })),
      fill: false,
      borderColor: this.getRandomColor(),
      tension: 0.1,
    }));

    const ctx = document.getElementById(this.resultsChartId).getContext("2d");
    if (this.resultsChart) {
      this.resultsChart.destroy();
    }
    this.resultsChart = new Chart(ctx, {
      type: "line",
      data: {
        datasets: datasets,
      },
      options: {
        scales: {
          x: {
            type: "linear",
            position: "bottom",
            title: {
              display: true,
              text: "Simulation Number",
            },
          },
          y: {
            title: {
              display: true,
              text: "Game Time",
            },
          },
        },
      },
    });
  }

  getRandomColor() {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }
}

export default SimulationChart;
