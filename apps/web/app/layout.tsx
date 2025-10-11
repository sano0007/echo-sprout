import { ClerkProvider } from '@clerk/nextjs';
import type { Metadata } from 'next';
import localFont from 'next/font/local';
import React from 'react';
import { ToastContainer } from 'react-toastify';

import './globals.css';
import 'react-toastify/dist/ReactToastify.css';

import Footer from '../components/Footer';
import Navigation from '../components/Navigation';
import { Toaster } from '../components/ui/toaster';
import ConvexClientProvider from '../providers/ConvexProviderWithClerk';
import {NavBar} from "@/components/NavBar";

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
});
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
});

export const metadata: Metadata = {
  title: 'EcoSprout - Carbon Credit Marketplace',
  description:
    "The world's most transparent carbon credit marketplace connecting project developers, verifiers, and buyers in the fight against climate change.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable}`}
        suppressHydrationWarning
      >
        <ClerkProvider>
          <ConvexClientProvider>
            <div className="min-h-screen flex flex-col">
              <Navigation />
              <NavBar/>
              <main className="flex-1">{children}</main>
              <Footer />
              <Toaster />
              <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
              />
            </div>
          </ConvexClientProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
