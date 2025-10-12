'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { SignedIn, SignedOut, SignInButton, useClerk } from '@clerk/nextjs';
import { getDashboardRoute, useCurrentUser, getUserFullName, getUserInitials } from "@/hooks";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export const NavBar = () => {
  const pathname = usePathname();
  const isHeroSection = pathname === '/';
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const currentUser = useCurrentUser();
  const dashboardRoute = getDashboardRoute(currentUser);
  const { signOut } = useClerk();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
      if (
        userDropdownRef.current &&
        !userDropdownRef.current.contains(event.target as Node)
      ) {
        setIsUserDropdownOpen(false);
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
              href="/learn"
              className={
                'text-white/90 hover:text-white transition-colors font-medium'
              }
          >
            Learning Hub
          </Link>
          <Link
              href="/community/forum"
              className={
                'text-white/90 hover:text-white transition-colors font-medium'
              }
          >
            Forum
          </Link>
          {/* Community Dropdown */}
          {/*<div className={'relative'} ref={dropdownRef}>*/}
          {/*  <button*/}
          {/*    onClick={() => setIsDropdownOpen(!isDropdownOpen)}*/}
          {/*    className={*/}
          {/*      'text-white/90 hover:text-white transition-colors font-medium flex items-center gap-1'*/}
          {/*    }*/}
          {/*  >*/}
          {/*    Community*/}
          {/*    <svg*/}
          {/*      className={`w-4 h-4 transition-transform duration-200 ${*/}
          {/*        isDropdownOpen ? 'rotate-180' : ''*/}
          {/*      }`}*/}
          {/*      fill="none"*/}
          {/*      stroke="currentColor"*/}
          {/*      viewBox="0 0 24 24"*/}
          {/*    >*/}
          {/*      <path*/}
          {/*        strokeLinecap="round"*/}
          {/*        strokeLinejoin="round"*/}
          {/*        strokeWidth={2}*/}
          {/*        d="M19 9l-7 7-7-7"*/}
          {/*      />*/}
          {/*    </svg>*/}
          {/*  </button>*/}

          {/*  /!* Dropdown Menu *!/*/}
          {/*  {isDropdownOpen && (*/}
          {/*    <div*/}
          {/*      className={*/}
          {/*        'navbar-glass-dropdown absolute top-full mt-7 w-48 rounded-[12px] backdrop-blur-md bg-white/20 border border-white/40 shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-7 duration-200'*/}
          {/*      }*/}
          {/*    >*/}
          {/*      <Link*/}
          {/*        href="/learn"*/}
          {/*        className={*/}
          {/*          'block px-6 py-3 text-white/90 hover:text-white hover:bg-white/10 transition-all font-medium'*/}
          {/*        }*/}
          {/*        onClick={() => setIsDropdownOpen(false)}*/}
          {/*      >*/}
          {/*        Learning Hub*/}
          {/*      </Link>*/}
          {/*      <Link*/}
          {/*        href="/community/forum"*/}
          {/*        className={*/}
          {/*          'block px-6 py-3 text-white/90 hover:text-white hover:bg-white/10 transition-all font-medium'*/}
          {/*        }*/}
          {/*        onClick={() => setIsDropdownOpen(false)}*/}
          {/*      >*/}
          {/*        Forum*/}
          {/*      </Link>*/}
          {/*    </div>*/}
          {/*  )}*/}
          {/*</div>*/}
        </div>
        <div className={'flex items-center gap-4'}>
          <SignedIn>
            {/* User Avatar Dropdown */}
            <div className={'relative'} ref={userDropdownRef}>
              <button
                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                className={'flex items-center gap-2 hover:opacity-80 transition-opacity'}
              >
                <Avatar className={'w-10 h-10 border-2 border-white/30'}>
                  <AvatarImage src={currentUser?.profileImage} alt={getUserFullName(currentUser)} />
                  <AvatarFallback className={'bg-white/20 text-white font-semibold backdrop-blur-sm'}>
                    {getUserInitials(currentUser)}
                  </AvatarFallback>
                </Avatar>
              </button>

              {/* User Dropdown Menu */}
              {isUserDropdownOpen && (
                <div
                  className={
                    'navbar-glass-dropdown absolute top-full right-0 mt-2 w-64 rounded-[12px] backdrop-blur-md bg-white/20 border border-white/40 shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200'
                  }
                >
                  {/* User Info */}
                  <div className={'px-6 py-4 border-b border-white/20'}>
                    <p className={'text-white font-semibold text-sm'}>
                      {getUserFullName(currentUser)}
                    </p>
                    <p className={'text-white/70 text-xs mt-1'}>
                      {currentUser?.email}
                    </p>
                  </div>

                  {/* Menu Items */}
                  <div className={'py-2'}>
                    <Link
                      href={dashboardRoute}
                      className={
                        'block px-6 py-3 text-white/90 hover:text-white hover:bg-white/10 transition-all font-medium flex items-center gap-3'
                      }
                      onClick={() => setIsUserDropdownOpen(false)}
                    >
                      <svg
                        className={'w-5 h-5'}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                        />
                      </svg>
                      Dashboard
                    </Link>
                    <button
                      onClick={() => {
                        setIsUserDropdownOpen(false);
                        signOut({ redirectUrl: '/' });
                      }}
                      className={
                        'w-full text-left px-6 py-3 text-white/90 hover:text-white hover:bg-white/10 transition-all font-medium flex items-center gap-3'
                      }
                    >
                      <svg
                        className={'w-5 h-5'}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                        />
                      </svg>
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
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
