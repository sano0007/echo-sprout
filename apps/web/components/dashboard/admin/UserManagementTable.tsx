'use client';

import {
  Edit,
  Mail,
  MoreHorizontal,
  Search,
  Trash2,
  UserCheck,
  UserX,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useQuery } from 'convex/react';

import { cn } from '@/lib/utils';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { api } from '@packages/backend';

interface UserManagementTableProps {
  loading?: boolean;
  onUserAction?: (userId: string, action: string) => void;
  className?: string;
}

const roleColors = {
  project_creator: 'text-blue-800 bg-blue-100 border-blue-200',
  credit_buyer: 'text-green-800 bg-green-100 border-green-200',
  verifier: 'text-purple-800 bg-purple-100 border-purple-200',
  admin: 'text-red-800 bg-red-100 border-red-200',
};

const statusColors = {
  active: 'text-green-800 bg-green-100 border-green-200',
  inactive: 'text-gray-800 bg-gray-100 border-gray-200',
};

export const UserManagementTable: React.FC<UserManagementTableProps> = ({
  loading: externalLoading = false,
  onUserAction = () => {},
  className,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Debounce search query to avoid excessive API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Use Convex query with manual pagination
  const paginationResult = useQuery(api.users.getAllUsersForAdmin, {
    paginationOpts: {
      numItems: 20,
      cursor: currentPage > 0 ? currentPage.toString() : null,
    },
    searchTerm: debouncedSearchQuery || undefined,
    roleFilter: roleFilter !== 'all' ? (roleFilter as any) : undefined,
    statusFilter:
      statusFilter !== 'all'
        ? (statusFilter as 'active' | 'inactive')
        : undefined,
  });

  const users = paginationResult?.page || [];
  const canLoadMore = paginationResult ? !paginationResult.isDone : false;
  const loading = externalLoading || !paginationResult;

  const loadMore = async () => {
    if (canLoadMore && !isLoadingMore) {
      setIsLoadingMore(true);
      setCurrentPage((prev) => prev + 1);
      // Reset loading state after a brief delay to allow for data fetching
      setTimeout(() => setIsLoadingMore(false), 500);
    }
  };

  // Reset pagination when search or filters change
  useEffect(() => {
    setCurrentPage(0);
  }, [debouncedSearchQuery, roleFilter, statusFilter]);

  const formatDate = (timestamp: number) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(timestamp));
  };

  const getActivityMetric = (user: any) => {
    switch (user.role) {
      case 'project_creator':
        return 'Project Creator';
      case 'credit_buyer':
        return 'Credit Buyer';
      case 'verifier':
        return 'Verifier';
      case 'admin':
        return 'Administrator';
      default:
        return '-';
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'project_creator':
        return 'Project Creator';
      case 'credit_buyer':
        return 'Credit Buyer';
      case 'verifier':
        return 'Verifier';
      case 'admin':
        return 'Admin';
      default:
        return role;
    }
  };

  if (loading) {
    return (
      <Card
        className={cn('bg-pure-white border-cloud-gray shadow-soft', className)}
      >
        <CardHeader className="bg-snow-white border-b border-cloud-gray">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-48 loading-shimmer" />
            <Skeleton className="h-9 w-24 loading-shimmer" />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="space-y-4 p-6">
            <div className="flex gap-4">
              <Skeleton className="h-9 w-64 loading-shimmer" />
              <Skeleton className="h-9 w-32 loading-shimmer" />
              <Skeleton className="h-9 w-32 loading-shimmer" />
            </div>
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 p-4 border border-cloud-gray rounded-lg"
                >
                  <Skeleton className="h-10 w-10 rounded-full loading-shimmer" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-48 loading-shimmer" />
                    <Skeleton className="h-3 w-32 loading-shimmer" />
                  </div>
                  <Skeleton className="h-6 w-16 loading-shimmer" />
                  <Skeleton className="h-8 w-8 loading-shimmer" />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        'bg-pure-white border-cloud-gray shadow-soft overflow-hidden',
        className
      )}
    >
      <CardHeader className="bg-snow-white border-b border-cloud-gray">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold text-rich-black">
              User Management
            </CardTitle>
            <p className="text-sm text-light-gray mt-1">
              Manage platform users and their permissions
            </p>
          </div>
          {/*<Button className="bg-bangladesh-green hover:bg-forest-green shadow-soft hover:shadow-medium transition-all duration-200">*/}
          {/*  <Plus className="h-4 w-4 mr-2" />*/}
          {/*  Add User*/}
          {/*</Button>*/}
        </div>
      </CardHeader>

      <CardContent>
        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-light-gray" />
            <Input
              placeholder="Search users by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-pure-white border-cloud-gray text-slate-gray placeholder:text-light-gray focus:ring-2 focus:ring-caribbean-green focus:border-transparent hover:border-slate-gray transition-colors"
            />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-full sm:w-40 bg-pure-white border-cloud-gray text-slate-gray hover:border-slate-gray">
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="project_creator">Project Creator</SelectItem>
              <SelectItem value="credit_buyer">Credit Buyer</SelectItem>
              <SelectItem value="verifier">Verifier</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-40 bg-pure-white border-cloud-gray text-slate-gray hover:border-slate-gray">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
          {/*<Button variant="outline" size="icon" className="border-cloud-gray text-slate-gray hover:bg-whisper-gray hover:text-rich-black">*/}
          {/*  <Download className="h-4 w-4" />*/}
          {/*</Button>*/}
        </div>

        {/* Table */}
        <div className="rounded-md border border-cloud-gray overflow-hidden">
          <Table>
            <TableHeader className="bg-whisper-gray">
              <TableRow className="border-cloud-gray hover:bg-transparent">
                <TableHead className="text-slate-gray font-medium py-4 px-6 first:pl-6 last:pr-6">
                  User
                </TableHead>
                <TableHead className="text-slate-gray font-medium py-4 px-6">
                  Role
                </TableHead>
                <TableHead className="text-slate-gray font-medium py-4 px-6">
                  Status
                </TableHead>
                {/*<TableHead className="text-slate-gray font-medium py-4 px-6">Details</TableHead>*/}
                <TableHead className="text-slate-gray font-medium py-4 px-6">
                  Joined
                </TableHead>
                <TableHead className="text-slate-gray font-medium py-4 px-6">
                  Last Active
                </TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!users || users.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center py-8 text-light-gray"
                  >
                    No users found matching your criteria
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow
                    key={user._id}
                    className="border-cloud-gray hover:bg-whisper-gray transition-colors duration-150"
                  >
                    <TableCell className="py-4 px-6 first:pl-6 last:pr-6">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={user.profileImage}
                            alt={user.name}
                          />
                          <AvatarFallback className="bg-green-500 text-white text-xs">
                            {`${user.firstName[0]}${user.lastName[0]}`}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm text-rich-black">
                            {user.name}
                          </p>
                          <p className="text-xs text-light-gray">
                            {user.email}
                          </p>
                          <p className="text-xs text-light-gray">
                            {user.organizationName}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 px-6">
                      <Badge
                        variant="outline"
                        className={cn(
                          'text-xs font-medium',
                          roleColors[user.role as keyof typeof roleColors]
                        )}
                      >
                        {getRoleDisplayName(user.role)}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-4 px-6">
                      <Badge
                        variant="outline"
                        className={cn(
                          'text-xs font-medium',
                          statusColors[user.status as keyof typeof statusColors]
                        )}
                      >
                        {user.status}
                      </Badge>
                    </TableCell>
                    {/*<TableCell className="py-4 px-6 text-sm text-slate-gray">*/}
                    {/*  <div>*/}
                    {/*    <div className="text-xs">{user.city}, {user.country}</div>*/}
                    {/*    {user.isVerified ? (*/}
                    {/*      <div className="text-xs text-green-600">✓ Verified</div>*/}
                    {/*    ) : (*/}
                    {/*      <div className="text-xs text-orange-600">Pending verification</div>*/}
                    {/*    )}*/}
                    {/*  </div>*/}
                    {/*</TableCell>*/}
                    <TableCell className="py-4 px-6 text-sm text-slate-gray">
                      {formatDate(user.registrationDate)}
                    </TableCell>
                    <TableCell className="py-4 px-6 text-sm text-slate-gray">
                      {formatDate(user.lastActive)}
                    </TableCell>
                    <TableCell className="py-4 px-6 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={() => onUserAction(user._id, 'view')}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit User
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => onUserAction(user._id, 'message')}
                          >
                            <Mail className="mr-2 h-4 w-4" />
                            Send Message
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {user.status === 'active' ? (
                            <DropdownMenuItem
                              onClick={() =>
                                onUserAction(user._id, 'deactivate')
                              }
                            >
                              <UserX className="mr-2 h-4 w-4" />
                              Deactivate User
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              onClick={() => onUserAction(user._id, 'activate')}
                            >
                              <UserCheck className="mr-2 h-4 w-4" />
                              Activate User
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => onUserAction(user._id, 'delete')}
                            className="text-red-600 focus:text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete User
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Table Footer */}
        <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
          <div>
            {users && users.length > 0
              ? `Showing ${users.length} users`
              : 'No users found'}
          </div>
          <div className="flex items-center gap-2">
            {canLoadMore && (
              <Button
                variant="outline"
                size="sm"
                onClick={loadMore}
                disabled={isLoadingMore}
              >
                {isLoadingMore ? 'Loading...' : 'Load More'}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};