import type { Metadata } from "next";
import "./globals.css"; // <-- CRITICAL: Required for Tailwind CSS
import NextTopLoader from "nextjs-toploader";

export const metadata: Metadata = {
  title: "ProcGen Config Portal",
  description: "Super Admin Configuration Portal",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-[#02040A] text-white antialiased font-sans">
        <NextTopLoader color="#3b82f6" initialPosition={0.08} crawlSpeed={200} height={3} crawl={true} showSpinner={true} easing="ease" speed={200} shadow="0 0 10px #3b82f6,0 0 5px #3b82f6" />
        {children}
      </body>
    </html>
  );
}