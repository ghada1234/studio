import type { Metadata } from 'next';
import './globals.css';
import { AppShell } from '@/components/layout/app-shell';
import { DailyLogProvider } from '@/hooks/use-daily-log';
import { Toaster } from '@/components/ui/toaster';
import { TranslationProvider } from '@/hooks/use-translation';
import { AuthProvider } from '@/hooks/use-auth';

export const metadata: Metadata = {
  title: 'NutriSnap',
  description:
    'Analyze meals, track nutrients, and get AI-powered suggestions.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" dir="ltr" className="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Cairo:wght@300..700&display=swap"
          rel="stylesheet"
        ></link>
      </head>
      <body className="font-body antialiased">
        <TranslationProvider>
          <AuthProvider>
            <DailyLogProvider>
              <AppShell>{children}</AppShell>
              <Toaster />
            </DailyLogProvider>
          </AuthProvider>
        </TranslationProvider>
      </body>
    </html>
  );
}
