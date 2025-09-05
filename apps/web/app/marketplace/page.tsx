'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface Project {
  id: number;
  name: string;
  type: string;
  location: string;
  price: number;
  credits: number;
  image: string;
  creator: string;
  rating: number;
}

export default function Marketplace() {
  const [filters, setFilters] = useState({
    priceRange: '',
    location: '',
    projectType: '',
    sortBy: 'newest',
  });

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams();
        if (filters.priceRange) params.append('priceRange', filters.priceRange);
        if (filters.location) params.append('location', filters.location);
        if (filters.projectType)
          params.append('projectType', filters.projectType);
        if (filters.sortBy) params.append('sortBy', filters.sortBy);

        const response = await fetch(
          `/api/marketplace/projects?${params.toString()}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch projects');
        }

        const data = await response.json();

        if (data.success) {
          setProjects(data.data);
        } else {
          throw new Error(data.error || 'Failed to fetch projects');
        }
      } catch (err) {
        console.error('Error fetching projects:', err);
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [filters]);

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Carbon Credit Marketplace</h1>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <div className="grid grid-cols-4 gap-4">
          <select
            value={filters.priceRange}
            onChange={(e) =>
              setFilters({ ...filters, priceRange: e.target.value })
            }
            className="p-3 border rounded bg-white"
          >
            <option value="">Price Range</option>
            <option value="0-10">$0 - $10</option>
            <option value="10-20">$10 - $20</option>
            <option value="20+">$20+</option>
          </select>

          <select
            value={filters.location}
            onChange={(e) =>
              setFilters({ ...filters, location: e.target.value })
            }
            className="p-3 border rounded bg-white"
          >
            <option value="">All Locations</option>
            <option value="brazil">Brazil</option>
            <option value="india">India</option>
            <option value="denmark">Denmark</option>
            <option value="germany">Germany</option>
          </select>

          <select
            value={filters.projectType}
            onChange={(e) =>
              setFilters({ ...filters, projectType: e.target.value })
            }
            className="p-3 border rounded bg-white"
          >
            <option value="">Project Type</option>
            <option value="reforestation">Reforestation</option>
            <option value="solar">Solar Energy</option>
            <option value="wind">Wind Energy</option>
            <option value="biogas">Biogas</option>
          </select>

          <select
            value={filters.sortBy}
            onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
            className="p-3 border rounded bg-white"
          >
            <option value="newest">Newest</option>
            <option value="price_low">Price: Low to High</option>
            <option value="price_high">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
            <option value="credits">Most Credits</option>
          </select>
        </div>
      </div>

      {/* Project Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="text-lg text-gray-600">Loading projects...</div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <strong className="font-bold">Error:</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">
            No projects found matching your criteria.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div
              key={project.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <Image
                src={project.image}
                alt={project.name}
                width={300}
                height={200}
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
                <p className="text-sm text-gray-600 mb-4">
                  by {project.creator}
                </p>

                <div className="flex items-center mb-4">
                  <div className="flex items-center">
                    <span className="text-yellow-500">★★★★★</span>
                    <span className="ml-1 text-sm text-gray-600">
                      ({project.rating})
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center mb-4">
                  <div>
                    <p className="text-2xl font-bold text-green-600">
                      ${project.price}
                    </p>
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
                  <a
                    href={`/marketplace/${project.id}`}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded text-center hover:bg-gray-400"
                  >
                    View Details
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
