"use client";

import React, { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Search,
  Filter,
  Download,
  MoreHorizontal,
  ChevronUp,
  ChevronDown,
  UserCheck,
  UserX,
  Mail,
  Edit,
  Trash2,
  Plus
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { User, UserRole } from '@/types/global.types';

interface UserWithDetails extends User {
  registrationDate: Date;
  lastActive: Date;
  totalPurchases?: number;
  totalProjects?: number;
  verificationCount?: number;
  status: 'active' | 'inactive' | 'suspended';
}

interface UserManagementTableProps {
  users?: UserWithDetails[];
  loading?: boolean;
  onUserAction?: (userId: string, action: string) => void;
  className?: string;
}

const roleColors: Record<UserRole, string> = {
  creator: 'text-info-primary bg-info-light border-info-border',
  buyer: 'text-success-primary bg-success-light border-success-border',
  verifier: 'text-bangladesh-green bg-mint-green border-sage-green',
  admin: 'text-error-primary bg-error-light border-error-border',
};

const statusColors = {
  active: 'text-success-primary bg-success-light border-success-border',
  inactive: 'text-slate-gray bg-whisper-gray border-cloud-gray',
  suspended: 'text-error-primary bg-error-light border-error-border',
};

// Mock data for demo purposes
const mockUsers: UserWithDetails[] = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john.smith@email.com',
    role: 'creator',
    avatar: '',
    registrationDate: new Date('2024-01-15'),
    lastActive: new Date('2024-09-25'),
    totalProjects: 3,
    status: 'active'
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah.j@company.com',
    role: 'buyer',
    avatar: '',
    registrationDate: new Date('2024-02-20'),
    lastActive: new Date('2024-09-26'),
    totalPurchases: 150,
    status: 'active'
  },
  {
    id: '3',
    name: 'Dr. Michael Chen',
    email: 'm.chen@verification.org',
    role: 'verifier',
    avatar: '',
    registrationDate: new Date('2024-01-10'),
    lastActive: new Date('2024-09-24'),
    verificationCount: 45,
    status: 'active'
  },
  {
    id: '4',
    name: 'Emma Williams',
    email: 'emma.w@email.com',
    role: 'creator',
    avatar: '',
    registrationDate: new Date('2024-03-05'),
    lastActive: new Date('2024-09-20'),
    totalProjects: 1,
    status: 'inactive'
  },
  {
    id: '5',
    name: 'Robert Brown',
    email: 'r.brown@suspended.com',
    role: 'buyer',
    avatar: '',
    registrationDate: new Date('2024-02-15'),
    lastActive: new Date('2024-08-15'),
    totalPurchases: 25,
    status: 'suspended'
  }
];

