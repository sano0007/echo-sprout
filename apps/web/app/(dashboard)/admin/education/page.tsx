'use client';

import { useState } from 'react';
import { Edit, Plus, MoreHorizontal, Check, X, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@packages/backend';

interface LearningPath {
  id: string;
  title: string;
  description: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  estimatedDuration: number;
  moduleCount: number;
  status: 'published' | 'draft';
  isPublished: boolean;
  createdByName: string;
  enrollmentCount?: number;
  publishedAt?: string | null;
  lastUpdatedAt: number;
}

const LearningPathsTable = () => {
  const learningPaths = useQuery(api.learn.listLearningPaths) || [];
  const updateLearningPath = useMutation(api.learn.updateLearningPath);
  const deleteLearningPath = useMutation(api.learn.deleteLearningPath);

  const [editingId, setEditingId] = useState<string | null>(null);

  const handleApprove = async (pathId: string) => {
    try {
      await updateLearningPath({
        id: pathId,
        publish: true,
      });
    } catch (error) {
      console.error('Failed to approve learning path:', error);
    }
  };

  const handleReject = async (pathId: string) => {
    try {
      await updateLearningPath({
        id: pathId,
        publish: false,
      });
    } catch (error) {
      console.error('Failed to reject learning path:', error);
    }
  };

  const handleDelete = async (pathId: string) => {
    if (confirm('Are you sure you want to delete this learning path?')) {
      try {
        await deleteLearningPath({ id: pathId });
      } catch (error) {
        console.error('Failed to delete learning path:', error);
      }
    }
  };

  const getLevelBadgeColor = (level: string) => {
    switch (level) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusBadgeColor = (isPublished: boolean) => {
    return isPublished
      ? 'bg-green-100 text-green-800'
      : 'bg-gray-100 text-gray-800';
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Learning Paths</CardTitle>
            <CardDescription>
              Manage and approve learning paths for the education hub
            </CardDescription>
          </div>
          <Button className="bg-green-600 hover:bg-green-700">
            <Plus className="w-4 h-4 mr-2" />
            Add Learning Path
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Level</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Modules</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created By</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {learningPaths.map((path) => (
              <TableRow key={path.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{path.title}</div>
                    <div className="text-sm text-gray-500 truncate max-w-xs">
                      {path.description}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={getLevelBadgeColor(path.level)}>
                    {path.level}
                  </Badge>
                </TableCell>
                <TableCell>{formatDuration(path.estimatedDuration)}</TableCell>
                <TableCell>{path.moduleCount}</TableCell>
                <TableCell>
                  <Badge className={getStatusBadgeColor(path.isPublished)}>
                    {path.isPublished ? 'Published' : 'Draft'}
                  </Badge>
                </TableCell>
                <TableCell>{path.createdByName || 'Unknown'}</TableCell>
                <TableCell>{formatDate(path.lastUpdatedAt)}</TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    {!path.isPublished && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-green-600 border-green-600 hover:bg-green-50"
                        onClick={() => handleApprove(path.id)}
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                    )}
                    {path.isPublished && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-yellow-600 border-yellow-600 hover:bg-yellow-50"
                        onClick={() => handleReject(path.id)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => handleDelete(path.id)}
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

const EducationAnalytics = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Education Analytics</CardTitle>
        <CardDescription>
          View analytics and insights about the education hub
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-6 bg-green-50 rounded-lg">
            <h3 className="text-2xl font-bold text-green-600">24</h3>
            <p className="text-sm text-gray-600">Total Learning Paths</p>
          </div>
          <div className="text-center p-6 bg-blue-50 rounded-lg">
            <h3 className="text-2xl font-bold text-blue-600">156</h3>
            <p className="text-sm text-gray-600">Active Learners</p>
          </div>
          <div className="text-center p-6 bg-purple-50 rounded-lg">
            <h3 className="text-2xl font-bold text-purple-600">89%</h3>
            <p className="text-sm text-gray-600">Completion Rate</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default function EducationHubPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Education Hub Management</h1>
        <p className="text-gray-600">
          Manage learning paths, courses, and educational content
        </p>
      </div>

      <Tabs defaultValue="learning-paths" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="learning-paths">Learning Paths</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="learning-paths">
          <LearningPathsTable />
        </TabsContent>

        <TabsContent value="analytics">
          <EducationAnalytics />
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Education Hub Settings</CardTitle>
              <CardDescription>
                Configure settings for the education hub
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">Settings panel coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
