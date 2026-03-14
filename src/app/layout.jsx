import Script from 'next/script';
import "./globals.css";
import { Suspense } from 'react';

export const metadata = {
  title: "Vidsage - AI Video Learning",
  description: "Learn smarter with AI-powered video summaries and study rooms",
  openGraph: {
    title: "Vidsage",
    description: "AI-powered video learning platform",
    url: "https://vidsage.in",
  },
};

export default function RootLayout({ children }) {
  
  return (
    <html lang="en">
      <body >
        <Suspense fallback={null}>
          {children}
        </Suspense>
      </body>
    </html>
  );
}
