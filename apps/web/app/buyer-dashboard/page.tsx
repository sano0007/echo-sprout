"use client";

import {useState} from "react";

export default function BuyerDashboard() {
    const [activeTab, setActiveTab] = useState('overview');

    const purchaseHistory = [
        {
            id: 1,
            project: "Amazon Rainforest Conservation",
            credits: 50,
            price: 15,
            purchaseDate: "2024-01-10",
            certificateId: "ARF-2024-001",
            status: "Active",
            impact: {co2Offset: 75, treesPlanted: 125}
        },
        {
            id: 2,
            project: "Solar Farm Initiative",
            credits: 25,
            price: 12,
            purchaseDate: "2024-01-05",
            certificateId: "SFI-2024-002",
            status: "Active",
            impact: {co2Offset: 37.5, solarGenerated: 15000}
        },
        {
            id: 3,
            project: "Wind Power Project",
            credits: 30,
            price: 18,
            purchaseDate: "2023-12-28",
            certificateId: "WPP-2023-156",
            status: "Retired",
            impact: {co2Offset: 54, windGenerated: 12000}
        }
    ];

    const totalImpact = {
        totalCredits: 105,
        totalSpent: 1040,
        totalCO2Offset: 166.5,
        equivalentTrees: 125,
        equivalentCarsOff: 36
    };

    return (
        <div className="max-w-7xl mx-auto p-6">
            <h1 className="text-3xl font-bold mb-8">Buyer Dashboard</h1>

            {/* Impact Overview */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow-md text-center">
                    <p className="text-2xl font-bold text-green-600">{totalImpact.totalCredits}</p>
                    <p className="text-sm text-gray-600">Credits Purchased</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md text-center">
                    <p className="text-2xl font-bold text-blue-600">${totalImpact.totalSpent}</p>
                    <p className="text-sm text-gray-600">Total Invested</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md text-center">
                    <p className="text-2xl font-bold text-purple-600">{totalImpact.totalCO2Offset}</p>
                    <p className="text-sm text-gray-600">Tons CO₂ Offset</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md text-center">
                    <p className="text-2xl font-bold text-orange-600">{totalImpact.equivalentTrees}</p>
                    <p className="text-sm text-gray-600">Trees Equivalent</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md text-center">
                    <p className="text-2xl font-bold text-red-600">{totalImpact.equivalentCarsOff}</p>
                    <p className="text-sm text-gray-600">Cars Off Road/Year</p>
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
                            Impact Overview
                        </button>
                        <button
                            onClick={() => setActiveTab('purchases')}
                            className={`px-6 py-4 text-sm font-medium ${activeTab === 'purchases' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
                        >
                            Purchase History
                        </button>
                        <button
                            onClick={() => setActiveTab('certificates')}
                            className={`px-6 py-4 text-sm font-medium ${activeTab === 'certificates' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
                        >
                            Certificates
                        </button>
                        <button
                            onClick={() => setActiveTab('tracking')}
                            className={`px-6 py-4 text-sm font-medium ${activeTab === 'tracking' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
                        >
                            Project Tracking
                        </button>
                    </nav>
                </div>

                <div className="p-6">
                    {/* Impact Overview Tab */}
                    {activeTab === 'overview' && (
                        <div className="space-y-6">
                            {/* Environmental Impact Chart */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div className="bg-gray-50 p-6 rounded-lg">
                                    <h3 className="text-lg font-semibold mb-4">Monthly CO₂ Offset Progress</h3>
                                    <div className="h-64 flex items-center justify-center bg-white rounded">
                                        <p className="text-gray-500">Chart showing monthly CO₂ offset progress</p>
                                    </div>
                                </div>

                                <div className="bg-gray-50 p-6 rounded-lg">
                                    <h3 className="text-lg font-semibold mb-4">Project Type Distribution</h3>
                                    <div className="h-64 flex items-center justify-center bg-white rounded">
                                        <p className="text-gray-500">Pie chart showing project type distribution</p>
                                    </div>
                                </div>
                            </div>

                            {/* Environmental Equivalents */}
                            <div>
                                <h3 className="text-lg font-semibold mb-4">Environmental Impact Equivalents</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="bg-green-50 p-4 rounded-lg text-center">
                                        <p className="text-3xl font-bold text-green-600">🌳</p>
                                        <p className="text-lg font-semibold">{totalImpact.equivalentTrees}</p>
                                        <p className="text-sm text-gray-600">Trees planted equivalent</p>
                                    </div>
                                    <div className="bg-blue-50 p-4 rounded-lg text-center">
                                        <p className="text-3xl font-bold text-blue-600">🚗</p>
                                        <p className="text-lg font-semibold">{totalImpact.equivalentCarsOff}</p>
                                        <p className="text-sm text-gray-600">Cars off road for a year</p>
                                    </div>
                                    <div className="bg-purple-50 p-4 rounded-lg text-center">
                                        <p className="text-3xl font-bold text-purple-600">⚡</p>
                                        <p className="text-lg font-semibold">45,000</p>
                                        <p className="text-sm text-gray-600">kWh clean energy supported</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Purchase History Tab */}
                    {activeTab === 'purchases' && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-semibold">Purchase History</h3>
                                <button className="bg-blue-600 text-white px-4 py-2 rounded">
                                    Export History
                                </button>
                            </div>

                            <div className="space-y-4">
                                {purchaseHistory.map(purchase => (
                                    <div key={purchase.id} className="border rounded-lg p-6">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex-1">
                                                <h4 className="text-lg font-semibold">{purchase.project}</h4>
                                                <p className="text-gray-600">Certificate
                                                    ID: {purchase.certificateId}</p>
                                                <p className="text-sm text-gray-600">Purchased
                                                    on {new Date(purchase.purchaseDate).toLocaleDateString()}</p>
                                            </div>
                                            <div className="text-right">
                        <span className={`px-3 py-1 rounded text-sm ${
                            purchase.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {purchase.status}
                        </span>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                            <div>
                                                <p className="text-sm text-gray-600">Credits Purchased</p>
                                                <p className="text-lg font-semibold">{purchase.credits}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600">Price per Credit</p>
                                                <p className="text-lg font-semibold">${purchase.price}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600">Total Cost</p>
                                                <p className="text-lg font-semibold">${purchase.credits * purchase.price}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600">CO₂ Offset</p>
                                                <p className="text-lg font-semibold">{purchase.impact.co2Offset} tons</p>
                                            </div>
                                        </div>

                                        <div className="mt-4 flex gap-3">
                                            <button className="bg-blue-600 text-white px-4 py-2 rounded text-sm">
                                                View Certificate
                                            </button>
                                            <button className="bg-green-600 text-white px-4 py-2 rounded text-sm">
                                                Track Project
                                            </button>
                                            <button className="bg-gray-300 text-gray-700 px-4 py-2 rounded text-sm">
                                                Download PDF
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Certificates Tab */}
                    {activeTab === 'certificates' && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-semibold">Digital Certificates</h3>
                                <button className="bg-blue-600 text-white px-4 py-2 rounded">
                                    Download All
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {purchaseHistory.map(purchase => (
                                    <div key={purchase.id}
                                         className="bg-gradient-to-br from-green-50 to-blue-50 p-6 rounded-lg border">
                                        <div className="text-center mb-4">
                                            <h4 className="font-semibold text-lg">Carbon Credit Certificate</h4>
                                            <p className="text-sm text-gray-600">Certificate
                                                ID: {purchase.certificateId}</p>
                                        </div>

                                        <div className="space-y-2 mb-4">
                                            <p><span className="font-medium">Project:</span> {purchase.project}</p>
                                            <p><span className="font-medium">Credits:</span> {purchase.credits}</p>
                                            <p><span
                                                className="font-medium">Issue Date:</span> {new Date(purchase.purchaseDate).toLocaleDateString()}
                                            </p>
                                            <p><span
                                                className="font-medium">CO₂ Offset:</span> {purchase.impact.co2Offset} tons
                                            </p>
                                        </div>

                                        <div className="flex gap-2">
                                            <button className="flex-1 bg-blue-600 text-white py-2 px-3 rounded text-sm">
                                                View Full
                                            </button>
                                            <button
                                                className="flex-1 bg-green-600 text-white py-2 px-3 rounded text-sm">
                                                Download
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Project Tracking Tab */}
                    {activeTab === 'tracking' && (
                        <div className="space-y-6">
                            <h3 className="text-lg font-semibold">Project Progress Tracking</h3>

                            <div className="space-y-6">
                                {purchaseHistory.filter(p => p.status === 'Active').map(purchase => (
                                    <div key={purchase.id} className="border rounded-lg p-6">
                                        <h4 className="text-lg font-semibold mb-4">{purchase.project}</h4>

                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                            <div>
                                                <h5 className="font-medium mb-3">Progress Overview</h5>
                                                <div className="space-y-3">
                                                    <div>
                                                        <div className="flex justify-between items-center mb-1">
                                                            <span className="text-sm">Overall Progress</span>
                                                            <span className="text-sm font-medium">75%</span>
                                                        </div>
                                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                                            <div className="bg-blue-600 h-2 rounded-full"
                                                                 style={{width: '75%'}}></div>
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                                        <div>
                                                            <p className="text-gray-600">Phase</p>
                                                            <p className="font-medium">Implementation</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-gray-600">Next Milestone</p>
                                                            <p className="font-medium">Q2 2024</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div>
                                                <h5 className="font-medium mb-3">Recent Updates</h5>
                                                <div className="space-y-2 text-sm">
                                                    <div className="bg-green-50 p-2 rounded">
                                                        <p className="font-medium">Jan 15, 2024</p>
                                                        <p>Completed reforestation of 250 hectares</p>
                                                    </div>
                                                    <div className="bg-blue-50 p-2 rounded">
                                                        <p className="font-medium">Jan 10, 2024</p>
                                                        <p>Monthly environmental monitoring report submitted</p>
                                                    </div>
                                                    <div className="bg-yellow-50 p-2 rounded">
                                                        <p className="font-medium">Jan 5, 2024</p>
                                                        <p>Phase 2 milestone achieved ahead of schedule</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-4 pt-4 border-t">
                                            <button className="bg-blue-600 text-white px-4 py-2 rounded text-sm">
                                                View Full Project Details
                                            </button>
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