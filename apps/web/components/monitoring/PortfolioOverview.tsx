'use client';

import {
  Calendar,
  PieChart,
  Download,
  Eye,
  Filter,
  Globe,
  List,
  Grid3X3,
} from 'lucide-react';
import { useMemo, useState } from 'react';

interface CreditPurchase {
  id: string;
  projectId: string;
  projectName: string;
  projectType: string;
  creditsQuantity: number;
  totalAmount: number;
  purchaseDate: string;
  certificateUrl?: string;
  status: 'active' | 'retired' | 'transferred';
  currentImpact: {
    carbonOffset: number;
    treesPlanted?: number;
    energyGenerated?: number;
    wasteProcessed?: number;
  };
  projectProgress: number;
  lastUpdate: string;
  location: {
    country: string;
    region: string;
  };
  verificationStatus: 'verified' | 'pending' | 'unverified';
}

interface PortfolioStats {
  totalCredits: number;
  totalSpent: number;
  totalCarbonOffset: number;
  activeProjects: number;
  averageProgress: number;
  portfolioValue: number;
}

interface PortfolioOverviewProps {
  purchases: CreditPurchase[];
  stats: PortfolioStats;
  onViewProject: (projectId: string) => void;
  onDownloadCertificate: (purchaseId: string) => void;
  onGenerateReport: (filters?: any) => void;
}

