'use client';

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gray-50">
      <div className="max-w-md mx-auto text-center px-4">
        {/* 404 Number */}
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-gray-300 mb-4">404</h1>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-green-600 mx-auto rounded-full"></div>
        </div>

        {/* Error Message */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Page Not Found
          </h2>
          <p className="text-gray-600 text-lg leading-relaxed">
            Oops! The page you&apos;re looking for seems to have wandered off
            into the digital forest. Don&apos;t worry, even the best carbon
            credit projects sometimes take unexpected paths.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="bg-gradient-to-r from-blue-600 to-green-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:from-blue-700 hover:to-green-700 transition-all duration-300 transform hover:scale-105"
          >
            Go Home
          </Link>
          <Link
            href="/marketplace"
            className="bg-transparent border-2 border-blue-600 text-blue-600 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-600 hover:text-white transition-colors duration-300"
          >
            Browse Marketplace
          </Link>
        </div>

        {/* Helpful Links */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-gray-500 mb-4">Looking for something specific?</p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <Link
              href="/projects/register"
              className="text-blue-600 hover:text-blue-800 hover:underline"
            >
              Register Project
            </Link>
            <Link
              href="/verification/dashboard"
              className="text-blue-600 hover:text-blue-800 hover:underline"
            >
              Verification Dashboard
            </Link>
            <Link
              href="/profile"
              className="text-blue-600 hover:text-blue-800 hover:underline"
            >
              Profile
            </Link>
            <Link
              href="/community/forum"
              className="text-blue-600 hover:text-blue-800 hover:underline"
            >
              Community Forum
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
