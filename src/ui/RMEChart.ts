/**
 * RME Chart Manager
 * Displays Root Mean Square Error during training
 */

declare const Chart: any;

export class RMEChart {
  private chart: any;
  private rmeData: number[] = [];
  private epochData: number[] = [];
  private maxDataPoints: number = Infinity; // Show all data points
  private canvasId: string;
  private container: HTMLElement | null;

  constructor(canvasId: string = 'rmeChart', containerId: string = 'rmeGraphContainer') {
    this.canvasId = canvasId;
    this.container = document.getElementById(containerId);

    // Wait for Chart.js to be available
    this.waitForChartJS().then(() => {
      this.initializeChart();
    });
  }

  private async waitForChartJS(): Promise<void> {
    let attempts = 0;
    const maxAttempts = 50;

    while (typeof Chart === 'undefined' && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 100));
      attempts++;
    }

    if (typeof Chart === 'undefined') {
      console.warn('Chart.js not loaded after timeout');
    }
  }

  private initializeChart(): void {
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

    try {
      this.chart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: [],
          datasets: [{
            label: 'RMS Error',
            data: [],
            borderColor: '#4CAF50',
            backgroundColor: 'rgba(76, 175, 80, 0.1)',
            borderWidth: 2,
            tension: 0.4,
            pointRadius: 1,
            pointHoverRadius: 4,
            fill: true
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: {
            duration: 0 // Disable animations for better performance
          },
          scales: {
            x: {
              title: {
                display: true,
                text: 'Iteration',
                color: '#666',
                font: { size: 11 }
              },
              ticks: {
                color: '#666',
                font: { size: 10 },
                maxTicksLimit: 10, // Show up to 10 x-axis labels
                autoSkip: true,
                autoSkipPadding: 10
              },
              grid: {
                color: 'rgba(0,0,0,0.05)'
              }
            },
            y: {
              title: {
                display: true,
                text: 'RMS Error',
                color: '#666',
                font: { size: 11 }
              },
              beginAtZero: true,
              ticks: {
                color: '#666',
                font: { size: 10 }
              },
              grid: {
                color: 'rgba(0,0,0,0.1)'
              }
            }
          },
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              backgroundColor: 'rgba(0,0,0,0.8)',
              padding: 8,
              titleFont: { size: 11 },
              bodyFont: { size: 10 },
              callbacks: {
                label: (context: any) => {
                  return `RMS: ${context.parsed.y.toFixed(6)}`;
                }
              }
            }
          }
        }
      });

      console.log('RME Chart initialized successfully');
    } catch (e) {
      console.error('Failed to initialize chart:', e);
    }
  }

  public addDataPoint(iteration: number, rme: number): void {
    if (!this.chart) {
      console.warn('Chart not initialized yet');
      return;
    }

    this.epochData.push(iteration);
    this.rmeData.push(rme);

    // Keep all data points - no limit
    // This shows complete training history from first iteration

    // Update chart data
    this.chart.data.labels = this.epochData.map(e => e.toString());
    this.chart.data.datasets[0].data = this.rmeData;
    this.chart.update('none'); // Update without animation

    // Show container if hidden
    if (this.container && this.container.style.display === 'none') {
      this.container.style.display = 'block';
    }
  }

  public reset(): void {
    this.rmeData = [];
    this.epochData = [];

    if (this.chart) {
      this.chart.data.labels = [];
      this.chart.data.datasets[0].data = [];
      this.chart.update('none');
    }

    // Hide container
    if (this.container) {
      this.container.style.display = 'none';
    }
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

  public destroy(): void {
    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }
  }

  public getLatestRME(): number | null {
    return this.rmeData.length > 0 ? this.rmeData[this.rmeData.length - 1] : null;
  }
}
