"use client";

import {useState} from "react";

export default function MonitoringDashboard() {
    const [activeTab, setActiveTab] = useState('overview');

    const projects = [
        {
            id: 1,
            name: "Amazon Rainforest Conservation",
            progress: 75,
            nextReport: "2024-02-15",
            status: "On Track",
            creditsGenerated: 1125,
            totalCredits: 1500,
            lastUpdate: "2024-01-15"
        },
        {
            id: 2,
            name: "Solar Farm Initiative",
            progress: 45,
            nextReport: "2024-02-20",
            status: "Delayed",
            creditsGenerated: 1125,
            totalCredits: 2500,
            lastUpdate: "2024-01-10"
        },
        {
            id: 3,
            name: "Wind Power Project",
            progress: 90,
            nextReport: "2024-02-10",
            status: "Ahead",
            creditsGenerated: 1080,
            totalCredits: 1200,
            lastUpdate: "2024-01-18"
        }
    ];

    const monthlyReport = {
        totalProjects: 15,
        activeProjects: 12,
        creditsGenerated: 4500,
        projectsOnTime: 9,
        projectsDelayed: 3,
        averageProgress: 68
    };

    return (
        <div className="max-w-7xl mx-auto p-6">
            <h1 className="text-3xl font-bold mb-8">Project Monitoring Dashboard</h1>

            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-6 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow-md text-center">
                    <p className="text-2xl font-bold text-blue-600">{monthlyReport.totalProjects}</p>
                    <p className="text-sm text-gray-600">Total Projects</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md text-center">
                    <p className="text-2xl font-bold text-green-600">{monthlyReport.activeProjects}</p>
                    <p className="text-sm text-gray-600">Active Projects</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md text-center">
                    <p className="text-2xl font-bold text-purple-600">{monthlyReport.creditsGenerated}</p>
                    <p className="text-sm text-gray-600">Credits Generated</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md text-center">
                    <p className="text-2xl font-bold text-green-600">{monthlyReport.projectsOnTime}</p>
                    <p className="text-sm text-gray-600">On Schedule</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md text-center">
                    <p className="text-2xl font-bold text-red-600">{monthlyReport.projectsDelayed}</p>
                    <p className="text-sm text-gray-600">Delayed</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md text-center">
                    <p className="text-2xl font-bold text-yellow-600">{monthlyReport.averageProgress}%</p>
                    <p className="text-sm text-gray-600">Avg Progress</p>
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
                            Project Overview
                        </button>
                        <button
                            onClick={() => setActiveTab('reports')}
                            className={`px-6 py-4 text-sm font-medium ${activeTab === 'reports' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
                        >
                            Progress Reports
                        </button>
                        <button
                            onClick={() => setActiveTab('alerts')}
                            className={`px-6 py-4 text-sm font-medium ${activeTab === 'alerts' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
                        >
                            Alerts & Notifications
                        </button>
                    </nav>
                </div>

                <div className="p-6">
                    {/* Project Overview Tab */}
                    {activeTab === 'overview' && (
                        <div className="space-y-6">
                            {projects.map(project => (
                                <div key={project.id} className="border rounded-lg p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex-1">
                                            <h3 className="text-xl font-semibold">{project.name}</h3>
                                            <div className="flex items-center gap-4 mt-2">
                        <span className={`px-3 py-1 rounded text-sm ${
                            project.status === 'On Track' ? 'bg-green-100 text-green-800' :
                                project.status === 'Delayed' ? 'bg-red-100 text-red-800' :
                                    'bg-blue-100 text-blue-800'
                        }`}>
                          {project.status}
                        </span>
                                                <span className="text-sm text-gray-600">
                          Last update: {new Date(project.lastUpdate).toLocaleDateString()}
                        </span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-lg font-semibold">{project.progress}%</p>
                                            <p className="text-sm text-gray-600">Complete</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                                        <div>
                                            <p className="text-sm text-gray-600 mb-1">Progress</p>
                                            <div className="w-full bg-gray-200 rounded-full h-3">
                                                <div
                                                    className="bg-blue-600 h-3 rounded-full"
                                                    style={{width: `${project.progress}%`}}
                                                ></div>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1">{project.progress}% complete</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 mb-1">Credits Generated</p>
                                            <p className="text-lg font-semibold">{project.creditsGenerated}</p>
                                            <p className="text-xs text-gray-500">of {project.totalCredits} total</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 mb-1">Next Report Due</p>
                                            <p className="text-lg font-semibold">{new Date(project.nextReport).toLocaleDateString()}</p>
                                            <p className="text-xs text-gray-500">Monthly report</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-3">
                                        <button className="bg-blue-600 text-white px-4 py-2 rounded text-sm">
                                            View Details
                                        </button>
                                        <button className="bg-green-600 text-white px-4 py-2 rounded text-sm">
                                            Submit Update
                                        </button>
                                        <button className="bg-gray-300 text-gray-700 px-4 py-2 rounded text-sm">
                                            Generate Report
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Progress Reports Tab */}
                    {activeTab === 'reports' && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-semibold">Recent Progress Reports</h3>
                                <button className="bg-blue-600 text-white px-4 py-2 rounded">
                                    Generate Monthly Report
                                </button>
                            </div>

                            <div className="grid gap-4">
                                {[
                                    {
                                        project: "Amazon Rainforest Conservation",
                                        date: "2024-01-15",
                                        type: "Monthly",
                                        status: "Submitted"
                                    },
                                    {
                                        project: "Solar Farm Initiative",
                                        date: "2024-01-10",
                                        type: "Monthly",
                                        status: "Overdue"
                                    },
                                    {
                                        project: "Wind Power Project",
                                        date: "2024-01-18",
                                        type: "Milestone",
                                        status: "Submitted"
                                    }
                                ].map((report, index) => (
                                    <div key={index} className="border rounded p-4">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <p className="font-medium">{report.project}</p>
                                                <p className="text-sm text-gray-600">{report.type} Report
                                                    - {new Date(report.date).toLocaleDateString()}</p>
                                            </div>
                                            <div className="flex items-center gap-3">
                        <span className={`px-2 py-1 rounded text-sm ${
                            report.status === 'Submitted' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {report.status}
                        </span>
                                                <button className="text-blue-600 hover:underline">View</button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Alerts & Notifications Tab */}
                    {activeTab === 'alerts' && (
                        <div className="space-y-6">
                            <h3 className="text-lg font-semibold">Active Alerts</h3>

                            <div className="space-y-4">
                                {[
                                    {
                                        type: "warning",
                                        message: "Solar Farm Initiative is 2 weeks behind schedule",
                                        date: "2024-01-20",
                                        priority: "High"
                                    },
                                    {
                                        type: "info",
                                        message: "Monthly report reminder for 3 projects due this week",
                                        date: "2024-01-18",
                                        priority: "Medium"
                                    },
                                    {
                                        type: "success",
                                        message: "Wind Power Project completed Phase 2 milestone",
                                        date: "2024-01-17",
                                        priority: "Low"
                                    },
                                    {
                                        type: "error",
                                        message: "Missing environmental data for Amazon project",
                                        date: "2024-01-16",
                                        priority: "High"
                                    }
                                ].map((alert, index) => (
                                    <div key={index} className={`border-l-4 p-4 rounded ${
                                        alert.type === 'error' ? 'border-red-500 bg-red-50' :
                                            alert.type === 'warning' ? 'border-yellow-500 bg-yellow-50' :
                                                alert.type === 'success' ? 'border-green-500 bg-green-50' :
                                                    'border-blue-500 bg-blue-50'
                                    }`}>
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <p className="font-medium">{alert.message}</p>
                                                <p className="text-sm text-gray-600 mt-1">{new Date(alert.date).toLocaleDateString()}</p>
                                            </div>
                                            <div className="flex items-center gap-3">
                        <span className={`px-2 py-1 rounded text-sm ${
                            alert.priority === 'High' ? 'bg-red-100 text-red-800' :
                                alert.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-gray-100 text-gray-800'
                        }`}>
                          {alert.priority}
                        </span>
                                                <button className="text-blue-600 hover:underline text-sm">
                                                    Resolve
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}