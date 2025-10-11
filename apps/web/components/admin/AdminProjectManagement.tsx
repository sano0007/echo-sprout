'use client';

import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Download,
  Edit,
  Eye,
  Filter,
  MoreHorizontal,
  Search,
  XCircle,
} from 'lucide-react';
import { useState } from 'react';

export default function AdminProjectManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  // Mock data for projects
  const projects = [
    {
      id: 1,
      title: 'Amazon Rainforest Conservation Phase 2',
      creator: 'Green Earth Foundation',
      creatorEmail: 'contact@greenearth.org',
      type: 'Reforestation',
      status: 'Active',
      progress: 75,
      creditsIssued: 500,
      creditsRemaining: 200,
      submissionDate: '2024-01-15',
      lastUpdate: '2024-01-25',
      verificationStatus: 'Verified',
      verifier: 'Dr. Sarah Wilson',
      revenue: 12500,
      location: 'Brazil',
      alerts: 0,
    },
    {
      id: 2,
      title: 'Solar Farm Initiative Maharashtra',
      creator: 'SolarTech Solutions',
      creatorEmail: 'info@solartech.in',
      type: 'Solar Energy',
      status: 'Under Review',
      progress: 45,
      creditsIssued: 0,
      creditsRemaining: 800,
      submissionDate: '2024-01-20',
      lastUpdate: '2024-01-22',
      verificationStatus: 'Pending',
      verifier: 'Dr. Michael Chen',
      revenue: 0,
      location: 'India',
      alerts: 1,
    },
    {
      id: 3,
      title: 'Wind Power Project Tamil Nadu',
      creator: 'WindForce Energy',
      creatorEmail: 'projects@windforce.com',
      type: 'Wind Energy',
      status: 'Active',
      progress: 60,
      creditsIssued: 350,
      creditsRemaining: 450,
      submissionDate: '2024-01-10',
      lastUpdate: '2024-01-24',
      verificationStatus: 'Verified',
      verifier: 'Dr. Emily Rodriguez',
      revenue: 8750,
      location: 'India',
      alerts: 0,
    },
    {
      id: 4,
      title: 'Mangrove Restoration Kerala Coast',
      creator: 'Coastal Conservation Society',
      creatorEmail: 'conservation@coastalsociety.org',
      type: 'Mangrove Restoration',
      status: 'Completed',
      progress: 100,
      creditsIssued: 200,
      creditsRemaining: 0,
      submissionDate: '2023-12-05',
      lastUpdate: '2024-01-20',
      verificationStatus: 'Verified',
      verifier: 'Dr. Sarah Wilson',
      revenue: 5000,
      location: 'India',
      alerts: 0,
    },
    {
      id: 5,
      title: 'Biogas Plant Karnataka Rural Areas',
      creator: 'GreenTech Solutions',
      creatorEmail: 'support@greentech.in',
      type: 'Biogas',
      status: 'Suspended',
      progress: 30,
      creditsIssued: 0,
      creditsRemaining: 300,
      submissionDate: '2024-01-18',
      lastUpdate: '2024-01-19',
      verificationStatus: 'Failed',
      verifier: 'Dr. Michael Chen',
      revenue: 0,
      location: 'India',
      alerts: 3,
    },
    {
      id: 6,
      title: 'Waste Management Mumbai Initiative',
      creator: 'Urban Solutions Ltd',
      creatorEmail: 'projects@urbansolutions.com',
      type: 'Waste Management',
      status: 'Active',
      progress: 85,
      creditsIssued: 400,
      creditsRemaining: 100,
      submissionDate: '2023-11-20',
      lastUpdate: '2024-01-26',
      verificationStatus: 'Verified',
      verifier: 'Dr. Emily Rodriguez',
      revenue: 10000,
      location: 'India',
      alerts: 1,
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'Under Review':
        return 'bg-yellow-100 text-yellow-800';
      case 'Completed':
        return 'bg-blue-100 text-blue-800';
      case 'Suspended':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getVerificationColor = (status: string) => {
    switch (status) {
      case 'Verified':
        return 'text-green-600';
      case 'Pending':
        return 'text-yellow-600';
      case 'Failed':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.creator.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' || project.status === statusFilter;
    const matchesType = typeFilter === 'all' || project.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Project Management</h3>
          <p className="text-sm text-gray-600">
            Monitor and manage all platform projects
          </p>
        </div>
        <div className="flex gap-3">
          <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2">
            <Download className="h-4 w-4" />
            <span>Export Data</span>
          </button>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            Add New Project
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search projects or creators..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="Active">Active</option>
              <option value="Under Review">Under Review</option>
              <option value="Completed">Completed</option>
              <option value="Suspended">Suspended</option>
            </select>
          </div>

          {/* Type Filter */}
          <div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="Reforestation">Reforestation</option>
              <option value="Solar Energy">Solar Energy</option>
              <option value="Wind Energy">Wind Energy</option>
              <option value="Mangrove Restoration">Mangrove Restoration</option>
              <option value="Biogas">Biogas</option>
              <option value="Waste Management">Waste Management</option>
            </select>
          </div>
        </div>
      </div>

      {/* Projects Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Project
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Creator
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Progress
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Credits
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Revenue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Verification
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProjects.map((project) => (
                <tr key={project.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-start space-x-3">
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">
                          {project.title}
                        </div>
                        <div className="text-xs text-gray-500">
                          ID: #{project.id} • {project.location}
                        </div>
                        <div className="text-xs text-gray-500">
                          Submitted:{' '}
                          {new Date(
                            project.submissionDate
                          ).toLocaleDateString()}
                        </div>
                      </div>
                      {project.alerts > 0 && (
                        <div className="flex items-center">
                          <AlertTriangle className="h-4 w-4 text-orange-500" />
                          <span className="text-xs text-orange-600 ml-1">
                            {project.alerts}
                          </span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {project.creator}
                    </div>
                    <div className="text-xs text-gray-500">
                      {project.creatorEmail}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{project.type}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(project.status)}`}
                    >
                      {project.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <div className="text-sm font-medium text-gray-900">
                        {project.progress}%
                      </div>
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${project.progress}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Last update:{' '}
                      {new Date(project.lastUpdate).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      <div className="font-medium">
                        {project.creditsIssued} issued
                      </div>
                      <div className="text-xs text-gray-500">
                        {project.creditsRemaining} remaining
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      ₹{project.revenue.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div
                      className={`flex items-center space-x-1 ${getVerificationColor(project.verificationStatus)}`}
                    >
                      {project.verificationStatus === 'Verified' && (
                        <CheckCircle className="h-4 w-4" />
                      )}
                      {project.verificationStatus === 'Pending' && (
                        <Clock className="h-4 w-4" />
                      )}
                      {project.verificationStatus === 'Failed' && (
                        <XCircle className="h-4 w-4" />
                      )}
                      <span className="text-sm">
                        {project.verificationStatus}
                      </span>
                    </div>
                    {project.verifier && (
                      <div className="text-xs text-gray-500">
                        {project.verifier}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button
                        className="text-blue-600 hover:text-blue-800"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        className="text-green-600 hover:text-green-800"
                        title="Edit Project"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        className="text-gray-600 hover:text-gray-800"
                        title="More Options"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredProjects.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500">
              No projects found matching your criteria
            </div>
          </div>
        )}
      </div>

      {/* Project Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">
            {projects.length}
          </div>
          <div className="text-sm text-blue-800">Total Projects</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-green-600">
            {projects.filter((p) => p.status === 'Active').length}
          </div>
          <div className="text-sm text-green-800">Active Projects</div>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-yellow-600">
            {projects.filter((p) => p.status === 'Under Review').length}
          </div>
          <div className="text-sm text-yellow-800">Under Review</div>
        </div>
        <div className="bg-red-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-red-600">
            {projects.reduce((sum, p) => sum + p.alerts, 0)}
          </div>
          <div className="text-sm text-red-800">Active Alerts</div>
        </div>
      </div>
    </div>
  );
}
