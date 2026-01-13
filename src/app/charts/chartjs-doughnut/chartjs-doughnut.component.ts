import { Component } from '@angular/core';
import * as chartData from './chartjs';
import { SpkChartjsComponent } from '../../@spk/reusable-charts/spk-chartjs/spk-chartjs.component';

@Component({
  selector: 'app-chartjs-doughnut',
  standalone: true,
  imports: [SpkChartjsComponent],
  templateUrl: './chartjs-doughnut.component.html',
  styleUrl: './chartjs-doughnut.component.scss',
})
export class ChartjsDoughnutComponent {
  PieChartData = chartData.PieChartData;
  PieChartOptions = chartData.PieChartOptions;
  DoughnutChartType = chartData.DoughnutChartType;
}