export default function PortfolioOverview({
  purchases,
  stats,
  onViewProject,
  onDownloadCertificate,
  onGenerateReport,
}: PortfolioOverviewProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterBy, setFilterBy] = useState<'all' | 'active' | 'retired'>('all');
  const [sortBy, setSortBy] = useState<
    'date' | 'amount' | 'progress' | 'impact'
  >('date');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<'30d' | '90d' | '1y' | 'all'>(
    'all'
  );

  // Filter and sort purchases
  const filteredPurchases = useMemo(() => {
    let filtered = purchases;

    // Filter by status
    if (filterBy !== 'all') {
      filtered = filtered.filter((purchase) => purchase.status === filterBy);
    }

    // Filter by project type
    if (selectedType !== 'all') {
      filtered = filtered.filter(
        (purchase) => purchase.projectType === selectedType
      );
    }

    // Filter by time range
    if (timeRange !== 'all') {
      const now = new Date();
      const daysAgo = {
        '30d': 30,
        '90d': 90,
        '1y': 365,
      }[timeRange];

      const cutoffDate = new Date(
        now.getTime() - daysAgo * 24 * 60 * 60 * 1000
      );
      filtered = filtered.filter(
        (purchase) => new Date(purchase.purchaseDate) >= cutoffDate
      );
    }

    // Sort purchases
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'amount':
          return b.totalAmount - a.totalAmount;
        case 'progress':
          return b.projectProgress - a.projectProgress;
        case 'impact':
          return b.currentImpact.carbonOffset - a.currentImpact.carbonOffset;
        case 'date':
        default:
          return (
            new Date(b.purchaseDate).getTime() -
            new Date(a.purchaseDate).getTime()
          );
      }
    });

    return filtered;
  }, [purchases, filterBy, selectedType, timeRange, sortBy]);

  // Calculate portfolio breakdown
  const portfolioBreakdown = useMemo(() => {
    const typeMap = new Map<
      string,
      { count: number; credits: number; amount: number; impact: number }
    >();

    purchases.forEach((purchase) => {
      const existing = typeMap.get(purchase.projectType) || {
        count: 0,
        credits: 0,
        amount: 0,
        impact: 0,
      };
      typeMap.set(purchase.projectType, {
        count: existing.count + 1,
        credits: existing.credits + purchase.creditsQuantity,
        amount: existing.amount + purchase.totalAmount,
        impact: existing.impact + purchase.currentImpact.carbonOffset,
      });
    });

    return Array.from(typeMap.entries()).map(([type, data]) => ({
      type,
      ...data,
      percentage: (data.amount / stats.totalSpent) * 100,
    }));
  }, [purchases, stats.totalSpent]);

  const getProjectTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      reforestation: '🌳',
      solar: '☀️',
      wind: '💨',
      biogas: '🔥',
      waste_management: '♻️',
      mangrove_restoration: '🌊',
    };
    return icons[type] || '🌱';
  };

  const getProjectTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      reforestation: 'from-green-500 to-green-600',
      solar: 'from-yellow-500 to-yellow-600',
      wind: 'from-blue-500 to-blue-600',
      biogas: 'from-orange-500 to-orange-600',
      waste_management: 'from-purple-500 to-purple-600',
      mangrove_restoration: 'from-teal-500 to-teal-600',
    };
    return colors[type] || 'from-gray-500 to-gray-600';
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      active: 'bg-green-100 text-green-800',
      retired: 'bg-gray-100 text-gray-800',
      transferred: 'bg-blue-100 text-blue-800',
    };
    return styles[status] || 'bg-gray-100 text-gray-800';
  };

  const getVerificationBadge = (status: string) => {
    const styles: Record<string, string> = {
      verified: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      unverified: 'bg-red-100 text-red-800',
    };
    return styles[status] || 'bg-gray-100 text-gray-800';
  };

  const uniqueProjectTypes = [...new Set(purchases.map((p) => p.projectType))];

  return (
    <div className="space-y-6">
      {/* Portfolio Summary */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold">Carbon Credit Portfolio</h1>
            <p className="text-blue-100 mt-1">
              Track your environmental impact investments
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">
              {stats.totalCredits.toLocaleString()}
            </div>
            <div className="text-blue-100 text-sm">Total Credits</div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold">
              {stats.totalCarbonOffset.toFixed(1)}
            </div>
            <div className="text-blue-100 text-sm">Tons CO2 Offset</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">
              ${stats.totalSpent.toLocaleString()}
            </div>
            <div className="text-blue-100 text-sm">Total Invested</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{stats.activeProjects}</div>
            <div className="text-blue-100 text-sm">Active Projects</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">
              {stats.averageProgress.toFixed(0)}%
            </div>
            <div className="text-blue-100 text-sm">Avg Progress</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">
              ${stats.portfolioValue.toLocaleString()}
            </div>
            <div className="text-blue-100 text-sm">Portfolio Value</div>
          </div>
        </div>
      </div>

      {/* Portfolio Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Project Type Breakdown */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Portfolio Breakdown by Type
          </h3>
          <div className="space-y-4">
            {portfolioBreakdown.map((item) => (
              <div
                key={item.type}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-4">
                  <div
                    className={`w-12 h-12 rounded-full bg-gradient-to-r ${getProjectTypeColor(item.type)} flex items-center justify-center text-white text-xl`}
                  >
                    {getProjectTypeIcon(item.type)}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800 capitalize">
                      {item.type.replace('_', ' ')}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {item.count} projects • {item.credits.toLocaleString()}{' '}
                      credits
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-gray-800">
                    ${item.amount.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">
                    {item.percentage.toFixed(1)}% of portfolio
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Impact Summary */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Environmental Impact
          </h3>
          <div className="space-y-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <Globe className="h-12 w-12 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-600">
                {stats.totalCarbonOffset.toFixed(1)}
              </div>
              <div className="text-sm text-green-700">Tons CO2 Offset</div>
              <div className="text-xs text-green-600 mt-1">
                Equivalent to {Math.floor(stats.totalCarbonOffset * 2.5)} trees
                planted
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-lg font-bold text-blue-600">
                  {Math.floor(stats.totalCarbonOffset * 0.5)}
                </div>
                <div className="text-xs text-blue-700">
                  Cars off road (1 year)
                </div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="text-lg font-bold text-purple-600">
                  {Math.floor(stats.totalCarbonOffset * 120)}
                </div>
                <div className="text-xs text-purple-700">
                  Homes powered (1 month)
                </div>
              </div>
            </div>

            <button
              onClick={() => onGenerateReport()}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center space-x-2"
            >
              <Download className="h-5 w-5" />
              <span>Impact Report</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="retired">Retired</option>
              </select>
            </div>

            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              {uniqueProjectTypes.map((type) => (
                <option key={type} value={type}>
                  {type.replace('_', ' ').toUpperCase()}
                </option>
              ))}
            </select>

            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Time</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="date">Sort by Date</option>
              <option value="amount">Sort by Amount</option>
              <option value="progress">Sort by Progress</option>
              <option value="impact">Sort by Impact</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <Grid3X3 className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <List className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Purchases List/Grid */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPurchases.map((purchase) => (
            <div
              key={purchase.id}
              className="bg-white rounded-lg shadow-lg overflow-hidden"
            >
              {/* Project Header */}
              <div
                className={`bg-gradient-to-r ${getProjectTypeColor(purchase.projectType)} text-white p-4`}
              >
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">
                    {getProjectTypeIcon(purchase.projectType)}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold truncate">
                      {purchase.projectName}
                    </h3>
                    <p className="text-sm opacity-90">
                      {purchase.location.country}, {purchase.location.region}
                    </p>
                  </div>
                </div>
              </div>

              {/* Purchase Details */}
              <div className="p-4">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="text-xs font-medium text-gray-600">
                      Credits
                    </label>
                    <div className="text-lg font-bold text-gray-800">
                      {purchase.creditsQuantity.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600">
                      Amount
                    </label>
                    <div className="text-lg font-bold text-gray-800">
                      ${purchase.totalAmount.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600">
                      CO2 Offset
                    </label>
                    <div className="text-lg font-bold text-green-600">
                      {purchase.currentImpact.carbonOffset.toFixed(1)}t
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600">
                      Progress
                    </label>
                    <div className="text-lg font-bold text-blue-600">
                      {purchase.projectProgress}%
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${purchase.projectProgress}%` }}
                    />
                  </div>
                </div>

                {/* Status Badges */}
                <div className="flex justify-between items-center mb-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(purchase.status)}`}
                  >
                    {purchase.status.toUpperCase()}
                  </span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getVerificationBadge(purchase.verificationStatus)}`}
                  >
                    {purchase.verificationStatus.toUpperCase()}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => onViewProject(purchase.projectId)}
                    className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 flex items-center justify-center space-x-1"
                  >
                    <Eye className="h-4 w-4" />
                    <span>View</span>
                  </button>
                  {purchase.certificateUrl && (
                    <button
                      onClick={() => onDownloadCertificate(purchase.id)}
                      className="px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {/* Purchase Date */}
                <div className="flex items-center text-xs text-gray-500 mt-3">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>
                    Purchased{' '}
                    {new Date(purchase.purchaseDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Project
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Credits
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Impact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Progress
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredPurchases.map((purchase) => (
                  <tr key={purchase.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="text-xl">
                          {getProjectTypeIcon(purchase.projectType)}
                        </div>
                        <div>
                          <div className="font-medium text-gray-800">
                            {purchase.projectName}
                          </div>
                          <div className="text-sm text-gray-600">
                            {purchase.location.country},{' '}
                            {purchase.location.region}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-800">
                      {purchase.creditsQuantity.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-800">
                      ${purchase.totalAmount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-green-600 font-medium">
                      {purchase.currentImpact.carbonOffset.toFixed(1)}t CO2
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${purchase.projectProgress}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600">
                          {purchase.projectProgress}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(purchase.status)}`}
                        >
                          {purchase.status.toUpperCase()}
                        </span>
                        <br />
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getVerificationBadge(purchase.verificationStatus)}`}
                        >
                          {purchase.verificationStatus.toUpperCase()}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => onViewProject(purchase.projectId)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Eye className="h-5 w-5" />
                        </button>
                        {purchase.certificateUrl && (
                          <button
                            onClick={() => onDownloadCertificate(purchase.id)}
                            className="text-green-600 hover:text-green-800"
                          >
                            <Download className="h-5 w-5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {filteredPurchases.length === 0 && (
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <PieChart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-800 mb-2">
            No purchases found
          </h3>
          <p className="text-gray-600">
            No carbon credit purchases match your current filters.
          </p>
        </div>
      )}
    </div>
  );
}
