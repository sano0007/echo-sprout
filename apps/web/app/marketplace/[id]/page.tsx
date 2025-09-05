'use client';

import Image from 'next/image';

export default function ProjectDetail() {
  const project = {
    id: 1,
    name: 'Amazon Rainforest Conservation',
    type: 'Reforestation',
    location: 'Amazon Basin, Brazil',
    price: 15,
    credits: 500,
    totalCredits: 2000,
    creator: {
      name: 'Green Earth Foundation',
      email: 'contact@greenearth.org',
      verified: true,
    },
    description:
      'A comprehensive reforestation project aimed at restoring 1000 hectares of degraded rainforest land in the Amazon Basin. This project focuses on native species replanting and community engagement.',
    images: [
      '/api/placeholder/600/400',
      '/api/placeholder/600/400',
      '/api/placeholder/600/400',
    ],
    impact: {
      treesPlanted: 50000,
      co2Absorbed: 75000,
      biodiversityScore: 8.5,
      communityJobs: 150,
    },
    timeline: {
      startDate: '2024-01-15',
      endDate: '2027-01-15',
      currentPhase: 'Phase 2: Active Planting',
    },
    certifications: ['VCS', 'Gold Standard', 'CCBS'],
    rating: 4.8,
    reviews: 156,
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Image Gallery */}
          <div className="mb-6">
            <Image
              src={project.images[0] as string}
              alt={project.name}
              width={600}
              height={400}
              className="w-full h-96 object-cover rounded-lg bg-gray-200 mb-4"
            />
            <div className="grid grid-cols-3 gap-2">
              {project.images.slice(1).map((img, index) => (
                <Image
                  key={index}
                  src={img}
                  alt={`${project.name} ${index + 2}`}
                  width={300}
                  height={200}
                  className="h-24 object-cover rounded bg-gray-200"
                />
              ))}
            </div>
          </div>

          {/* Project Info */}
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">{project.name}</h1>
                <p className="text-gray-600 mb-2">{project.location}</p>
                <div className="flex items-center mb-4">
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded mr-3">
                    {project.type}
                  </span>
                  <div className="flex items-center">
                    <span className="text-yellow-500">★★★★★</span>
                    <span className="ml-1 text-gray-600">
                      ({project.rating}) • {project.reviews} reviews
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-gray-700 mb-6">{project.description}</p>

            {/* Impact Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-4 bg-green-50 rounded">
                <p className="text-2xl font-bold text-green-600">
                  {project.impact.treesPlanted.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">Trees Planted</p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded">
                <p className="text-2xl font-bold text-blue-600">
                  {project.impact.co2Absorbed.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">CO₂ Absorbed (tons)</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded">
                <p className="text-2xl font-bold text-purple-600">
                  {project.impact.biodiversityScore}
                </p>
                <p className="text-sm text-gray-600">Biodiversity Score</p>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded">
                <p className="text-2xl font-bold text-orange-600">
                  {project.impact.communityJobs}
                </p>
                <p className="text-sm text-gray-600">Jobs Created</p>
              </div>
            </div>

            {/* Timeline */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Project Timeline</h3>
              <div className="bg-gray-50 p-4 rounded">
                <p>
                  <strong>Start Date:</strong>{' '}
                  {new Date(project.timeline.startDate).toLocaleDateString()}
                </p>
                <p>
                  <strong>End Date:</strong>{' '}
                  {new Date(project.timeline.endDate).toLocaleDateString()}
                </p>
                <p>
                  <strong>Current Phase:</strong>{' '}
                  {project.timeline.currentPhase}
                </p>
              </div>
            </div>

            {/* Certifications */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Certifications</h3>
              <div className="flex gap-2">
                {project.certifications.map((cert) => (
                  <span
                    key={cert}
                    className="bg-blue-100 text-blue-800 px-3 py-1 rounded"
                  >
                    {cert}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          {/* Purchase Card */}
          <div className="bg-white p-6 rounded-lg shadow-md mb-6 sticky top-6">
            <div className="text-center mb-6">
              <p className="text-3xl font-bold text-green-600">
                ${project.price}
              </p>
              <p className="text-gray-600">per credit</p>
            </div>

            <div className="mb-4">
              <p className="text-lg font-semibold mb-2">
                {project.credits} credits available
              </p>
              <p className="text-sm text-gray-600">
                of {project.totalCredits} total credits
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className="bg-green-600 h-2 rounded-full"
                  style={{
                    width: `${(project.credits / project.totalCredits) * 100}%`,
                  }}
                ></div>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Quantity</label>
              <input
                type="number"
                min="1"
                max={project.credits}
                defaultValue="1"
                className="w-full p-3 border rounded"
              />
            </div>

            <button className="w-full bg-blue-600 text-white py-3 px-4 rounded mb-3 hover:bg-blue-700">
              Buy Now
            </button>

            <button className="w-full bg-gray-300 text-gray-700 py-3 px-4 rounded hover:bg-gray-400">
              Add to Cart
            </button>

            {/* Creator Info */}
            <div className="mt-6 pt-6 border-t">
              <h4 className="font-semibold mb-2">Project Creator</h4>
              <div className="flex items-center mb-2">
                <span className="font-medium">{project.creator.name}</span>
                {project.creator.verified && (
                  <span className="ml-2 text-green-600 text-sm">
                    ✓ Verified
                  </span>
                )}
              </div>
              <button className="text-blue-600 hover:underline">
                Contact Creator
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
