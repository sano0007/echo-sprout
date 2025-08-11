"use client";

import {useState} from "react";

export default function Marketplace() {
    const [filters, setFilters] = useState({
        priceRange: '',
        location: '',
        projectType: '',
        sortBy: 'newest'
    });

    const projects = [
        {
            id: 1,
            name: "Amazon Rainforest Conservation",
            type: "Reforestation",
            location: "Brazil",
            price: 15,
            credits: 500,
            image: "/api/placeholder/300/200",
            creator: "Green Earth Foundation",
            rating: 4.8
        },
        {
            id: 2,
            name: "Solar Energy Farm",
            type: "Solar Energy",
            location: "India",
            price: 12,
            credits: 750,
            image: "/api/placeholder/300/200",
            creator: "Solar Solutions Inc",
            rating: 4.6
        },
        {
            id: 3,
            name: "Wind Power Initiative",
            type: "Wind Energy",
            location: "Denmark",
            price: 18,
            credits: 1000,
            image: "/api/placeholder/300/200",
            creator: "Nordic Wind Co",
            rating: 4.9
        },
        {
            id: 4,
            name: "Biogas Plant Project",
            type: "Biogas",
            location: "Germany",
            price: 10,
            credits: 300,
            image: "/api/placeholder/300/200",
            creator: "BioEnergy GmbH",
            rating: 4.5
        }
    ];

    return (
        <div className="max-w-7xl mx-auto p-6">
            <h1 className="text-3xl font-bold mb-8">Carbon Credit Marketplace</h1>

            {/* Filters */}
            <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                <div className="grid grid-cols-4 gap-4">
                    <select
                        value={filters.priceRange}
                        onChange={(e) => setFilters({...filters, priceRange: e.target.value})}
                        className="p-3 border rounded"
                    >
                        <option value="">Price Range</option>
                        <option value="0-10">$0 - $10</option>
                        <option value="10-20">$10 - $20</option>
                        <option value="20+">$20+</option>
                    </select>

                    <select
                        value={filters.location}
                        onChange={(e) => setFilters({...filters, location: e.target.value})}
                        className="p-3 border rounded"
                    >
                        <option value="">All Locations</option>
                        <option value="brazil">Brazil</option>
                        <option value="india">India</option>
                        <option value="denmark">Denmark</option>
                        <option value="germany">Germany</option>
                    </select>

                    <select
                        value={filters.projectType}
                        onChange={(e) => setFilters({...filters, projectType: e.target.value})}
                        className="p-3 border rounded"
                    >
                        <option value="">Project Type</option>
                        <option value="reforestation">Reforestation</option>
                        <option value="solar">Solar Energy</option>
                        <option value="wind">Wind Energy</option>
                        <option value="biogas">Biogas</option>
                    </select>

                    <select
                        value={filters.sortBy}
                        onChange={(e) => setFilters({...filters, sortBy: e.target.value})}
                        className="p-3 border rounded"
                    >
                        <option value="newest">Newest</option>
                        <option value="price-low">Price: Low to High</option>
                        <option value="price-high">Price: High to Low</option>
                        <option value="rating">Highest Rated</option>
                    </select>
                </div>
            </div>

            {/* Project Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map(project => (
                    <div key={project.id}
                         className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                        <img
                            src={project.image}
                            alt={project.name}
                            className="w-full h-48 object-cover bg-gray-200"
                        />
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="text-lg font-semibold">{project.name}</h3>
                                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                  {project.type}
                </span>
                            </div>

                            <p className="text-gray-600 mb-2">{project.location}</p>
                            <p className="text-sm text-gray-600 mb-4">by {project.creator}</p>

                            <div className="flex items-center mb-4">
                                <div className="flex items-center">
                                    <span className="text-yellow-500">★★★★★</span>
                                    <span className="ml-1 text-sm text-gray-600">({project.rating})</span>
                                </div>
                            </div>

                            <div className="flex justify-between items-center mb-4">
                                <div>
                                    <p className="text-2xl font-bold text-green-600">${project.price}</p>
                                    <p className="text-sm text-gray-600">per credit</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-semibold">{project.credits}</p>
                                    <p className="text-sm text-gray-600">credits available</p>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700">
                                    Buy Now
                                </button>
                                <a href={`/marketplace/${project.id}`}
                                   className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded text-center hover:bg-gray-400">
                                    View Details
                                </a>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}