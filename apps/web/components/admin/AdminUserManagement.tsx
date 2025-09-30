'use client';

import {
  Ban,
  Calendar,
  CheckCircle,
  Download,
  Edit,
  Eye,
  Filter,
  Mail,
  MoreHorizontal,
  Search,
  Shield,
  UserCheck,
  UserX,
} from 'lucide-react';
import { useState } from 'react';

export default function AdminUserManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const users = [
    {
      id: 1,
      name: 'John Smith',
      email: 'john.smith@example.com',
      role: 'Project Creator',
      status: 'Active',
      joinDate: '2024-01-15',
      lastLogin: '2024-01-26',
      projectsCreated: 3,
      creditsEarned: 850,
      totalRevenue: 21250,
      verificationLevel: 'Verified',
      location: 'California, USA',
      activityScore: 95,
    },
    {
      id: 2,
      name: 'Sarah Johnson',
      email: 'sarah.j@greentech.com',
      role: 'Buyer',
      status: 'Active',
      joinDate: '2024-01-10',
      lastLogin: '2024-01-25',
      projectsCreated: 0,
      creditsEarned: 0,
      totalRevenue: 0,
      creditsPurchased: 125,
      totalSpent: 3750,
      verificationLevel: 'Verified',
      location: 'New York, USA',
      activityScore: 88,
    },
    {
      id: 3,
      name: 'Dr. Michael Chen',
      email: 'michael.chen@verifier.org',
      role: 'Verifier',
      status: 'Active',
      joinDate: '2023-12-05',
      lastLogin: '2024-01-24',
      projectsCreated: 0,
      creditsEarned: 0,
      totalRevenue: 0,
      projectsVerified: 45,
      verificationFees: 22500,
      verificationLevel: 'Expert',
      location: 'Singapore',
      activityScore: 92,
    },
    {
      id: 4,
      name: 'Emma Wilson',
      email: 'emma.wilson@conservation.org',
      role: 'Project Creator',
      status: 'Pending',
      joinDate: '2024-01-20',
      lastLogin: '2024-01-22',
      projectsCreated: 1,
      creditsEarned: 0,
      totalRevenue: 0,
      verificationLevel: 'Pending',
      location: 'London, UK',
      activityScore: 45,
    },
    {
      id: 5,
      name: 'Alex Rodriguez',
      email: 'alex.r@energy.com',
      role: 'Buyer',
      status: 'Suspended',
      joinDate: '2024-01-08',
      lastLogin: '2024-01-18',
      projectsCreated: 0,
      creditsEarned: 0,
      totalRevenue: 0,
      creditsPurchased: 75,
      totalSpent: 2250,
      verificationLevel: 'Unverified',
      location: 'Madrid, Spain',
      activityScore: 25,
    },
    {
      id: 6,
      name: 'David Kim',
      email: 'david.kim@solutions.kr',
      role: 'Project Creator',
      status: 'Active',
      joinDate: '2023-11-20',
      lastLogin: '2024-01-26',
      projectsCreated: 7,
      creditsEarned: 1200,
      totalRevenue: 30000,
      verificationLevel: 'Verified',
      location: 'Seoul, South Korea',
      activityScore: 98,
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Suspended':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Project Creator':
        return 'bg-blue-100 text-blue-800';
      case 'Buyer':
        return 'bg-purple-100 text-purple-800';
      case 'Verifier':
        return 'bg-green-100 text-green-800';
      case 'Admin':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getVerificationColor = (level: string) => {
    switch (level) {
      case 'Verified':
      case 'Expert':
        return 'text-green-600';
      case 'Pending':
        return 'text-yellow-600';
      case 'Unverified':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus =
      statusFilter === 'all' || user.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">User Management</h3>
          <p className="text-sm text-gray-600">
            Manage platform users and their activities
          </p>
        </div>
        <div className="flex gap-3">
          <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2">
            <Download className="h-4 w-4" />
            <span>Export Users</span>
          </button>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            Add New User
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
                placeholder="Search users by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Role Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Roles</option>
              <option value="Project Creator">Project Creator</option>
              <option value="Buyer">Buyer</option>
              <option value="Verifier">Verifier</option>
              <option value="Admin">Admin</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="Active">Active</option>
              <option value="Pending">Pending</option>
              <option value="Suspended">Suspended</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role & Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Activity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Performance
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
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-700">
                            {user.name
                              .split(' ')
                              .map((n) => n[0])
                              .join('')}
                          </span>
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {user.name}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <Mail className="h-3 w-3 mr-1" />
                          {user.email}
                        </div>
                        <div className="text-xs text-gray-500">
                          {user.location}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-2">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}
                      >
                        {user.role}
                      </span>
                      <br />
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(user.status)}`}
                      >
                        {user.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      <div className="flex items-center space-x-1 mb-1">
                        <Calendar className="h-3 w-3 text-gray-400" />
                        <span className="text-xs">
                          Joined: {new Date(user.joinDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">
                        Last login:{' '}
                        {new Date(user.lastLogin).toLocaleDateString()}
                      </div>
                      <div className="mt-2">
                        <div className="flex items-center space-x-2">
                          <div className="text-xs font-medium">
                            Activity: {user.activityScore}%
                          </div>
                          <div className="w-16 bg-gray-200 rounded-full h-1">
                            <div
                              className="bg-blue-600 h-1 rounded-full"
                              style={{ width: `${user.activityScore}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {user.role === 'Project Creator' && (
                      <div className="text-sm text-gray-900">
                        <div className="font-medium">
                          {user.projectsCreated} projects
                        </div>
                        <div className="text-xs text-gray-500">
                          {user.creditsEarned} credits earned
                        </div>
                        <div className="text-xs text-green-600">
                          ₹{user.totalRevenue.toLocaleString()} revenue
                        </div>
                      </div>
                    )}
                    {user.role === 'Buyer' && (
                      <div className="text-sm text-gray-900">
                        <div className="font-medium">
                          {user.creditsPurchased || 0} credits bought
                        </div>
                        <div className="text-xs text-blue-600">
                          ₹{(user.totalSpent || 0).toLocaleString()} spent
                        </div>
                      </div>
                    )}
                    {user.role === 'Verifier' && (
                      <div className="text-sm text-gray-900">
                        <div className="font-medium">
                          {user.projectsVerified || 0} projects verified
                        </div>
                        <div className="text-xs text-green-600">
                          ₹{(user.verificationFees || 0).toLocaleString()} fees
                          earned
                        </div>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div
                      className={`flex items-center space-x-1 ${getVerificationColor(user.verificationLevel)}`}
                    >
                      {user.verificationLevel === 'Verified' && (
                        <CheckCircle className="h-4 w-4" />
                      )}
                      {user.verificationLevel === 'Expert' && (
                        <Shield className="h-4 w-4" />
                      )}
                      {user.verificationLevel === 'Pending' && (
                        <Calendar className="h-4 w-4" />
                      )}
                      {user.verificationLevel === 'Unverified' && (
                        <UserX className="h-4 w-4" />
                      )}
                      <span className="text-sm">{user.verificationLevel}</span>
                    </div>
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
                        title="Edit User"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      {user.status === 'Active' ? (
                        <button
                          className="text-red-600 hover:text-red-800"
                          title="Suspend User"
                        >
                          <Ban className="h-4 w-4" />
                        </button>
                      ) : (
                        <button
                          className="text-green-600 hover:text-green-800"
                          title="Activate User"
                        >
                          <UserCheck className="h-4 w-4" />
                        </button>
                      )}
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

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500">
              No users found matching your criteria
            </div>
          </div>
        )}
      </div>

      {/* User Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{users.length}</div>
          <div className="text-sm text-blue-800">Total Users</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-green-600">
            {users.filter((u) => u.status === 'Active').length}
          </div>
          <div className="text-sm text-green-800">Active Users</div>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-yellow-600">
            {users.filter((u) => u.status === 'Pending').length}
          </div>
          <div className="text-sm text-yellow-800">Pending Verification</div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">
            {users.filter((u) => u.role === 'Verifier').length}
          </div>
          <div className="text-sm text-purple-800">Active Verifiers</div>
        </div>
      </div>
    </div>
  );
}
