// src/app/charts/chartjs.ts  (for example)

import { ChartConfiguration, ChartType } from 'chart.js';

export let PieChartData: ChartConfiguration['data'] = {
  datasets: [
    {
      data: [20, 20, 30, 5, 25],
      backgroundColor: ['#6259ca', '#53caed', '#01b8ff', '#f16d75', '#29ccbb'],
    },
  ],
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
};

export let PieChartOptions: ChartConfiguration['options'] = {
  maintainAspectRatio: false,
  responsive: true,
  plugins: {
    legend: {
      display: true,
      position: 'top',
    },
  },
};

export let DoughnutChartType: ChartType = 'doughnut';
