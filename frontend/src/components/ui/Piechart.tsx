import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import React from 'react';

// Import the 3D module as a function and call it with Highcharts
import Highcharts3D from 'highcharts/highcharts-3d';
((Highcharts3D as unknown) as (hc: typeof Highcharts) => void)(Highcharts);

interface Piechart3DProps {
  high: number;
  medium: number;
  low: number;
}

const Piechart3D: React.FC<Piechart3DProps> = ({ high, medium, low }) => {
  const total = high + medium + low;

  const options: Highcharts.Options = {
    chart: {
      type: 'pie',
      options3d: {
        enabled: true,
        alpha: 45,
        beta: 0
      },
      backgroundColor: 'transparent',
      height: 400,
    },
    title: { text: '' },
    plotOptions: {
      pie: {
        innerSize: 80,
        depth: 45,
        dataLabels: {
          enabled: true,
          format: '{point.name}: {point.y} ({point.percentage:.1f}%)',
          style: { color: '#fff', textOutline: 'none', fontWeight: 'bold' }
        }
      }
    },
    series: [{
      type: 'pie',
      name: 'Complaints',
      data: [
        { name: 'High Priority', y: high, color: '#ef4444' },
        { name: 'Medium Priority', y: medium, color: '#facc15' },
        { name: 'Low Priority', y: low, color: '#22c55e' }
      ]
    }],
    credits: { enabled: false },
    legend: {
      itemStyle: { color: '#fff', fontWeight: 'bold' }
    }
  };

  return (
    <div style={{ background: 'rgba(30,41,59,0.8)', borderRadius: 20, padding: 16 }}>
      <HighchartsReact highcharts={Highcharts} options={options} />
    </div>
  );
};

export default Piechart3D;