export const UserManagementTable: React.FC<UserManagementTableProps> = ({
  users = mockUsers,
  loading = false,
  onUserAction = () => {},
  className
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<keyof UserWithDetails>('registrationDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const filteredAndSortedUsers = useMemo(() => {
    let filtered = users.filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           user.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      const matchesStatus = statusFilter === 'all' || user.status === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });

    return filtered.sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [users, searchQuery, roleFilter, statusFilter, sortField, sortDirection]);

  const handleSort = (field: keyof UserWithDetails) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  const getActivityMetric = (user: UserWithDetails) => {
    switch (user.role) {
      case 'creator':
        return `${user.totalProjects || 0} projects`;
      case 'buyer':
        return `${user.totalPurchases || 0} credits`;
      case 'verifier':
        return `${user.verificationCount || 0} reviews`;
      default:
        return '-';
    }
  };

  if (loading) {
    return (
      <Card className={cn('bg-pure-white border-cloud-gray shadow-soft', className)}>
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
                <div key={i} className="flex items-center gap-4 p-4 border border-cloud-gray rounded-lg">
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
    <Card className={cn('bg-pure-white border-cloud-gray shadow-soft overflow-hidden', className)}>
      <CardHeader className="bg-snow-white border-b border-cloud-gray">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold text-rich-black">User Management</CardTitle>
            <p className="text-sm text-light-gray mt-1">
              Manage platform users and their permissions
            </p>
          </div>
          <Button className="bg-bangladesh-green hover:bg-forest-green shadow-soft hover:shadow-medium transition-all duration-200">
            <Plus className="h-4 w-4 mr-2" />
            Add User
          </Button>
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
              <SelectItem value="creator">Creator</SelectItem>
              <SelectItem value="buyer">Buyer</SelectItem>
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
              <SelectItem value="suspended">Suspended</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" className="border-cloud-gray text-slate-gray hover:bg-whisper-gray hover:text-rich-black">
            <Download className="h-4 w-4" />
          </Button>
        </div>

        {/* Table */}
        <div className="rounded-md border border-cloud-gray overflow-hidden">
          <Table>
            <TableHeader className="bg-whisper-gray">
              <TableRow className="border-cloud-gray hover:bg-transparent">
                <TableHead className="text-slate-gray font-medium py-4 px-6 first:pl-6 last:pr-6">User</TableHead>
                <TableHead className="text-slate-gray font-medium py-4 px-6">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort('role')}
                    className="h-auto p-0 font-medium text-slate-gray hover:text-rich-black"
                  >
                    Role
                    {sortField === 'role' && (
                      sortDirection === 'asc' ? (
                        <ChevronUp className="ml-1 h-3 w-3" />
                      ) : (
                        <ChevronDown className="ml-1 h-3 w-3" />
                      )
                    )}
                  </Button>
                </TableHead>
                <TableHead className="text-slate-gray font-medium py-4 px-6">Status</TableHead>
                <TableHead className="text-slate-gray font-medium py-4 px-6">Activity</TableHead>
                <TableHead className="text-slate-gray font-medium py-4 px-6">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort('registrationDate')}
                    className="h-auto p-0 font-medium text-slate-gray hover:text-rich-black"
                  >
                    Joined
                    {sortField === 'registrationDate' && (
                      sortDirection === 'asc' ? (
                        <ChevronUp className="ml-1 h-3 w-3" />
                      ) : (
                        <ChevronDown className="ml-1 h-3 w-3" />
                      )
                    )}
                  </Button>
                </TableHead>
                <TableHead className="text-slate-gray font-medium py-4 px-6">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort('lastActive')}
                    className="h-auto p-0 font-medium text-slate-gray hover:text-rich-black"
                  >
                    Last Active
                    {sortField === 'lastActive' && (
                      sortDirection === 'asc' ? (
                        <ChevronUp className="ml-1 h-3 w-3" />
                      ) : (
                        <ChevronDown className="ml-1 h-3 w-3" />
                      )
                    )}
                  </Button>
                </TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-light-gray">
                    No users found matching your criteria
                  </TableCell>
                </TableRow>
              ) : (
                filteredAndSortedUsers.map((user) => (
                  <TableRow key={user.id} className="border-cloud-gray hover:bg-whisper-gray transition-colors duration-150">
                    <TableCell className="py-4 px-6 first:pl-6 last:pr-6">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.avatar} alt={user.name} />
                          <AvatarFallback className="bg-bangladesh-green text-white text-xs">
                            {user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm text-rich-black">{user.name}</p>
                          <p className="text-xs text-light-gray">{user.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 px-6">
                      <Badge
                        variant="outline"
                        className={cn('text-xs font-medium capitalize', roleColors[user.role])}
                      >
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-4 px-6">
                      <Badge
                        variant="outline"
                        className={cn('text-xs font-medium capitalize', statusColors[user.status])}
                      >
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-4 px-6 text-sm text-slate-gray">
                      {getActivityMetric(user)}
                    </TableCell>
                    <TableCell className="py-4 px-6 text-sm text-slate-gray">
                      {formatDate(user.registrationDate)}
                    </TableCell>
                    <TableCell className="py-4 px-6 text-sm text-slate-gray">
                      {formatDate(user.lastActive)}
                    </TableCell>
                    <TableCell className="py-4 px-6 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => onUserAction(user.id, 'view')}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit User
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onUserAction(user.id, 'message')}>
                            <Mail className="mr-2 h-4 w-4" />
                            Send Message
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {user.status === 'active' ? (
                            <DropdownMenuItem onClick={() => onUserAction(user.id, 'suspend')}>
                              <UserX className="mr-2 h-4 w-4" />
                              Suspend User
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem onClick={() => onUserAction(user.id, 'activate')}>
                              <UserCheck className="mr-2 h-4 w-4" />
                              Activate User
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => onUserAction(user.id, 'delete')}
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
            Showing {filteredAndSortedUsers.length} of {users.length} users
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled>
              Previous
            </Button>
            <Button variant="outline" size="sm" disabled>
              Next
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};