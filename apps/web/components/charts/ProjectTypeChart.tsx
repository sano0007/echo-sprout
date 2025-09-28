'use client';

import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface ProjectTypeChartProps {
  projectTypes: Record<string, number>;
  className?: string;
}

const PROJECT_TYPE_COLORS = {
  reforestation: '#22c55e',
  solar: '#f59e0b',
  wind: '#3b82f6',
  biogas: '#8b5cf6',
  waste_management: '#ef4444',
  mangrove_restoration: '#06b6d4',
};

const PROJECT_TYPE_LABELS = {
  reforestation: 'Reforestation',
  solar: 'Solar Energy',
  wind: 'Wind Power',
  biogas: 'Biogas',
  waste_management: 'Waste Management',
  mangrove_restoration: 'Mangrove Restoration',
};

export default function ProjectTypeChart({ projectTypes, className = '' }: ProjectTypeChartProps) {
  // Transform data for Chart.js
  const labels = Object.keys(projectTypes).map(
    (type) => PROJECT_TYPE_LABELS[type as keyof typeof PROJECT_TYPE_LABELS] || type
  );

  const dataValues = Object.values(projectTypes);

  const backgroundColors = Object.keys(projectTypes).map(
    (type) => PROJECT_TYPE_COLORS[type as keyof typeof PROJECT_TYPE_COLORS] || '#6b7280'
  );

  const data = {
    labels,
    datasets: [
      {
        label: 'Projects Purchased',
        data: dataValues,
        backgroundColor: backgroundColors,
        borderColor: backgroundColors.map(color => color),
        borderWidth: 1,
        borderRadius: 6,
        borderSkipped: false,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, // Hide legend since colors are self-explanatory
      },
      title: {
        display: false, // We'll handle title outside the chart
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: function(context: any) {
            const value = context.parsed.y;
            const total = dataValues.reduce((sum, val) => sum + val, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${value} projects (${percentage}%)`;
          }
        }
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#6b7280',
          font: {
            size: 12,
          },
          maxRotation: 45,
          minRotation: 0,
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(107, 114, 128, 0.1)',
        },
        ticks: {
          color: '#6b7280',
          font: {
            size: 12,
          },
          stepSize: 1, // Ensure integer steps for project counts
        },
      },
    },
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
    animation: {
      duration: 1000,
      easing: 'easeInOutQuart' as const,
    },
  };

  // Show empty state if no data
  if (Object.keys(projectTypes).length === 0) {
    return (
      <div className={`flex items-center justify-center h-64 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200 ${className}`}>
        <div className="text-center">
          <div className="text-4xl mb-2">📊</div>
          <p className="text-gray-500 font-medium">No project data yet</p>
          <p className="text-gray-400 text-sm">Start purchasing carbon credits to see distribution</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative h-64 ${className}`}>
      <Bar data={data} options={options} />
    </div>
  );
}

// Export a summary component for smaller spaces
export function ProjectTypeSummary({ projectTypes, className = '' }: ProjectTypeChartProps) {
  const total = Object.values(projectTypes).reduce((sum, val) => sum + val, 0);

  if (total === 0) {
    return (
      <div className={`text-center py-4 ${className}`}>
        <p className="text-gray-500">No projects purchased yet</p>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {Object.entries(projectTypes)
        .sort(([,a], [,b]) => b - a) // Sort by count descending
        .map(([type, count]) => {
          const percentage = ((count / total) * 100).toFixed(0);
          const label = PROJECT_TYPE_LABELS[type as keyof typeof PROJECT_TYPE_LABELS] || type;
          const color = PROJECT_TYPE_COLORS[type as keyof typeof PROJECT_TYPE_COLORS] || '#6b7280';

          return (
            <div key={type} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: color }}
                />
                <span className="text-sm font-medium text-gray-700 capitalize">
                  {label}
                </span>
              </div>
              <div className="text-right">
                <span className="text-sm font-semibold text-gray-900">{count}</span>
                <span className="text-xs text-gray-500 ml-1">({percentage}%)</span>
              </div>
            </div>
          );
        })}
    </div>
  );
}