import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  Filler,
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Filler,
  Title,
  Tooltip,
  Legend
);

export function ProduccionChart({ data = [], type = 'bar' }) {
  // Aggregate data by crop or by date
  const grouped = data.reduce((acc, item) => {
    const cultivo = item.cultivo?.nombre || item.idCultivo || 'Sin cultivo';
    const tons = (item.cantidadKg || 0) / 1000;
    acc[cultivo] = (acc[cultivo] || 0) + tons;
    return acc;
  }, {});

  const labels = Object.keys(grouped).length > 0 ? Object.keys(grouped) : ['Mandarina', 'Palta', 'Arándano', 'Caqui'];
  const values = Object.keys(grouped).length > 0 ? Object.values(grouped) : [12.5, 18.2, 8.4, 15.1];

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Producción Cosechada (Toneladas)',
        data: values,
        backgroundColor: [
          'rgba(46, 125, 50, 0.8)',
          'rgba(102, 187, 106, 0.8)',
          'rgba(25, 118, 210, 0.8)',
          'rgba(245, 124, 0, 0.8)',
          'rgba(142, 36, 170, 0.8)',
        ],
        borderColor: [
          '#1b5e20',
          '#2e7d32',
          '#1565c0',
          '#e65100',
          '#6a1b9a',
        ],
        borderWidth: 2,
        borderRadius: 8,
        tension: 0.35,
        fill: true,
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
        backgroundColor: '#1B2E1E',
        titleFont: { size: 13, family: 'Inter, sans-serif' },
        bodyFont: { size: 12, family: 'Inter, sans-serif' },
        padding: 10,
        cornerRadius: 8,
        callbacks: {
          label: (context) => ` ${context.parsed.y ?? context.parsed} t cosechadas`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#6B7280', font: { family: 'Inter, sans-serif' } },
      },
      y: {
        grid: { color: 'rgba(0, 0, 0, 0.05)' },
        ticks: {
          color: '#6B7280',
          font: { family: 'Inter, sans-serif' },
          callback: (value) => `${value} t`,
        },
      },
    },
  };

  return (
    <div className="w-full h-64 md:h-72">
      {type === 'line' ? (
        <Line data={chartData} options={options} />
      ) : (
        <Bar data={chartData} options={options} />
      )}
    </div>
  );
}
