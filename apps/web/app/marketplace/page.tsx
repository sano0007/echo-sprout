'use client';

import { useEffect, useState, useMemo } from 'react';
import Image from 'next/image';
import ReactPaginate from 'react-paginate';
import { useMarketplaceStore } from '@/store/marketplace-store';
import _ from 'lodash';

export default function Marketplace() {
  const {
    projects,
    filters,
    loading,
    error,
    totalCount,
    currentPage,
    totalPages,
    isProcessing,
    setFilters,
    setPage,
    fetchProjects,
    resetFilters,
    purchaseToken,
  } = useMarketplaceStore();
  const [query, setQuery] = useState<string>('');
  const [showCreditModal, setShowCreditModal] = useState<boolean>(false);
  const [dollarAmount, setDollarAmount] = useState<number>(100);
  const [creditAmount, setCreditAmount] = useState<number>(1);

  const creditPrice = 100; // $100 per credit

  // Fetch projects on component mount
  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // Stable debounced search function using useMemo
  const debouncedSearch = useMemo(
    () =>
      _.debounce((searchValue: string) => {
        setFilters({ searchQuery: searchValue });
      }, 1000),
    [setFilters]
  );

  // Handle search input change
  const handleSearchChange = (value: string) => {
    setQuery(value);
    debouncedSearch(value);
  };

  // Handle page change with scroll to top
  const handlePageChange = (event: { selected: number }) => {
    const newPage = event.selected + 1;
    setPage(newPage);
    // Smooth scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle dollar amount change
  const handleDollarChange = (value: number) => {
    setDollarAmount(value);
    setCreditAmount(Math.round((value / creditPrice) * 100) / 100);
  };

  // Handle credit amount change
  const handleCreditChange = (value: number) => {
    setCreditAmount(value);
    setDollarAmount(Math.round(value * creditPrice * 100) / 100);
  };


  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className={'flex justify-between items-center mb-4'}>
        <h1 className="text-3xl font-bold">Carbon Credit Marketplace</h1>
        <button
          onClick={() => setShowCreditModal(true)}
          className="bg-blue-600 text-white py-3 px-4 rounded hover:bg-blue-700"
        >
          Buy Credits
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Filter Projects</h2>
          <button
            onClick={() => {
              resetFilters();
              setQuery('');
            }}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Clear All Filters
          </button>
        </div>

        {/* Search projects by name */}
        <div className="mb-4 relative">
          <input
            type="text"
            placeholder="Search projects ..."
            value={query}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full p-3 pr-20 border rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {query && (
            <button
              onClick={() => {
                setQuery('');
                debouncedSearch('');
              }}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-red-600 text-sm font-medium"
            >
              Clear
            </button>
          )}
        </div>

        <div className="grid grid-cols-4 gap-4">
          <select
            value={filters.priceRange}
            onChange={(e) => setFilters({ priceRange: e.target.value })}
            className="p-3 border rounded bg-white"
          >
            <option value="">Price Range</option>
            <option value="0-10">$0 - $10</option>
            <option value="10-20">$10 - $20</option>
            <option value="20+">$20+</option>
          </select>

          <select
            value={filters.location}
            onChange={(e) => setFilters({ location: e.target.value })}
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
            onChange={(e) => setFilters({ projectType: e.target.value })}
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
            onChange={(e) => setFilters({ sortBy: e.target.value })}
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

      {/* Results Info */}
      {!loading && !error && (
        <div className="mb-6 flex justify-between items-center text-gray-600">
          <p>
            Showing {projects.length} of {totalCount} project
            {totalCount !== 1 ? 's' : ''}
            {currentPage > 1 && ` (Page ${currentPage} of ${totalPages})`}
          </p>
          <div className="text-sm">
            {totalCount > 0 &&
              `${(currentPage - 1) * (filters.limit || 6) + 1}-${Math.min(currentPage * (filters.limit || 6), totalCount)} of ${totalCount}`}
          </div>
        </div>
      )}

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

      {/* Credit Purchase Modal */}
      {showCreditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Buy Carbon Credits</h2>
              <button
                onClick={() => setShowCreditModal(false)}
                className="text-gray-500 hover:text-gray-700 text-xl font-bold"
              >
                ×
              </button>
            </div>

            <div className="mb-6">
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <p className="text-sm text-gray-600 mb-1">
                  Current Credit Price
                </p>
                <p className="text-2xl font-bold text-green-600">
                  ${creditPrice}
                </p>
                <p className="text-sm text-gray-500">per credit</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dollar Amount ($)
                  </label>
                  <input
                    type="number"
                    value={dollarAmount}
                    onChange={(e) =>
                      handleDollarChange(Number(e.target.value) || 0)
                    }
                    min="1"
                    step="0.01"
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    placeholder="Enter dollar amount"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Credits
                  </label>
                  <input
                    type="number"
                    value={creditAmount}
                    onChange={(e) =>
                      handleCreditChange(Number(e.target.value) || 0)
                    }
                    min="0.01"
                    step="0.01"
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    placeholder="Enter credit amount"
                  />
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg mt-4">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total Purchase:</span>
                  <span className="text-xl font-bold text-blue-600">
                    ${dollarAmount.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-sm text-gray-600">
                    Credits to receive:
                  </span>
                  <span className="text-sm font-medium">
                    {creditAmount.toFixed(2)} credits
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowCreditModal(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={() => purchaseToken(dollarAmount, creditAmount)}
                disabled={isProcessing || dollarAmount <= 0}
                className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? 'Processing...' : 'Buy Now'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pagination */}
      {!loading && !error && totalPages > 1 && (
        <div className="mt-8 flex justify-center">
          <ReactPaginate
            pageCount={totalPages}
            pageRangeDisplayed={3}
            marginPagesDisplayed={1}
            onPageChange={handlePageChange}
            forcePage={currentPage - 1}
            containerClassName="flex items-center gap-2"
            pageClassName="px-3 py-2 rounded-md border border-gray-300 hover:bg-gray-50 cursor-pointer"
            pageLinkClassName="block w-full h-full text-center"
            activeClassName="bg-blue-600 text-white border-blue-600 hover:bg-blue-700"
            previousLabel="← Previous"
            nextLabel="Next →"
            previousClassName="px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-50 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            nextClassName="px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-50 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            disabledClassName="opacity-50 cursor-not-allowed"
            breakLabel="..."
            breakClassName="px-3 py-2"
          />
        </div>
      )}
    </div>
  );
}
