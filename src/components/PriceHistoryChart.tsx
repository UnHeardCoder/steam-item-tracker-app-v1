'use client';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface PriceHistoryData {
  recordedAt: Date;
  price: number;
}

interface PriceHistoryChartProps {
  data: PriceHistoryData[];
  chartType?: 'line' | 'bar';
}

export default function PriceHistoryChart({ data, chartType = 'line' }: PriceHistoryChartProps) {
  // Sort data by date
  const sortedData = [...data].sort((a, b) => 
    new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime()
  );

  const chartData = {
    labels: sortedData.map(item => 
      new Date(item.recordedAt).toLocaleDateString('en-CA', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    ),
    datasets: [
      {
        label: 'Price (CAD$)',
        data: sortedData.map(item => item.price),
        borderColor: 'rgb(99, 102, 241)', // Indigo color
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        tension: 0.4,
        fill: chartType === 'line',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        backgroundColor: 'rgba(17, 24, 39, 0.9)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(75, 85, 99, 1)',
        borderWidth: 1,
        padding: 10,
        displayColors: false,
        callbacks: {
          label: function(context: import('chart.js').TooltipItem<'line'> | import('chart.js').TooltipItem<'bar'>) {
            return `Price: CAD$ ${context.parsed.y.toFixed(2)}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(75, 85, 99, 0.2)',
        },
        ticks: {
          color: '#9CA3AF',
          maxRotation: 45,
          minRotation: 45,
          font: {
            size: 10
          }
        }
      },
      y: {
        grid: {
          color: 'rgba(75, 85, 99, 0.2)',
        },
        ticks: {
          color: '#9CA3AF',
          font: {
            size: 10
          },
          callback: function(tickValue: string | number) {
            const num = typeof tickValue === 'number' ? tickValue : parseFloat(tickValue);
            return 'CAD$ ' + (isNaN(num) ? tickValue : num.toFixed(2));
          }
        }
      }
    },
    interaction: {
      mode: 'nearest' as const,
      axis: 'x' as const,
      intersect: false
    },
    elements: {
      line: {
        tension: 0.4
      },
      point: {
        radius: 2,
        hitRadius: 10,
        hoverRadius: 4
      }
    }
  };

  return (
    <div className="h-full w-full relative">
      {data.length > 0 ? (
        chartType === 'line' ? (
          <Line data={chartData} options={options} />
        ) : (
          <Bar data={chartData} options={options} />
        )
      ) : (
        <div className="h-full flex items-center justify-center text-gray-500 text-sm">
          No price history data available
        </div>
      )}
    </div>
  );
} 