'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import {SignedIn, SignedOut, SignInButton, UserButton} from '@clerk/nextjs';
import {getDashboardRoute, useCurrentUser} from "@/hooks";

export const NavBar = () => {
  const pathname = usePathname();
  const isHeroSection = pathname === '/';
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const currentUser = useCurrentUser();
  const dashboardRoute = getDashboardRoute(currentUser);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isHeroSection) {
    return null;
  }

  return (
    <nav
      className={
        'absolute top-0 left-0 right-0 mx-10 mt-10 h-[70px] rounded-[18px] z-50 backdrop-blur-md bg-white/10 border border-white/20'
      }
    >
      <div className={'flex items-center justify-between h-full px-8'}>
        <Link href="/" className={'text-white font-bold text-2xl'}>
          EcoSprout
        </Link>
        <div className={'hidden md:flex items-center gap-8'}>
          <Link
            href="/marketplace"
            className={
              'text-white/90 hover:text-white transition-colors font-medium'
            }
          >
            Marketplace
          </Link>
          <Link
            href="/about"
            className={
              'text-white/90 hover:text-white transition-colors font-medium'
            }
          >
            About
          </Link>
          <Link
            href="/contact"
            className={
              'text-white/90 hover:text-white transition-colors font-medium'
            }
          >
            Contact
          </Link>
          {/* Community Dropdown */}
          <div className={'relative'} ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={
                'text-white/90 hover:text-white transition-colors font-medium flex items-center gap-1'
              }
            >
              Community
              <svg
                className={`w-4 h-4 transition-transform duration-200 ${
                  isDropdownOpen ? 'rotate-180' : ''
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

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div
                className={
                  'absolute top-full mt-7 w-48 rounded-[12px] backdrop-blur-md bg-white/20 border border-white/40 shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-7 duration-200'
                }
              >
                <Link
                  href="/learn"
                  className={
                    'block px-6 py-3 text-white/90 hover:text-white hover:bg-white/10 transition-all font-medium'
                  }
                  onClick={() => setIsDropdownOpen(false)}
                >
                  Learning Hub
                </Link>
                <Link
                  href="/community/forum"
                  className={
                    'block px-6 py-3 text-white/90 hover:text-white hover:bg-white/10 transition-all font-medium'
                  }
                  onClick={() => setIsDropdownOpen(false)}
                >
                  Forum
                </Link>
              </div>
            )}
          </div>
        </div>
        <div className={'flex items-center gap-4'}>
          <SignedIn>
            <Link
                href={dashboardRoute}
                className={
                  'bg-white/20 backdrop-blur-sm border border-white/30 text-white px-6 py-2 rounded-full font-medium hover:bg-white/30 transition-all'
                }
            >
              Dashboard
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
              <button
                className={
                  'bg-white/20 backdrop-blur-sm border border-white/30 text-white px-6 py-2 rounded-full font-medium hover:bg-white/30 transition-all'
                }
              >
                Sign In
              </button>
            </SignInButton>
          </SignedOut>
        </div>
      </div>
    </nav>
  );
};
