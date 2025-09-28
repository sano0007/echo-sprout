import { ClerkProvider } from '@clerk/nextjs';
import type { Metadata } from 'next';
import localFont from 'next/font/local';
import React from 'react';

import './globals.css';

import Footer from '../components/Footer';
import Navigation from '../components/Navigation';
import ConvexClientProvider from '../providers/ConvexProviderWithClerk';
import { Toaster } from '../components/ui/toaster';

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
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <ClerkProvider>
          <ConvexClientProvider>
            <div className="min-h-screen flex flex-col">
              <Navigation />
              <main className="flex-1">{children}</main>
              <Footer />
              <Toaster />
            </div>
          </ConvexClientProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
