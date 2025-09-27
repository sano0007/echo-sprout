'use client';

import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';
import Link from 'next/link';
import {usePathname, useRouter} from 'next/navigation';
import { useState } from 'react';

export default function Navigation() {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const isAdminDashboard = pathname === '/admin' || pathname?.startsWith('/admin/');

  if (isAdminDashboard) {
    return null;
  }

  const navigationItems = [
    {
      label: 'Projects',
      dropdown: [
        {
          label: 'Register Project',
          href: '/projects/register',
          description: 'Submit your carbon project',
        },
        {
          label: 'Manage Projects',
          href: '/projects/manage',
          description: 'Track your projects',
        },
        {
          label: 'Monitoring Dashboard',
          href: '/monitoring/dashboard',
          description: 'Monitor project progress',
        },
      ],
    },
    {
      label: 'Marketplace',
      dropdown: [
        {
          label: 'Browse Credits',
          href: '/marketplace',
          description: 'Find and purchase credits',
        },
        {
          label: 'My Purchases',
          href: '/buyer-dashboard',
          description: 'Track your carbon offset impact',
        },
      ],
    },
    {
      label: 'Verification',
      dropdown: [
        {
          label: 'Verification Dashboard',
          href: '/verification/dashboard',
          description: 'Review and verify projects',
        },
        {
          label: 'Review Projects',
          href: '/verification/review/1',
          description: 'Conduct project reviews',
        },
      ],
    },
    {
      label: 'Community',
      dropdown: [
        {
          label: 'Learning Hub',
          href: '/learn',
          description: 'Educational content and courses',
        },
        {
          label: 'Forum',
          href: '/community/forum',
          description: 'Discussion and Q&A',
        },
      ],
    },
  ];

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">ES</span>
            </div>
            <span className="text-xl font-bold text-gray-800">EcoSprout</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navigationItems.map((item) => (
              <div
                key={item.label}
                className="relative"
                onMouseEnter={() => setActiveDropdown(item.label)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <button className="px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors">
                  {item.label}
                  <svg
                    className="inline ml-1 h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {activeDropdown === item.label && (
                  <div className="absolute top-full left-0 mt-1 w-64 bg-white rounded-md shadow-lg border border-gray-200 py-2 z-50">
                    {item.dropdown.map((dropdownItem) => (
                      <Link
                        key={dropdownItem.href}
                        href={dropdownItem.href}
                        className="block px-4 py-3 hover:bg-gray-50 transition-colors"
                        onClick={() => setActiveDropdown(null)}
                      >
                        <div className="font-medium text-gray-900">
                          {dropdownItem.label}
                        </div>
                        <div className="text-sm text-gray-600">
                          {dropdownItem.description}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* User Authentication */}
          <div className="flex items-center space-x-4">
            <SignedIn>
              <Link
                href="/profile"
                className="hidden md:inline-flex text-gray-700 hover:text-blue-600 transition-colors"
              >
                Profile
              </Link>
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: 'w-8 h-8',
                  },
                }}
                afterSignOutUrl="/"
              />
            </SignedIn>

            <SignedOut>
              <SignInButton mode="modal">
                <button className="hidden md:inline-flex bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
                  Sign In
                </button>
              </SignInButton>
            </SignedOut>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-gray-700 hover:text-blue-600 transition-colors"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <div className="space-y-2">
              {navigationItems.map((item) => (
                <div key={item.label}>
                  <button
                    onClick={() =>
                      setActiveDropdown(
                        activeDropdown === item.label ? null : item.label
                      )
                    }
                    className="w-full flex justify-between items-center px-4 py-2 text-left text-gray-700 hover:bg-gray-50 rounded-md"
                  >
                    {item.label}
                    <svg
                      className={`h-4 w-4 transform transition-transform ${
                        activeDropdown === item.label ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  {/* Mobile Dropdown */}
                  {activeDropdown === item.label && (
                    <div className="pl-8 space-y-2">
                      {item.dropdown.map((dropdownItem) => (
                        <Link
                          key={dropdownItem.href}
                          href={dropdownItem.href}
                          className="block py-2 text-gray-600 hover:text-blue-600 transition-colors"
                          onClick={() => {
                            setIsMobileMenuOpen(false);
                            setActiveDropdown(null);
                          }}
                        >
                          {dropdownItem.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Mobile Auth Section */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <SignedIn>
                <Link
                  href="/profile"
                  className="block px-4 py-2 text-gray-700 hover:text-blue-600 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Profile
                </Link>
              </SignedIn>

              <SignedOut>
                <div className="space-y-2 px-4">
                  <SignInButton mode="modal">
                    <button className="w-full text-left py-2 text-gray-700 hover:text-blue-600 transition-colors">
                      Sign In
                    </button>
                  </SignInButton>
                  <Link
                    href="/auth/register"
                    className="block w-full bg-blue-600 text-white text-center py-2 rounded-md hover:bg-blue-700 transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </div>
              </SignedOut>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
