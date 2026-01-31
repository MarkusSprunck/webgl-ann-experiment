/**
 * RME Chart Manager - Simplified
 * Displays Root Mean Square Error during training
 */

declare const Chart: any;

export class RMEChart {
  private chart: any;
  private canvasId: string;
  private container: HTMLElement | null;

  constructor(canvasId: string = 'rmeChart', containerId: string = 'rmeGraphContainer') {
    this.canvasId = canvasId;
    this.container = document.getElementById(containerId);

    // Initialize chart immediately if Chart.js is available
    if (typeof Chart !== 'undefined') {
      this.initializeChart();
    } else {
      // Wait briefly for Chart.js to load
      setTimeout(() => this.initializeChart(), 200);
    }
  }

  private initializeChart(): void {
    if (typeof Chart === 'undefined') {
      console.warn('Chart.js not loaded');
      return;
    }

    const canvas = document.getElementById(this.canvasId) as HTMLCanvasElement;
    if (!canvas) {
      console.error('Canvas element not found:', this.canvasId);
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('Cannot get 2D context');
      return;
    }

    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: [],
        datasets: [{
          label: 'Training RMS',
          data: [],
          borderColor: '#4CAF50',
          backgroundColor: 'rgba(76, 175, 80, 0.1)',
          borderWidth: 2,
          tension: 0.4,
          pointRadius: 0,
          fill: true
        }, {
          label: 'Test RMS',
          data: [],
          borderColor: '#2196F3',
          backgroundColor: 'rgba(33, 150, 243, 0.1)',
          borderWidth: 2,
          tension: 0.4,
          pointRadius: 0,
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        scales: {
          x: {
            title: { display: true, text: 'Iteration' },
            ticks: { maxTicksLimit: 10 }
          },
          y: {
            title: { display: true, text: 'RMS Error' },
            beginAtZero: true
          }
        },
        plugins: {
          legend: {
            display: true,
            position: 'top'
          }
        }
      }
    });
  }

  public addDataPoint(iteration: number, trainRme: number, testRme?: number): void {
    if (!this.chart) return;

    this.chart.data.labels.push(iteration.toString());
    this.chart.data.datasets[0].data.push(trainRme);
    if (testRme !== undefined) {
      this.chart.data.datasets[1].data.push(testRme);
    }
    this.chart.update('none');
  }

  public reset(): void {
    if (this.chart) {
      this.chart.data.labels = [];
      this.chart.data.datasets[0].data = [];
      this.chart.data.datasets[1].data = [];
      this.chart.update('none');
    }
    this.hide();
  }

  public show(): void {
    if (this.container) {
      this.container.style.display = 'block';
    }
  }

  public hide(): void {
    if (this.container) {
      this.container.style.display = 'none';
    }
  }
}

