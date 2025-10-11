'use client';

import Image from 'next/image';
import { Space_Grotesk } from 'next/font/google';
import { useEffect, useState } from 'react';
import BgImage1 from '../../public/img/bg-img-1.jpg';
import BgImage2 from '../../public/img/bg-img-2.jpg';
import BgImage3 from '../../public/img/bg-img-3.jpg';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['700'],
});

const heroImages = [
  BgImage1,
  BgImage2,
  BgImage3,
];

export const HeroSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (heroImages.length <= 1 || isPaused) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % heroImages.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isPaused]);

  return (
    <section
      className={
        'h-screen flex flex-col items-center justify-center relative overflow-hidden'
      }
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Image Carousel */}
      <div className={'absolute inset-0 h-screen'}>
        {heroImages.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentIndex ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <Image
              src={image}
              alt={`hero-background-${index + 1}`}
              className={'h-screen w-full object-cover p-4 rounded-[30px]'}
              priority={index === 0}
            />
          </div>
        ))}
        <div
          className={'absolute inset-0 bg-black/40 m-4 rounded-[18px] z-10'}
        />
      </div>

      {/* Content */}
      <div className={'absolute bottom-16 left-16 z-50 max-w-7xl'}>
        <h1
          className={`${spaceGrotesk.className} text-[95px] font-bold text-white leading-none`}
        >
          Transform Carbon Credits Into Climate Solutions
        </h1>
        <p className={'text-[16px] text-white/70'}>
          A comprehensive platform connecting project developers, verifiers, and
          buyers to accelerate the transition to net-zero.
        </p>
      </div>

      {/* Navigation Dots */}
      {heroImages.length > 1 && (
        <div
          className={
            'absolute bottom-8 left-1/2 transform -translate-x-1/2 z-50 flex gap-2'
          }
        >
          {heroImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? 'bg-white w-8'
                  : 'bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
};
