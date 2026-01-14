import { Component } from '@angular/core';
import * as chartData from './chartjs';
import { SpkChartjs2Component } from '../../@spk/reusable-charts/spk-chartjs2/spk-chartjs2.component';

@Component({
  selector: 'app-chartjs-doughnut',
  standalone: true,
  imports: [SpkChartjs2Component],
  templateUrl: './chartjs-doughnut.component.html',
  styleUrl: './chartjs-doughnut.component.scss',
})
export class ChartjsDoughnutComponent {
  PieChartData = chartData.PieChartData;
  PieChartOptions = chartData.PieChartOptions;
  DoughnutChartType = chartData.DoughnutChartType;
}
