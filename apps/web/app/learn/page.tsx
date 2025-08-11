"use client";

import {useState} from "react";

export default function LearnHub() {
    const [activeTab, setActiveTab] = useState('modules');

    const learningModules = [
        {
            id: 1,
            title: "Introduction to Carbon Credits",
            description: "Learn the basics of carbon credits, how they work, and their role in climate action.",
            duration: "30 minutes",
            level: "Beginner",
            lessons: 5,
            progress: 0
        },
        {
            id: 2,
            title: "Project Development Process",
            description: "Step-by-step guide to developing carbon credit projects from conception to verification.",
            duration: "45 minutes",
            level: "Intermediate",
            lessons: 8,
            progress: 25
        },
        {
            id: 3,
            title: "Verification Standards",
            description: "Understanding VCS, Gold Standard, and other verification methodologies.",
            duration: "40 minutes",
            level: "Advanced",
            lessons: 6,
            progress: 100
        },
        {
            id: 4,
            title: "Carbon Market Dynamics",
            description: "Explore pricing, trading strategies, and market trends in carbon credits.",
            duration: "35 minutes",
            level: "Intermediate",
            lessons: 7,
            progress: 60
        }
    ];

    const guides = [
        {
            id: 1,
            title: "How to Register Your First Project",
            category: "Getting Started",
            readTime: "10 min read",
            updated: "2024-01-15"
        },
        {
            id: 2,
            title: "Document Preparation Checklist",
            category: "Project Development",
            readTime: "8 min read",
            updated: "2024-01-12"
        },
        {
            id: 3,
            title: "Understanding Verification Process",
            category: "Verification",
            readTime: "12 min read",
            updated: "2024-01-10"
        },
        {
            id: 4,
            title: "Maximizing Project Impact",
            category: "Best Practices",
            readTime: "15 min read",
            updated: "2024-01-08"
        }
    ];

    const blogPosts = [
        {
            id: 1,
            title: "The Future of Nature-Based Carbon Solutions",
            author: "Dr. Sarah Chen",
            date: "2024-01-18",
            excerpt: "Exploring how reforestation and ecosystem restoration projects are reshaping the carbon credit landscape...",
            readTime: "6 min read",
            tags: ["Nature-Based", "Innovation", "Future Trends"]
        },
        {
            id: 2,
            title: "Success Story: 10,000 Hectares Restored in Amazon",
            author: "Green Earth Foundation",
            date: "2024-01-15",
            excerpt: "A detailed look at how our large-scale reforestation project achieved its goals ahead of schedule...",
            readTime: "8 min read",
            tags: ["Case Study", "Reforestation", "Success Story"]
        },
        {
            id: 3,
            title: "Technology Integration in Carbon Project Monitoring",
            author: "Tech Innovations Team",
            date: "2024-01-12",
            excerpt: "How IoT sensors, satellite imagery, and AI are revolutionizing project monitoring and verification...",
            readTime: "10 min read",
            tags: ["Technology", "Monitoring", "Innovation"]
        }
    ];

    return (
        <div className="max-w-7xl mx-auto p-6">
            <div className="text-center mb-8">
                <h1 className="text-4xl font-bold mb-4">Educational Content Hub</h1>
                <p className="text-lg text-gray-600">Learn about carbon credits, project development, and sustainable
                    impact</p>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-lg shadow-md">
                <div className="border-b">
                    <nav className="flex">
                        <button
                            onClick={() => setActiveTab('modules')}
                            className={`px-6 py-4 text-sm font-medium ${activeTab === 'modules' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
                        >
                            Learning Modules
                        </button>
                        <button
                            onClick={() => setActiveTab('guides')}
                            className={`px-6 py-4 text-sm font-medium ${activeTab === 'guides' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
                        >
                            Step-by-Step Guides
                        </button>
                        <button
                            onClick={() => setActiveTab('blog')}
                            className={`px-6 py-4 text-sm font-medium ${activeTab === 'blog' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
                        >
                            Community Blog
                        </button>
                    </nav>
                </div>

                <div className="p-6">
                    {/* Learning Modules Tab */}
                    {activeTab === 'modules' && (
                        <div className="space-y-6">
                            <div className="text-center mb-8">
                                <h2 className="text-2xl font-semibold mb-2">Structured Learning Path</h2>
                                <p className="text-gray-600">Comprehensive courses designed to build your carbon credit
                                    expertise</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {learningModules.map(module => (
                                    <div key={module.id}
                                         className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex-1">
                                                <h3 className="text-lg font-semibold mb-2">{module.title}</h3>
                                                <p className="text-gray-600 text-sm mb-3">{module.description}</p>

                                                <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                                                    <span>⏱️ {module.duration}</span>
                                                    <span>📚 {module.lessons} lessons</span>
                                                    <span className={`px-2 py-1 rounded text-xs ${
                                                        module.level === 'Beginner' ? 'bg-green-100 text-green-800' :
                                                            module.level === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
                                                                'bg-red-100 text-red-800'
                                                    }`}>
                            {module.level}
                          </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mb-4">
                                            <div className="flex justify-between text-sm mb-1">
                                                <span>Progress</span>
                                                <span>{module.progress}%</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div
                                                    className="bg-blue-600 h-2 rounded-full"
                                                    style={{width: `${module.progress}%`}}
                                                ></div>
                                            </div>
                                        </div>

                                        <button
                                            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700">
                                            {module.progress === 0 ? 'Start Course' : module.progress === 100 ? 'Review' : 'Continue'}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Step-by-Step Guides Tab */}
                    {activeTab === 'guides' && (
                        <div className="space-y-6">
                            <div className="text-center mb-8">
                                <h2 className="text-2xl font-semibold mb-2">Practical Guides</h2>
                                <p className="text-gray-600">Actionable step-by-step instructions for common tasks</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {guides.map(guide => (
                                    <div key={guide.id}
                                         className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
                                        <div className="mb-4">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                        {guide.category}
                      </span>
                                        </div>

                                        <h3 className="text-lg font-semibold mb-2">{guide.title}</h3>

                                        <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
                                            <span>📖 {guide.readTime}</span>
                                            <span>Updated {new Date(guide.updated).toLocaleDateString()}</span>
                                        </div>

                                        <button
                                            className="w-full bg-gray-100 text-gray-800 py-2 px-4 rounded hover:bg-gray-200">
                                            Read Guide
                                        </button>
                                    </div>
                                ))}
                            </div>

                            {/* Featured Guide */}
                            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg">
                                <h3 className="text-xl font-semibold mb-2">🌟 Featured Guide</h3>
                                <h4 className="text-lg font-medium mb-2">Complete Project Registration Walkthrough</h4>
                                <p className="text-gray-600 mb-4">A comprehensive guide covering everything from initial
                                    project conception to final submission, including templates and checklists.</p>
                                <button className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
                                    Start Walkthrough
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Community Blog Tab */}
                    {activeTab === 'blog' && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h2 className="text-2xl font-semibold mb-2">Community Blog</h2>
                                    <p className="text-gray-600">Insights, stories, and updates from our community</p>
                                </div>
                                <button className="bg-blue-600 text-white px-4 py-2 rounded">
                                    Write Article
                                </button>
                            </div>

                            <div className="space-y-6">
                                {blogPosts.map(post => (
                                    <article key={post.id}
                                             className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex-1">
                                                <h3 className="text-xl font-semibold mb-2 hover:text-blue-600 cursor-pointer">
                                                    {post.title}
                                                </h3>
                                                <div className="flex items-center text-sm text-gray-500 mb-2">
                                                    <span>By {post.author}</span>
                                                    <span className="mx-2">•</span>
                                                    <span>{new Date(post.date).toLocaleDateString()}</span>
                                                    <span className="mx-2">•</span>
                                                    <span>{post.readTime}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <p className="text-gray-600 mb-4">{post.excerpt}</p>

                                        <div className="flex justify-between items-center">
                                            <div className="flex gap-2">
                                                {post.tags.map(tag => (
                                                    <span key={tag}
                                                          className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm">
                            {tag}
                          </span>
                                                ))}
                                            </div>
                                            <button className="text-blue-600 hover:underline">
                                                Read More
                                            </button>
                                        </div>
                                    </article>
                                ))}
                            </div>

                            {/* Call to Action */}
                            <div className="bg-green-50 p-6 rounded-lg text-center">
                                <h3 className="text-lg font-semibold mb-2">Share Your Knowledge</h3>
                                <p className="text-gray-600 mb-4">Have insights about carbon projects or sustainability?
                                    Share your experience with the community.</p>
                                <button className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700">
                                    Contribute Article
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}