import Image from "next/image";
import { Space_Grotesk } from 'next/font/google';
import BgImage1 from "../../public/img/bg-img-1.jpg"

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['700']
});

export const HeroSection = () => {
  return (
      <section className={'h-screen flex flex-col items-center justify-center relative'}>
          <div className={'absolute inset-0 h-screen'}>
              <Image
                src={BgImage1}
                alt={'bg-img'}
                className={'h-screen w-full object-cover p-4 rounded-[30px]'}
              />
              <div className={'absolute inset-0 bg-black/40 m-4 rounded-[18px]'} />
          </div>
          <div className={'absolute bottom-16 left-16 z-50 max-w-7xl'}>
              <h1 className={`${spaceGrotesk.className} text-[95px] font-bold text-white leading-none`}>
                Transform Carbon Credits Into Climate Solutions
              </h1>
              <p className={'text-[16px] text-white/70'}>
                A comprehensive platform connecting project developers, verifiers, and buyers to accelerate the transition to net-zero.
              </p>
          </div>
      </section>
  )
}