import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  Chart,
  ChartConfiguration,
  ChartType,
  registerables,
} from 'chart.js';

// register all default chart.js controllers/parts
Chart.register(...registerables);

@Component({
  selector: 'spk-chartjs',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './spk-chartjs.component.html',
  styleUrls: ['./spk-chartjs.component.scss'],
})
export class SpkChartjsComponent
  implements AfterViewInit, OnChanges, OnDestroy
{
  /** id for the canvas (optional, just for debugging) */
  @Input() id = '';

  /** chart type, e.g. 'line' | 'bar' | 'doughnut' | 'pie' | ... */
  @Input() type: ChartType = 'bar';

  /** chart data (labels + datasets) */
  @Input() data!: ChartConfiguration['data'];

  /** chart options (axes, legend, etc.) */
  @Input() options?: ChartConfiguration['options'];

  @ViewChild('canvas', { static: false })
  canvasRef!: ElementRef<HTMLCanvasElement>;

  private chart?: Chart;

  // create chart when the view is ready
  ngAfterViewInit(): void {
    this.createChart();
  }

  // update chart when inputs change
  ngOnChanges(changes: SimpleChanges): void {
    if (!this.chart) return;

    if (changes['data'] || changes['type'] || changes['options']) {
      this.updateChart();
    }
  }

  private createChart(): void {
    if (!this.canvasRef) return;

    const ctx = this.canvasRef.nativeElement.getContext('2d');
    if (!ctx) return;

    if (this.chart) {
      this.chart.destroy();
    }

    this.chart = new Chart(ctx, {
      type: this.type,
      data: this.data,
      options: this.options,
    });
  }

  private updateChart(): void {
    if (!this.chart) {
      this.createChart();
      return;
    }

    this.chart.config.type = this.type;
    this.chart.data = this.data;
    this.chart.options = this.options;
    this.chart.update();
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }
}
