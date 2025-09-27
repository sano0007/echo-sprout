'use client';

import { useState } from 'react';
import {
  BarChart3,
  Calendar,
  CheckCircle,
  Clock,
  DollarSign,
  Edit,
  Eye,
  FileText,
  Plus,
  Target,
  TrendingUp,
  Upload,
  Users,
  Download,
  Monitor
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ProgressSubmissionForm from "@/components/monitoring/ProgressSubmissionForm";

export default function CreatorDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [showProgressModal, setShowProgressModal] = useState(false);

  // Mock data for project creator
  const creatorStats = {
    totalProjects: 8,
    activeProjects: 5,
    completedProjects: 3,
    totalCreditsGenerated: 1250,
    totalRevenue: 31250,
    pendingReports: 2,
    upcomingMilestones: 4
  };

  const projects = [
    {
      id: 1,
      title: 'Amazon Rainforest Conservation',
      type: 'reforestation',
      status: 'active',
      progress: 75,
      creditsGenerated: 450,
      creditsTarget: 600,
      revenue: 11250,
      startDate: '2024-01-15',
      endDate: '2026-01-15',
      lastUpdate: '2024-09-20',
      nextMilestone: 'Monthly Report Due',
      milestoneDue: '2024-10-01',
      buyers: 12,
      location: 'Amazon Basin, Brazil',
      impact: {
        treesPlanted: 2500,
        co2Sequestered: 675,
        hectaresRestored: 45
      }
    },
    {
      id: 2,
      title: 'Solar Farm Initiative',
      type: 'renewable_energy',
      status: 'active',
      progress: 60,
      creditsGenerated: 300,
      creditsTarget: 500,
      revenue: 7500,
      startDate: '2024-03-01',
      endDate: '2025-03-01',
      lastUpdate: '2024-09-18',
      nextMilestone: 'Installation Phase Complete',
      milestoneDue: '2024-10-15',
      buyers: 8,
      location: 'Rajasthan, India',
      impact: {
        energyGenerated: 450000,
        co2Avoided: 450,
        householdsPowered: 150
      }
    },
    {
      id: 3,
      title: 'Wind Power Project',
      type: 'renewable_energy',
      status: 'completed',
      progress: 100,
      creditsGenerated: 500,
      creditsTarget: 500,
      revenue: 12500,
      startDate: '2023-06-01',
      endDate: '2024-06-01',
      lastUpdate: '2024-06-01',
      nextMilestone: 'Project Completed',
      milestoneDue: null,
      buyers: 15,
      location: 'Tamil Nadu, India',
      impact: {
        energyGenerated: 750000,
        co2Avoided: 750,
        householdsPowered: 250
      }
    }
  ];

  const pendingTasks = [
    {
      id: 1,
      task: 'Submit Monthly Progress Report',
      project: 'Amazon Rainforest Conservation',
      dueDate: '2024-10-01',
      priority: 'high',
      type: 'report'
    },
    {
      id: 2,
      task: 'Upload Verification Documents',
      project: 'Solar Farm Initiative',
      dueDate: '2024-09-30',
      priority: 'medium',
      type: 'verification'
    },
    {
      id: 3,
      task: 'Update Project Photos',
      project: 'Amazon Rainforest Conservation',
      dueDate: '2024-10-05',
      priority: 'low',
      type: 'documentation'
    },
    {
      id: 4,
      task: 'Milestone Review Meeting',
      project: 'Solar Farm Initiative',
      dueDate: '2024-10-15',
      priority: 'medium',
      type: 'meeting'
    }
  ];

  const recentActivity = [
    {
      id: 1,
      action: 'Progress report submitted',
      project: 'Wind Power Project',
      timestamp: '2 hours ago',
      type: 'success'
    },
    {
      id: 2,
      action: 'Verification approved',
      project: 'Amazon Rainforest Conservation',
      timestamp: '1 day ago',
      type: 'success'
    },
    {
      id: 3,
      action: 'Monthly report overdue',
      project: 'Solar Farm Initiative',
      timestamp: '3 days ago',
      type: 'warning'
    },
    {
      id: 4,
      action: 'New buyer registered',
      project: 'Amazon Rainforest Conservation',
      timestamp: '1 week ago',
      type: 'info'
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'completed':
        return <Badge className="bg-blue-100 text-blue-800">Completed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'suspended':
        return <Badge className="bg-red-100 text-red-800">Suspended</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive">High</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>;
      case 'low':
        return <Badge className="bg-green-100 text-green-800">Low</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  const getProjectTypeIcon = (type: string) => {
    switch (type) {
      case 'reforestation':
        return '🌳';
      case 'renewable_energy':
        return '⚡';
      case 'waste_management':
        return '♻️';
      case 'water_conservation':
        return '💧';
      default:
        return '🌍';
    }
  };

  const handleProgressSubmission = async (data: any) => {
    try {
      console.log('Progress submission data:', data);
      // Here you would call the backend API to submit progress
      // await submitProgressUpdate(data);
      setShowProgressModal(false);
      setSelectedProject(null);
      // Show success message
    } catch (error) {
      console.error('Error submitting progress:', error);
      // Show error message
    }
  };

  const openProgressModal = (project: any) => {
    setSelectedProject(project);
    setShowProgressModal(true);
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Project Creator Dashboard</h1>
          <p className="text-gray-600">Manage your carbon credit projects and track performance</p>
        </div>
        <Button className="bg-green-600 hover:bg-green-700">
          <Plus className="w-4 h-4 mr-2" />
          Create New Project
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{creatorStats.totalProjects}</p>
                <p className="text-sm text-gray-600">Total Projects</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Target className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{creatorStats.activeProjects}</p>
                <p className="text-sm text-gray-600">Active Projects</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{creatorStats.completedProjects}</p>
                <p className="text-sm text-gray-600">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{creatorStats.totalCreditsGenerated.toLocaleString()}</p>
                <p className="text-sm text-gray-600">Credits Generated</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">₹{creatorStats.totalRevenue.toLocaleString()}</p>
                <p className="text-sm text-gray-600">Total Revenue</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{creatorStats.pendingReports}</p>
                <p className="text-sm text-gray-600">Pending Reports</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{creatorStats.upcomingMilestones}</p>
                <p className="text-sm text-gray-600">Upcoming Milestones</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="projects">My Projects</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
          <TabsTrigger value="tasks">Tasks & Reports</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Project Status Overview */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Project Performance Overview</CardTitle>
                <CardDescription>Progress and performance of your active projects</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {projects.filter(p => p.status === 'active').map((project) => (
                    <div key={project.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{getProjectTypeIcon(project.type)}</span>
                          <div>
                            <h3 className="font-semibold">{project.title}</h3>
                            <p className="text-sm text-gray-600">{project.location}</p>
                          </div>
                        </div>
                        {getStatusBadge(project.status)}
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-3">
                        <div>
                          <p className="text-sm text-gray-600">Progress</p>
                          <div className="flex items-center gap-2">
                            <Progress value={project.progress} className="flex-1" />
                            <span className="text-sm font-medium">{project.progress}%</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Credits Generated</p>
                          <p className="text-lg font-semibold">{project.creditsGenerated}/{project.creditsTarget}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {project.buyers} buyers
                          </span>
                          <span className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            ₹{project.revenue.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                          <Button size="sm" variant="outline">
                            <Edit className="w-4 h-4 mr-1" />
                            Update
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity & Pending Tasks */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Pending Tasks</CardTitle>
                  <CardDescription>Important tasks requiring your attention</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {pendingTasks.slice(0, 4).map((task) => (
                      <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{task.task}</p>
                          <p className="text-xs text-gray-600">{task.project}</p>
                          <p className="text-xs text-gray-500">Due: {task.dueDate}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {getPriorityBadge(task.priority)}
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" className="w-full mt-4">
                    View All Tasks
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Latest updates from your projects</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${
                          activity.type === 'success' ? 'bg-green-500' :
                          activity.type === 'warning' ? 'bg-yellow-500' :
                          activity.type === 'info' ? 'bg-blue-500' : 'bg-gray-500'
                        }`} />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{activity.action}</p>
                          <p className="text-xs text-gray-600">{activity.project}</p>
                          <p className="text-xs text-gray-500">{activity.timestamp}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="projects">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>My Projects</CardTitle>
                  <CardDescription>Manage and monitor all your carbon credit projects</CardDescription>
                </div>
                <Button className="bg-green-600 hover:bg-green-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Project
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {projects.map((project) => (
                  <Card key={project.id} className="border">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <span className="text-3xl">{getProjectTypeIcon(project.type)}</span>
                          <div>
                            <h3 className="font-semibold text-lg">{project.title}</h3>
                            <p className="text-sm text-gray-600">{project.location}</p>
                          </div>
                        </div>
                        {getStatusBadge(project.status)}
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-600">Progress</p>
                          <div className="flex items-center gap-2">
                            <Progress value={project.progress} className="flex-1" />
                            <span className="text-sm font-medium">{project.progress}%</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Revenue</p>
                          <p className="text-lg font-semibold text-green-600">₹{project.revenue.toLocaleString()}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-600">Credits</p>
                          <p className="font-medium">{project.creditsGenerated}/{project.creditsTarget}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Buyers</p>
                          <p className="font-medium">{project.buyers}</p>
                        </div>
                      </div>

                      {project.nextMilestone && (
                        <div className="mb-4 p-3 bg-yellow-50 rounded-lg">
                          <p className="text-sm font-medium text-yellow-800">Next Milestone</p>
                          <p className="text-sm text-yellow-600">{project.nextMilestone}</p>
                          {project.milestoneDue && (
                            <p className="text-xs text-yellow-500">Due: {project.milestoneDue}</p>
                          )}
                        </div>
                      )}

                      <div className="flex justify-between items-center">
                        <p className="text-sm text-gray-500">Last updated: {project.lastUpdate}</p>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Upload className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitoring">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="h-5 w-5" />
                  Submit Progress Update
                </CardTitle>
                <CardDescription>Submit your monthly progress report and tracking data</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    {projects.filter(p => p.status === 'active').map((project) => (
                      <div key={project.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{getProjectTypeIcon(project.type)}</span>
                            <div>
                              <h3 className="font-semibold">{project.title}</h3>
                              <p className="text-sm text-gray-600">{project.location}</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="bg-blue-600 hover:bg-blue-700"
                              onClick={() => openProgressModal(project)}
                            >
                              <Upload className="w-4 h-4 mr-1" />
                              Submit Update
                            </Button>
                          </div>
                        </div>
                        <div className="text-sm text-gray-500">
                          Last update: {project.lastUpdate}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Monitoring Requirements</CardTitle>
                <CardDescription>Key requirements for project monitoring and tracking</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-800 mb-2">Monthly Progress Reports</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Submit by the 5th of each month</li>
                      <li>• Include progress percentage updates</li>
                      <li>• Provide photo/video evidence</li>
                      <li>• Report environmental measurements</li>
                    </ul>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-green-800 mb-2">Milestone Tracking</h4>
                    <ul className="text-sm text-green-700 space-y-1">
                      <li>• Track 25%, 50%, 75%, 100% completion</li>
                      <li>• Document milestone achievements</li>
                      <li>• Report any delays immediately</li>
                      <li>• Maintain timeline compliance</li>
                    </ul>
                  </div>

                  <div className="bg-orange-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-orange-800 mb-2">Impact Measurement</h4>
                    <ul className="text-sm text-orange-700 space-y-1">
                      <li>• Trees planted (for reforestation)</li>
                      <li>• Energy generated (for renewable)</li>
                      <li>• CO2 sequestered/avoided</li>
                      <li>• Location data and verification</li>
                    </ul>
                  </div>

                  <div className="bg-red-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-red-800 mb-2">Quality Standards</h4>
                    <ul className="text-sm text-red-700 space-y-1">
                      <li>• High-quality photo documentation</li>
                      <li>• Accurate measurement data</li>
                      <li>• Consistent reporting format</li>
                      <li>• Third-party verification support</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Monitoring Dashboard Overview</CardTitle>
                <CardDescription>Track your progress submission history and compliance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">95%</div>
                    <div className="text-sm text-gray-600">On-time Submissions</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">24</div>
                    <div className="text-sm text-gray-600">Total Reports Submitted</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">8</div>
                    <div className="text-sm text-gray-600">Milestones Achieved</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">100%</div>
                    <div className="text-sm text-gray-600">Verification Rate</div>
                  </div>
                </div>

                <div className="mt-6">
                  <h4 className="font-semibold mb-3">Recent Submissions</h4>
                  <div className="space-y-3">
                    {[
                      { project: 'Amazon Rainforest Conservation', date: '2024-09-20', status: 'Verified', type: 'Monthly Report' },
                      { project: 'Solar Farm Initiative', date: '2024-09-18', status: 'Under Review', type: 'Progress Update' },
                      { project: 'Amazon Rainforest Conservation', date: '2024-08-20', status: 'Verified', type: 'Monthly Report' },
                    ].map((submission, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{submission.project}</p>
                          <p className="text-xs text-gray-600">{submission.type} - {submission.date}</p>
                        </div>
                        <div>
                          {submission.status === 'Verified' ? (
                            <Badge className="bg-green-100 text-green-800">Verified</Badge>
                          ) : (
                            <Badge className="bg-yellow-100 text-yellow-800">Under Review</Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tasks">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Pending Tasks</CardTitle>
                <CardDescription>Tasks that require your immediate attention</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingTasks.map((task) => (
                    <div key={task.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          {task.type === 'report' && <FileText className="w-5 h-5 text-blue-600" />}
                          {task.type === 'verification' && <CheckCircle className="w-5 h-5 text-green-600" />}
                          {task.type === 'documentation' && <Upload className="w-5 h-5 text-orange-600" />}
                          {task.type === 'meeting' && <Calendar className="w-5 h-5 text-purple-600" />}
                          <div>
                            <h3 className="font-medium">{task.task}</h3>
                            <p className="text-sm text-gray-600">{task.project}</p>
                          </div>
                        </div>
                        {getPriorityBadge(task.priority)}
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-500">Due: {task.dueDate}</p>
                        <Button size="sm">Complete Task</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Upcoming Reports</CardTitle>
                <CardDescription>Scheduled reports and deadlines</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">Monthly Progress Report</h3>
                      <Badge className="bg-yellow-100 text-yellow-800">Due Soon</Badge>
                    </div>
                    <p className="text-sm text-gray-600">Amazon Rainforest Conservation</p>
                    <p className="text-sm text-gray-500">Due: October 1, 2024</p>
                    <div className="flex gap-2 mt-3">
                      <Button size="sm" variant="outline">
                        <FileText className="w-4 h-4 mr-1" />
                        Submit Report
                      </Button>
                      <Button size="sm" variant="outline">
                        <Download className="w-4 h-4 mr-1" />
                        Template
                      </Button>
                    </div>
                  </div>

                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">Quarterly Impact Assessment</h3>
                      <Badge className="bg-green-100 text-green-800">On Track</Badge>
                    </div>
                    <p className="text-sm text-gray-600">Solar Farm Initiative</p>
                    <p className="text-sm text-gray-500">Due: October 31, 2024</p>
                    <div className="flex gap-2 mt-3">
                      <Button size="sm" variant="outline">
                        <FileText className="w-4 h-4 mr-1" />
                        Start Report
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Analytics</CardTitle>
                <CardDescription>Track your revenue growth over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
                  <p className="text-gray-500">Revenue chart will be displayed here</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Credits Generated</CardTitle>
                <CardDescription>Carbon credits generated by project type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
                  <p className="text-gray-500">Credits chart will be displayed here</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Project Performance</CardTitle>
                <CardDescription>Compare progress across all projects</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {projects.map((project) => (
                    <div key={project.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{getProjectTypeIcon(project.type)}</span>
                        <div>
                          <p className="font-medium text-sm">{project.title}</p>
                          <div className="flex items-center gap-2">
                            <Progress value={project.progress} className="w-24 h-2" />
                            <span className="text-xs text-gray-500">{project.progress}%</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">₹{project.revenue.toLocaleString()}</p>
                        <p className="text-xs text-gray-500">{project.creditsGenerated} credits</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Environmental Impact</CardTitle>
                <CardDescription>Your contribution to environmental conservation</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4">
                  <div className="bg-green-50 p-4 rounded-lg text-center">
                    <p className="text-2xl font-bold text-green-600">2,500</p>
                    <p className="text-sm text-gray-600">Trees Planted</p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg text-center">
                    <p className="text-2xl font-bold text-blue-600">1,875</p>
                    <p className="text-sm text-gray-600">Tons CO₂ Reduced</p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg text-center">
                    <p className="text-2xl font-bold text-purple-600">1,200,000</p>
                    <p className="text-sm text-gray-600">kWh Clean Energy</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Settings</CardTitle>
                <CardDescription>Manage your creator profile information</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Organization Name</label>
                    <input
                      type="text"
                      className="w-full mt-1 px-3 py-2 border rounded-md"
                      placeholder="Your organization name"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Contact Email</label>
                    <input
                      type="email"
                      className="w-full mt-1 px-3 py-2 border rounded-md"
                      placeholder="contact@organization.com"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Description</label>
                    <textarea
                      className="w-full mt-1 px-3 py-2 border rounded-md"
                      rows={3}
                      placeholder="Brief description of your organization"
                    />
                  </div>
                  <Button className="w-full">Update Profile</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
                <CardDescription>Configure your notification preferences</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Email Notifications</p>
                      <p className="text-sm text-gray-600">Receive updates via email</p>
                    </div>
                    <Button variant="outline" size="sm">Toggle</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Report Reminders</p>
                      <p className="text-sm text-gray-600">Get reminded about due reports</p>
                    </div>
                    <Button variant="outline" size="sm">Toggle</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Milestone Alerts</p>
                      <p className="text-sm text-gray-600">Alerts for upcoming milestones</p>
                    </div>
                    <Button variant="outline" size="sm">Toggle</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Buyer Communications</p>
                      <p className="text-sm text-gray-600">Messages from credit buyers</p>
                    </div>
                    <Button variant="outline" size="sm">Toggle</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Progress Submission Modal */}
      <Dialog open={showProgressModal} onOpenChange={setShowProgressModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Submit Progress Update</DialogTitle>
            <DialogDescription>
              {selectedProject && `Submit progress update for ${selectedProject.title}`}
            </DialogDescription>
          </DialogHeader>
          {selectedProject && (
            <ProgressSubmissionForm
              projectId={selectedProject.id.toString()}
              projectType={selectedProject.type}
              onSubmit={handleProgressSubmission}
              onCancel={() => setShowProgressModal(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}