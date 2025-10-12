'use client';

import { api } from '@packages/backend';
import type { Id } from '@packages/backend/convex/_generated/dataModel';
import { useMutation, useQuery } from 'convex/react';
import { Clock, RefreshCw, Users } from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';

import { UserManagementTable } from '@/components/dashboard/admin/UserManagementTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ClientTime } from '@/components/ui/client-time';

export default function AdminUsersPage() {
  const [refreshing, setRefreshing] = useState(false);

  const userStats = useQuery(api.users.getUserStatsForAdmin);

  // Admin mutations
  const toggleUserStatus = useMutation(api.users.adminToggleUserStatus);
  const deleteUser = useMutation(api.users.adminDeleteUser);
  const updateUserRole = useMutation(api.users.updateUserRole);

  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const handleUserAction = async (userId: string, action: string) => {
    const userIdTyped = userId as Id<'users'>;

    switch (action) {
      case 'view':
        // Open edit modal (to be implemented)
        toast('Edit user feature coming soon!');
        break;

      case 'message':
        // Open messaging modal (to be implemented)
        toast('Messaging feature coming soon!');
        break;

      case 'activate':
        try {
          await toggleUserStatus({
            userId: userIdTyped,
            isActive: true,
          });
          toast.success('User activated successfully');
        } catch (error: any) {
          toast.error(error.message || 'Failed to activate user');
        }
        break;

      case 'deactivate':
        if (!confirm('Are you sure you want to deactivate this user?')) {
          return;
        }
        try {
          await toggleUserStatus({
            userId: userIdTyped,
            isActive: false,
          });
          toast.success('User deactivated successfully');
        } catch (error: any) {
          toast.error(error.message || 'Failed to deactivate user');
        }
        break;

      case 'delete':
        if (
          !confirm(
            'Are you sure you want to delete this user? This action will deactivate the user account.'
          )
        ) {
          return;
        }
        try {
          await deleteUser({ userId: userIdTyped });
          toast.success('User deleted successfully');
        } catch (error: any) {
          toast.error(error.message || 'Failed to delete user');
        }
        break;

      default:
        console.log(`Unknown action: ${action} for user ${userId}`);
    }
  };

  const handleExport = () => {
    toast('Export feature coming soon!');
  };

  const isLoading = userStats === undefined;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            User Management
          </h1>
          <p className="text-gray-500 mt-1">
            Manage platform users, roles, and permissions
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge
            variant="outline"
            className="text-xs text-gray-500 bg-gray-50 border-gray-200"
          >
            <Clock className="h-3 w-3 mr-1" />
            <ClientTime prefix="Last updated: " format="time" />
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900"
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`}
            />
            Refresh
          </Button>
          {/*<Button*/}
          {/*  variant="outline"*/}
          {/*  size="sm"*/}
          {/*  onClick={handleExport}*/}
          {/*  className="border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900"*/}
          {/*>*/}
          {/*  <Download className="h-4 w-4 mr-2" />*/}
          {/*  Export*/}
          {/*</Button>*/}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-white border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-blue-500 text-white">
                <Users className="h-5 w-5" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Users</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {isLoading
                    ? '...'
                    : (userStats?.totalUsers?.toLocaleString() ?? '0')}
                </p>
              </div>
            </div>
            <div className="mt-3">
              <span className="text-sm text-green-600 font-medium">
                Live data
              </span>
              <span className="text-sm text-gray-500 ml-1">from database</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-green-500 text-white">
                <Users className="h-5 w-5" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">
                  Active Users
                </p>
                <p className="text-2xl font-semibold text-gray-900">
                  {isLoading
                    ? '...'
                    : (userStats?.activeUsers?.toLocaleString() ?? '0')}
                </p>
              </div>
            </div>
            <div className="mt-3">
              <span className="text-sm text-green-600 font-medium">
                Live data
              </span>
              <span className="text-sm text-gray-500 ml-1">from database</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-yellow-500 text-white">
                <Users className="h-5 w-5" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">
                  Pending Review
                </p>
                <p className="text-2xl font-semibold text-gray-900">
                  {isLoading
                    ? '...'
                    : (userStats?.pendingVerification?.toLocaleString() ?? '0')}
                </p>
              </div>
            </div>
            <div className="mt-3">
              <span className="text-sm text-orange-600 font-medium">
                Needs attention
              </span>
              <span className="text-sm text-gray-500 ml-1">
                verification pending
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-purple-500 text-white">
                <Users className="h-5 w-5" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Verifiers</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {isLoading
                    ? '...'
                    : (userStats?.verifiers?.toLocaleString() ?? '0')}
                </p>
              </div>
            </div>
            <div className="mt-3">
              <span className="text-sm text-green-600 font-medium">Active</span>
              <span className="text-sm text-gray-500 ml-1">
                qualified verifiers
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Management Table */}
      <UserManagementTable
        loading={isLoading}
        onUserAction={handleUserAction}
      />

      {/* Footer Info */}
      <Card className="bg-white border-gray-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center gap-4">
              <span>User data synchronized</span>
              <span>•</span>
              <span className="text-green-600">All systems operational</span>
              <span>•</span>
              <span>Last backup: 1 hour ago</span>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs h-auto p-1 text-gray-500 hover:text-green-600"
              >
                User Guidelines
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs h-auto p-1 text-gray-500 hover:text-green-600"
              >
                Privacy Policy
              </Button>
              {/*<Button variant="ghost" size="sm" className="text-xs h-auto p-1 text-gray-500 hover:text-green-600">*/}
              {/*  Data Export*/}
              {/*</Button>*/}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
