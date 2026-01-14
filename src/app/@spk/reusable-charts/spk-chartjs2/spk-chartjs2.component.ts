// src/app/@spk/reusable-charts/spk-chartjs/spk-chartjs.component.ts

import { Component, Input, ViewChild } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';

@Component({
  selector: 'spk-chartjs2',
  standalone: true,
  imports: [BaseChartDirective],
  templateUrl: './spk-chartjs2.component.html',
  styleUrl: './spk-chartjs2.component.scss'
})
export class SpkChartjs2Component {
  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;
  @Input('data') ChartData: any;
  @Input('options') ChartOptions: any;
  @Input('type') ChartType: any;
}
