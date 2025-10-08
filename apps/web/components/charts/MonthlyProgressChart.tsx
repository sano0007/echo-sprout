'use client';

import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from 'chart.js';
import React from 'react';
import { Line } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface MonthlyProgress {
  month: string;
  monthLabel: string;
  credits: number;
  co2Offset: number;
  cumulativeCO2: number;
}

interface MonthlyProgressChartProps {
  monthlyProgress: MonthlyProgress[];
  totalCO2Offset: number;
  className?: string;
  showCumulative?: boolean;
}

export default function MonthlyProgressChart({
  monthlyProgress,
  totalCO2Offset,
  className = '',
  showCumulative = true,
}: MonthlyProgressChartProps) {
  // Prepare data for Chart.js
  const labels = monthlyProgress.map((item) => item.monthLabel);

  const monthlyOffsetData = monthlyProgress.map((item) => item.co2Offset);
  const cumulativeOffsetData = monthlyProgress.map(
    (item) => item.cumulativeCO2
  );

  const datasets = [
    {
      label: 'Monthly CO₂ Offset',
      data: monthlyOffsetData,
      borderColor: '#10b981', // emerald-500
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      fill: true,
      tension: 0.4,
      pointBackgroundColor: '#10b981',
      pointBorderColor: '#ffffff',
      pointBorderWidth: 2,
      pointRadius: 4,
      pointHoverRadius: 6,
    },
  ];

  if (showCumulative) {
    datasets.push({
      label: 'Cumulative CO₂ Offset',
      data: cumulativeOffsetData,
      borderColor: '#3b82f6', // blue-500
      backgroundColor: 'rgba(59, 130, 246, 0.05)',
      fill: false,
      tension: 0.4,
      pointBackgroundColor: '#3b82f6',
      pointBorderColor: '#ffffff',
      pointBorderWidth: 2,
      pointRadius: 3,
      pointHoverRadius: 5,
    });
  }

  const data = {
    labels,
    datasets,
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
          },
        },
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
          title: function (context: any) {
            return context[0].label;
          },
          label: function (context: any) {
            const datasetLabel = context.dataset.label;
            const value = context.parsed.y;

            if (datasetLabel === 'Monthly CO₂ Offset') {
              return `${datasetLabel}: ${value.toFixed(1)} tons`;
            } else {
              return `${datasetLabel}: ${value.toFixed(1)} tons`;
            }
          },
          afterBody: function (context: any) {
            const monthIndex = context[0].dataIndex;
            const monthData = monthlyProgress[monthIndex];
            return [`Credits purchased: ${monthData?.credits}`];
          },
        },
      },
    },
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
    animation: {
      duration: 1200,
      easing: 'easeInOutQuart' as const,
    },
    elements: {
      line: {
        borderWidth: 2.5,
      },
      point: {
        hoverBorderWidth: 3,
      },
    },
  };

  // Show empty state if no data
  if (monthlyProgress.length === 0 || totalCO2Offset === 0) {
    return (
      <div
        className={`flex items-center justify-center h-64 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200 ${className}`}
      >
        <div className="text-center">
          <div className="text-4xl mb-2">📈</div>
          <p className="text-gray-500 font-medium">No CO₂ offset data yet</p>
          <p className="text-gray-400 text-sm">
            Start purchasing carbon credits to track your progress
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* Summary stats */}
      <div className="flex justify-between items-center mb-4 text-sm">
        <div className="flex space-x-6">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
            <span className="text-gray-600">Monthly Offset</span>
          </div>
          {showCumulative && (
            <div className="flex items-center space-x-2">
              <div
                className="w-3 h-1 bg-blue-500 rounded"
                style={{ borderStyle: 'dashed' }}
              ></div>
              <span className="text-gray-600">Cumulative Total</span>
            </div>
          )}
        </div>
        <div className="text-right">
          <span className="text-gray-600">Total: </span>
          <span className="font-semibold text-emerald-600">
            {totalCO2Offset.toFixed(1)} tons CO₂
          </span>
        </div>
      </div>

      {/* Chart */}
      <div className="h-64">
        <Line data={data} options={options} />
      </div>

      {/* Additional insights */}
      <div className="mt-4 grid grid-cols-3 gap-4 text-center text-xs">
        <div className="bg-emerald-50 p-2 rounded">
          <div className="font-medium text-emerald-700">Best Month</div>
          <div className="text-emerald-600">
            {
              monthlyProgress.reduce((best, current) =>
                current.co2Offset > best.co2Offset ? current : best
              ).monthLabel
            }
          </div>
        </div>
        <div className="bg-blue-50 p-2 rounded">
          <div className="font-medium text-blue-700">Avg Monthly</div>
          <div className="text-blue-600">
            {(
              totalCO2Offset /
              Math.max(monthlyProgress.filter((m) => m.co2Offset > 0).length, 1)
            ).toFixed(1)}{' '}
            tons
          </div>
        </div>
        <div className="bg-purple-50 p-2 rounded">
          <div className="font-medium text-purple-700">Active Months</div>
          <div className="text-purple-600">
            {monthlyProgress.filter((m) => m.co2Offset > 0).length} of{' '}
            {monthlyProgress.length}
          </div>
        </div>
      </div>
    </div>
  );
}

// Export a simplified version for smaller spaces
export function ProgressSummary({
  monthlyProgress,
  totalCO2Offset,
}: MonthlyProgressChartProps) {
  const activeMonths = monthlyProgress.filter((m) => m.co2Offset > 0).length;
  const avgMonthly = totalCO2Offset / Math.max(activeMonths, 1);
  const lastMonthOffset =
    monthlyProgress[monthlyProgress.length - 1]?.co2Offset || 0;

  return (
    <div className="grid grid-cols-1 gap-3">
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-600">Total CO₂ Offset</span>
        <span className="font-semibold text-emerald-600">
          {totalCO2Offset.toFixed(1)} tons
        </span>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-600">Monthly Average</span>
        <span className="font-medium text-blue-600">
          {avgMonthly.toFixed(1)} tons
        </span>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-600">This Month</span>
        <span className="font-medium text-purple-600">
          {lastMonthOffset.toFixed(1)} tons
        </span>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-600">Active Months</span>
        <span className="font-medium text-gray-700">{activeMonths}</span>
      </div>
    </div>
  );
}
