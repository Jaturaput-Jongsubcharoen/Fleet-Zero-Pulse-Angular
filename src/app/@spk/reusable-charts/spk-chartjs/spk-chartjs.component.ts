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

import ChartDataLabels from 'chartjs-plugin-datalabels';

Chart.register(ChartDataLabels);

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

  private chart: Chart | null = null;

  ngAfterViewInit(): void {
    this.createChart();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.canvasRef) return;

    if (changes['data'] || changes['type'] || changes['options']) {
      this.rebuildChart();
    }
  }

  private createChart(): void {
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    this.chart = new Chart(ctx, {
      type: this.type,
      data: this.data,
      options: this.options,
    } as ChartConfiguration);
  }

  private rebuildChart(): void {
    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }
    this.createChart();
  }

  ngOnDestroy(): void {
    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }
  }
}
