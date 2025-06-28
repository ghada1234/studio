import type { Metadata } from 'next';
import './globals.css';
import { AppShell } from '@/components/layout/app-shell';
import { DailyLogProvider } from '@/hooks/use-daily-log';
import { Toaster } from '@/components/ui/toaster';

export const metadata: Metadata = {
  title: 'نوتري سناب',
  description: 'حلل الوجبات، تتبع العناصر الغذائية، واحصل على اقتراحات مدعومة بالذكاء الاصطناعي.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className="dark">
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
        <DailyLogProvider>
          <AppShell>{children}</AppShell>
          <Toaster />
        </DailyLogProvider>
      </body>
    </html>
  );
}
