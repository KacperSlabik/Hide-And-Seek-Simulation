class SimulationChart {
  constructor(resultsChartId, pointsChartId, hiderTimesChartId) {
    this.resultsChartId = resultsChartId;
    this.pointsChartId = pointsChartId;
    this.hiderTimesChartId = hiderTimesChartId;
    this.resultsChart = null;
    this.pointsChart = null;
    this.hiderTimesChart = null;
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

  generatePointsChart(pointsResults) {
    const datasets = pointsResults.map((pointsResult, index) => ({
      label: `Simulation Set ${index + 1}`,
      data: pointsResult.map((result) => ({
        x: result.simulationNumber,
        y: result.pointsCollected,
      })),
      fill: false,
      borderColor: this.getRandomColor(),
      tension: 0.1,
    }));

    const ctx = document.getElementById(this.pointsChartId).getContext("2d");
    if (this.pointsChart) {
      this.pointsChart.destroy();
    }
    this.pointsChart = new Chart(ctx, {
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
              text: "Points Collected",
            },
          },
        },
      },
    });
  }

  generateHiderTimesChart(hiderTimesResults) {
    const datasets = hiderTimesResults.map((hiderTimesResult, index) => {
      const data = hiderTimesResult.map((result) => ({
        x: result.simulationNumber,
        y: result.hiderTimes.length, 
      }));

      return {
        label: `Simulation Set ${index + 1}`,
        data: data,
        fill: false,
        borderColor: this.getRandomColor(),
        tension: 0.1,
      };
    });

    const ctx = document
      .getElementById(this.hiderTimesChartId)
      .getContext("2d");
    if (this.hiderTimesChart) {
      this.hiderTimesChart.destroy();
    }
    this.hiderTimesChart = new Chart(ctx, {
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
              text: "Number of Hiders Found",
            },
            beginAtZero: true,
            ticks: {
              stepSize: 1,
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
