import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AfterhoursProvider } from '@/context/AfterhoursContext';
import { Sidebar } from '@/components/Sidebar';
import { MobileNav } from '@/components/MobileNav';
import { UniversalSearchModal } from '@/components/UniversalSearchModal';
import { ItemDetailModal } from '@/components/ItemDetailModal';
import { CreateCollectionModal } from '@/components/CreateCollectionModal';
import { ToastContainer } from '@/components/ToastContainer';
import { AudioPlayerBar } from '@/components/AudioPlayerBar';
import { GlobalAuthModal } from '@/components/GlobalAuthModal';

export const metadata: Metadata = {
  title: 'AFTERHOURS — Personal Discovery Hub',
  description: 'A personal discovery hub for everything you want to experience, listen to, play, watch, or visit.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'AFTERHOURS',
  },
};

export const viewport: Viewport = {
  themeColor: '#09090d',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-nocturne-950 text-nocturne-100 min-h-screen antialiased selection:bg-purple-600/30 selection:text-white">
        <AfterhoursProvider>
          <div className="flex min-h-screen">
            {/* Desktop Persistent Sidebar */}
            <Sidebar />

            {/* Mobile Header and Bottom Nav */}
            <MobileNav />

            {/* Main Application Content Area */}
            <main className="flex-1 md:pl-64 flex flex-col min-h-screen pb-20 md:pb-8">
              {children}
            </main>
          </div>

          {/* Global Modals & Notifications */}
          <UniversalSearchModal />
          <ItemDetailModal />
          <CreateCollectionModal />
          <ToastContainer />
          <AudioPlayerBar />
          <GlobalAuthModal />
        </AfterhoursProvider>
      </body>
    </html>
  );
}
