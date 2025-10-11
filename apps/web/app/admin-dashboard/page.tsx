'use client';

import { useState } from 'react';

import AdminProjectManagement from '../../components/admin/AdminProjectManagement';
import AdminUserManagement from '../../components/admin/AdminUserManagement';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data for platform metrics
  const platformMetrics = {
    totalProjects: 145,
    activeProjects: 89,
    totalUsers: 2847,
    totalCreditsIssued: 12450,
    platformRevenue: 875600,
    totalCO2Offset: 18900,
    projectsThisMonth: 12,
    recentSignups: 156,
  };

  // Mock data for recent projects
  const recentProjects = [
    {
      id: 1,
      title: 'Amazon Rainforest Conservation',
      creator: 'Green Earth Foundation',
      type: 'Reforestation',
      status: 'Active',
      creditsIssued: 500,
      progress: 75,
      submissionDate: '2024-01-15',
      verificationStatus: 'Verified',
    },
    {
      id: 2,
      title: 'Solar Farm Initiative Maharashtra',
      creator: 'SolarTech Solutions',
      type: 'Solar Energy',
      status: 'Under Review',
      creditsIssued: 0,
      progress: 45,
      submissionDate: '2024-01-20',
      verificationStatus: 'Pending',
    },
    {
      id: 3,
      title: 'Wind Power Project Tamil Nadu',
      creator: 'WindForce Energy',
      type: 'Wind Energy',
      status: 'Active',
      creditsIssued: 350,
      progress: 60,
      submissionDate: '2024-01-10',
      verificationStatus: 'Verified',
    },
    {
      id: 4,
      title: 'Mangrove Restoration Kerala',
      creator: 'Coastal Conservation Society',
      type: 'Mangrove Restoration',
      status: 'Completed',
      creditsIssued: 200,
      progress: 100,
      submissionDate: '2023-12-05',
      verificationStatus: 'Verified',
    },
  ];

  // Mock data for recent activities
  const recentActivities = [
    {
      id: 1,
      type: 'project_submission',
      message: 'New project "Biogas Plant Karnataka" submitted for review',
      user: 'GreenTech Solutions',
      timestamp: '2 hours ago',
      severity: 'info',
    },
    {
      id: 2,
      type: 'verification_complete',
      message: 'Project "Solar Farm Initiative" verification completed',
      user: 'Dr. Sarah Wilson',
      timestamp: '4 hours ago',
      severity: 'success',
    },
    {
      id: 3,
      type: 'alert',
      message: 'Project "Wind Farm Gujarat" missed progress update deadline',
      user: 'System',
      timestamp: '6 hours ago',
      severity: 'warning',
    },
    {
      id: 4,
      type: 'user_registration',
      message: 'New buyer registered: EcoConsciuos Corp',
      user: 'System',
      timestamp: '8 hours ago',
      severity: 'info',
    },
    {
      id: 5,
      type: 'credit_purchase',
      message: '150 credits purchased for "Amazon Conservation Project"',
      user: 'Green Industries Ltd',
      timestamp: '1 day ago',
      severity: 'success',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Platform overview and management tools
          </p>
        </div>
        <div className="flex gap-3">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            Generate Report
          </button>
          <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
            Export Data
          </button>
        </div>
      </div>

      {/* Platform Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <p className="text-2xl font-bold text-blue-600">
            {platformMetrics.totalProjects}
          </p>
          <p className="text-sm text-gray-600">Total Projects</p>
          <p className="text-xs text-green-600 mt-1">
            +{platformMetrics.projectsThisMonth} this month
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <p className="text-2xl font-bold text-green-600">
            {platformMetrics.activeProjects}
          </p>
          <p className="text-sm text-gray-600">Active Projects</p>
          <p className="text-xs text-blue-600 mt-1">
            {Math.round(
              (platformMetrics.activeProjects / platformMetrics.totalProjects) *
                100
            )}
            % of total
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <p className="text-2xl font-bold text-purple-600">
            {platformMetrics.totalUsers.toLocaleString()}
          </p>
          <p className="text-sm text-gray-600">Total Users</p>
          <p className="text-xs text-green-600 mt-1">
            +{platformMetrics.recentSignups} this month
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <p className="text-2xl font-bold text-orange-600">
            {platformMetrics.totalCreditsIssued.toLocaleString()}
          </p>
          <p className="text-sm text-gray-600">Credits Issued</p>
          <p className="text-xs text-blue-600 mt-1">Lifetime total</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <p className="text-2xl font-bold text-emerald-600">
            ${(platformMetrics.platformRevenue / 1000).toFixed(0)}K
          </p>
          <p className="text-sm text-gray-600">Platform Revenue</p>
          <p className="text-xs text-green-600 mt-1">This year</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <p className="text-2xl font-bold text-teal-600">
            {platformMetrics.totalCO2Offset.toLocaleString()}
          </p>
          <p className="text-sm text-gray-600">CO₂ Offset (tons)</p>
          <p className="text-xs text-green-600 mt-1">Platform impact</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="border-b">
          <nav className="flex">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-4 text-sm font-medium ${activeTab === 'overview' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
            >
              Platform Overview
            </button>
            <button
              onClick={() => setActiveTab('projects')}
              className={`px-6 py-4 text-sm font-medium ${activeTab === 'projects' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
            >
              Project Management
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`px-6 py-4 text-sm font-medium ${activeTab === 'users' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
            >
              User Management
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-6 py-4 text-sm font-medium ${activeTab === 'analytics' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
            >
              Analytics
            </button>
            <button
              onClick={() => setActiveTab('system')}
              className={`px-6 py-4 text-sm font-medium ${activeTab === 'system' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
            >
              System Health
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* Platform Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Recent Projects and Activities */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Projects */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">
                    Recent Projects
                  </h3>
                  <div className="space-y-4">
                    {recentProjects.slice(0, 4).map((project) => (
                      <div
                        key={project.id}
                        className="bg-white p-4 rounded-lg border"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-800">
                              {project.title}
                            </h4>
                            <p className="text-sm text-gray-600">
                              by {project.creator}
                            </p>
                          </div>
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              project.status === 'Active'
                                ? 'bg-green-100 text-green-800'
                                : project.status === 'Under Review'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : project.status === 'Completed'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {project.status}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-600">{project.type}</span>
                          <span className="text-gray-600">
                            {project.progress}% complete
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${project.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button className="w-full mt-4 text-center text-blue-600 hover:text-blue-800 text-sm font-medium">
                    View All Projects →
                  </button>
                </div>

                {/* Recent Activities */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">
                    Recent Activities
                  </h3>
                  <div className="space-y-4">
                    {recentActivities.map((activity) => (
                      <div
                        key={activity.id}
                        className="bg-white p-4 rounded-lg border"
                      >
                        <div className="flex items-start space-x-3">
                          <div
                            className={`w-2 h-2 rounded-full mt-2 ${
                              activity.severity === 'success'
                                ? 'bg-green-500'
                                : activity.severity === 'warning'
                                  ? 'bg-yellow-500'
                                  : activity.severity === 'error'
                                    ? 'bg-red-500'
                                    : 'bg-blue-500'
                            }`}
                          ></div>
                          <div className="flex-1">
                            <p className="text-sm text-gray-800">
                              {activity.message}
                            </p>
                            <div className="flex justify-between items-center mt-1">
                              <span className="text-xs text-gray-600">
                                {activity.user}
                              </span>
                              <span className="text-xs text-gray-500">
                                {activity.timestamp}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button className="w-full mt-4 text-center text-blue-600 hover:text-blue-800 text-sm font-medium">
                    View All Activities →
                  </button>
                </div>
              </div>

              {/* Platform Performance Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">
                    Monthly Project Submissions
                  </h3>
                  <div className="h-64 flex items-center justify-center bg-white rounded">
                    <p className="text-gray-500">
                      Chart showing monthly project submissions trend
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">
                    Credits Issued vs Revenue
                  </h3>
                  <div className="h-64 flex items-center justify-center bg-white rounded">
                    <p className="text-gray-500">
                      Chart showing credits issued and revenue correlation
                    </p>
                  </div>
                </div>
              </div>

              {/* Environmental Impact Summary */}
              <div>
                <h3 className="text-lg font-semibold mb-4">
                  Platform Environmental Impact
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-green-50 p-4 rounded-lg text-center">
                    <p className="text-3xl font-bold text-green-600">🌳</p>
                    <p className="text-lg font-semibold">47,500</p>
                    <p className="text-sm text-gray-600">
                      Equivalent trees planted
                    </p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg text-center">
                    <p className="text-3xl font-bold text-blue-600">🚗</p>
                    <p className="text-lg font-semibold">4,100</p>
                    <p className="text-sm text-gray-600">
                      Cars off road equivalent
                    </p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg text-center">
                    <p className="text-3xl font-bold text-purple-600">⚡</p>
                    <p className="text-lg font-semibold">2.1M</p>
                    <p className="text-sm text-gray-600">
                      kWh clean energy supported
                    </p>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg text-center">
                    <p className="text-3xl font-bold text-orange-600">🏠</p>
                    <p className="text-lg font-semibold">2,590</p>
                    <p className="text-sm text-gray-600">
                      Homes powered for a year
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Project Management Tab */}
          {activeTab === 'projects' && <AdminProjectManagement />}

          {/* User Management Tab */}
          {activeTab === 'users' && <AdminUserManagement />}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Platform Analytics</h3>
                <div className="flex gap-2">
                  <select className="px-3 py-2 border border-gray-300 rounded text-sm">
                    <option value="7">Last 7 days</option>
                    <option value="30">Last 30 days</option>
                    <option value="90">Last 90 days</option>
                    <option value="365">Last year</option>
                  </select>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded text-sm">
                    Export Analytics
                  </button>
                </div>
              </div>

              {/* Analytics Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h4 className="text-md font-medium mb-4">User Growth</h4>
                  <div className="h-64 flex items-center justify-center bg-white rounded">
                    <p className="text-gray-500">
                      User registration and activity trends
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50 p-6 rounded-lg">
                  <h4 className="text-md font-medium mb-4">
                    Project Type Distribution
                  </h4>
                  <div className="h-64 flex items-center justify-center bg-white rounded">
                    <p className="text-gray-500">
                      Breakdown of project types on platform
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50 p-6 rounded-lg">
                  <h4 className="text-md font-medium mb-4">Revenue Trends</h4>
                  <div className="h-64 flex items-center justify-center bg-white rounded">
                    <p className="text-gray-500">
                      Platform revenue and commission trends
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50 p-6 rounded-lg">
                  <h4 className="text-md font-medium mb-4">
                    Credit Market Activity
                  </h4>
                  <div className="h-64 flex items-center justify-center bg-white rounded">
                    <p className="text-gray-500">
                      Credit trading volume and pricing trends
                    </p>
                  </div>
                </div>
              </div>

              {/* Key Metrics Table */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h4 className="text-md font-medium mb-4">
                  Key Performance Indicators
                </h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white rounded">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                          Metric
                        </th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                          Current
                        </th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                          Previous Period
                        </th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                          Change
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      <tr>
                        <td className="px-4 py-2 text-sm">
                          Monthly Active Users
                        </td>
                        <td className="px-4 py-2 text-sm font-medium">1,847</td>
                        <td className="px-4 py-2 text-sm">1,623</td>
                        <td className="px-4 py-2 text-sm text-green-600">
                          +13.8%
                        </td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2 text-sm">
                          Project Completion Rate
                        </td>
                        <td className="px-4 py-2 text-sm font-medium">87.2%</td>
                        <td className="px-4 py-2 text-sm">84.1%</td>
                        <td className="px-4 py-2 text-sm text-green-600">
                          +3.1%
                        </td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2 text-sm">
                          Average Credit Price
                        </td>
                        <td className="px-4 py-2 text-sm font-medium">
                          $16.50
                        </td>
                        <td className="px-4 py-2 text-sm">$15.80</td>
                        <td className="px-4 py-2 text-sm text-green-600">
                          +4.4%
                        </td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2 text-sm">
                          Platform Commission
                        </td>
                        <td className="px-4 py-2 text-sm font-medium">
                          $42,300
                        </td>
                        <td className="px-4 py-2 text-sm">$38,900</td>
                        <td className="px-4 py-2 text-sm text-green-600">
                          +8.7%
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* System Health Tab */}
          {activeTab === 'system' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">
                System Health & Monitoring
              </h3>

              {/* System Status Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-lg font-medium text-green-800">
                        API Status
                      </h4>
                      <p className="text-sm text-green-600">
                        All endpoints operational
                      </p>
                    </div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm text-green-700">Uptime: 99.9%</p>
                    <p className="text-xs text-green-600">Last 30 days</p>
                  </div>
                </div>

                <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-lg font-medium text-blue-800">
                        Database
                      </h4>
                      <p className="text-sm text-blue-600">
                        Performance optimal
                      </p>
                    </div>
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm text-blue-700">Response time: 45ms</p>
                    <p className="text-xs text-blue-600">Average last hour</p>
                  </div>
                </div>

                <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-lg font-medium text-yellow-800">
                        Storage
                      </h4>
                      <p className="text-sm text-yellow-600">
                        78% capacity used
                      </p>
                    </div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm text-yellow-700">156GB / 200GB</p>
                    <p className="text-xs text-yellow-600">
                      Consider scaling soon
                    </p>
                  </div>
                </div>
              </div>

              {/* System Metrics */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h4 className="text-md font-medium mb-4">
                    Server Performance
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>CPU Usage</span>
                        <span>34%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: '34%' }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Memory Usage</span>
                        <span>67%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{ width: '67%' }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Network I/O</span>
                        <span>23%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-purple-600 h-2 rounded-full"
                          style={{ width: '23%' }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-6 rounded-lg">
                  <h4 className="text-md font-medium mb-4">
                    Recent System Events
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                      <div className="flex-1">
                        <p className="text-sm">
                          Database backup completed successfully
                        </p>
                        <p className="text-xs text-gray-500">2 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      <div className="flex-1">
                        <p className="text-sm">
                          Security scan completed - no vulnerabilities found
                        </p>
                        <p className="text-xs text-gray-500">6 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                      <div className="flex-1">
                        <p className="text-sm">
                          High API traffic detected - auto-scaling initiated
                        </p>
                        <p className="text-xs text-gray-500">1 day ago</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                      <div className="flex-1">
                        <p className="text-sm">
                          System update deployed successfully
                        </p>
                        <p className="text-xs text-gray-500">2 days ago</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Monitoring Tools */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h4 className="text-md font-medium mb-4">Quick Actions</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button className="bg-blue-600 text-white p-4 rounded-lg hover:bg-blue-700 text-center">
                    <p className="font-medium">Run System Diagnostics</p>
                    <p className="text-sm opacity-90">
                      Check all system components
                    </p>
                  </button>
                  <button className="bg-green-600 text-white p-4 rounded-lg hover:bg-green-700 text-center">
                    <p className="font-medium">Force Database Backup</p>
                    <p className="text-sm opacity-90">
                      Create immediate backup
                    </p>
                  </button>
                  <button className="bg-orange-600 text-white p-4 rounded-lg hover:bg-orange-700 text-center">
                    <p className="font-medium">View Detailed Logs</p>
                    <p className="text-sm opacity-90">Access system logs</p>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
