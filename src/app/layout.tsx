import type { Metadata } from "next";
import Image from 'next/image';

import "@/app/globals.css";

export const metadata: Metadata = {
  title: "Hacker News Test Suite",
  description: "A web application designed to test the Hacker News website.",
  icons: {
    icon: '/favicon.svg',
  }
};

// Root layout for the application
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {/* Header: Logo, Title, Description */}
        <header>
          <div className="flex items-center border-2">
            <Image src="/favicon.svg" alt="Hacker News Logo" width={50} height={50}/>
            <div className="flex flex-col">
              <h2 className="text-lg font-bold ml-4">
                Hacker News Test Suite
              </h2>
              <p className="text-sm text-gray-500 ml-4">
                A web app designed to test the Hacker News website.
              </p>
            </div>
          </div>
        </header>

        {/* Main content: Left panel (tests list) and right panel (console output) */}
        <main className="flex-1 flex min-h-screen">{children}</main>

        {/* Footer: Author */}
        <footer>
          <div className="text-left ml-4 text-lg font-bold p-2">
            Author: npweber
          </div>
        </footer>
      </body>
    </html>
  );
}
