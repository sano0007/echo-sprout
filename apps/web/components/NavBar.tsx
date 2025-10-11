'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export const NavBar = () => {
  const pathname = usePathname();
  const isHeroSection = pathname === '/';

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
            href="/projects"
            className={
              'text-white/90 hover:text-white transition-colors font-medium'
            }
          >
            Projects
          </Link>
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
        </div>
        <div className={'flex items-center gap-4'}>
          <Link
            href="/auth/login"
            className={
              'text-white/90 hover:text-white transition-colors font-medium hidden sm:block'
            }
          >
            Sign In
          </Link>
          <Link
            href="/auth/register"
            className={
              'bg-white/20 backdrop-blur-sm border border-white/30 text-white px-6 py-2 rounded-full font-medium hover:bg-white/30 transition-all'
            }
          >
            Get Started
          </Link>
        </div>
      </div>
    </nav>
  );
};
