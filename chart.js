class SimulationChart {
  constructor(canvasId, hiderCanvasId) {
    this.canvasId = canvasId;
    this.hiderCanvasId = hiderCanvasId;
    this.chart = null;
    this.hiderChart = null;
  }

  generateChart(simulationResults) {
    const gameTimes = simulationResults.map((result) => result.gameTime);
    const cumulativeTimes = [];
    let cumulativeTime = 0;

    gameTimes.forEach((time) => {
      cumulativeTime += time;
      cumulativeTimes.push(cumulativeTime);
    });

    const ctx = document.getElementById(this.canvasId).getContext("2d");

    const data = {
      labels: cumulativeTimes,
      datasets: [
        {
          label: "Game Time",
          data: gameTimes,
          borderColor: "rgba(75, 192, 192, 1)",
          backgroundColor: "rgba(75, 192, 192, 0.2)",
          fill: false,
        },
      ],
    };

    if (this.chart) {
      this.chart.destroy();
    }

    this.chart = new Chart(ctx, {
      type: "line",
      data: data,
      options: {
        responsive: true,
        scales: {
          x: {
            display: true,
            title: {
              display: true,
              text: "Cumulative Time (s)",
            },
          },
          y: {
            display: true,
            title: {
              display: true,
              text: "Game Time (s)",
            },
          },
        },
      },
    });
  }

  generateHiderChart(simulationResults) {
    const datasets = simulationResults.map((result, index) => {
      const hiderData = result.hiderTimes.map((time, hiderIndex) => {
        return {
          x: time,
          y: hiderIndex + 1,
        };
      });

      const color = `hsl(${
        (index * 360) / simulationResults.length
      }, 100%, 50%)`;

      return {
        label: `Simulation ${index + 1}`,
        data: hiderData,
        borderColor: color,
        backgroundColor: color,
        fill: false,
        showLine: true,
        tension: 0.1,
      };
    });

    const ctx = document.getElementById(this.hiderCanvasId).getContext("2d");

    const data = {
      datasets: datasets,
    };

    if (this.hiderChart) {
      this.hiderChart.destroy();
    }

    this.hiderChart = new Chart(ctx, {
      type: "line",
      data: data,
      options: {
        responsive: true,
        scales: {
          x: {
            display: true,
            title: {
              display: true,
              text: "Game Time (s)",
            },
            type: "linear",
            position: "bottom",
          },
          y: {
            display: true,
            title: {
              display: true,
              text: "Hiders Found",
            },
          },
        },
      },
    });
  }
}

export default SimulationChart;
