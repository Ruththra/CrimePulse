// src/components/ApexChart3D.tsx
import React from 'react';
import ReactApexChart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';

interface ApexChart3DProps {
  series?: number[];
  labels?: string[];
}

const ApexChart3D: React.FC<ApexChart3DProps> = ({
  series = [14, 23, 21, 17, 15],
  labels = ['Theft', 'Assault', 'Cybercrime', 'Missing Person', 'Other']
}) => {
  const options: ApexOptions = {
    chart: { type: 'polarArea', width: '100%', height: 400 },
    labels: labels,
    stroke: { colors: ['#fff'] },
    fill: { opacity: 0.8 },
    legend: {
      position: 'bottom',
      formatter: function(seriesName: string, opts: any) {
        return seriesName;
      }
    },
    tooltip: {
      y: {
        formatter: function(value: number, opts: any) {
          return `${value} complaint${value !== 1 ? 's' : ''}`;
        }
      }
    },
    plotOptions: {
      polarArea: {
        rings: {
          strokeWidth: 0
        },
        spokes: {
          strokeWidth: 0
        }
      }
    },
    responsive: [
      {
        breakpoint: 1024,
        options: { chart: { width: '100%', height: 300 }, legend: { position: 'bottom' } }
      },
      {
        breakpoint: 768,
        options: { chart: { width: '100%', height: 250 }, legend: { position: 'bottom' } }
      },
      {
        breakpoint: 480,
        options: { chart: { width: '100%', height: 200 }, legend: { position: 'bottom' } }
      }
    ]
  };

  return <ReactApexChart options={options} series={series} type="polarArea" height={400} width="100%" />;
};

export default ApexChart3D;
