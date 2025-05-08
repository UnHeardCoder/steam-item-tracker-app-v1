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
  Legend,
  ChartOptions
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

  const options: ChartOptions<'line' | 'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
        labels: {
          color: 'rgb(156, 163, 175)', // text-gray-400
        },
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          label: function(context) {
            return `CAD$ ${context.parsed.y.toFixed(2)}`;
          }
        }
      },
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(75, 85, 99, 0.2)', // gray-600 with opacity
        },
        ticks: {
          color: 'rgb(156, 163, 175)', // text-gray-400
        },
      },
      y: {
        grid: {
          color: 'rgba(75, 85, 99, 0.2)', // gray-600 with opacity
        },
        ticks: {
          color: 'rgb(156, 163, 175)', // text-gray-400
          callback: function(value) {
            return `CAD$ ${value}`;
          }
        },
      },
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    },
  };

  return (
    <div className="h-full w-full">
      {data.length > 0 ? (
        chartType === 'line' ? (
          <Line data={chartData} options={options} />
        ) : (
          <Bar data={chartData} options={options} />
        )
      ) : (
        <div className="h-full flex items-center justify-center text-gray-500">
          No price history data available
        </div>
      )}
    </div>
  );
} 