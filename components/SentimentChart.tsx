import { useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const SentimentChart = ({ data, title, color }) => {
  const chartData = useMemo(() => ({
    labels: data.map(d => d.time),
    datasets: [
      {
        label: title,
        data: data.map(d => d.sentiment),
        borderColor: color,
        backgroundColor: color,
        fill: false,
      },
    ],
  }), [data, title, color]);

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: title,
      },
    },
    scales: {
      y: {
        min: -40,
        max: 40,
        ticks: {
          stepSize: 20,
        },
      },
    },
  };

  return <Line options={options} data={chartData} />;
};

export default SentimentChart;