import Script from 'next/script';
import "./globals.css";
import { Suspense } from 'react';

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
