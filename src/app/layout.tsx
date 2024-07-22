import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/lib/providers";
import React from "react";
import { Toaster } from "@/components/ui/sonner";
import { SearchProvider } from "@/context/searchContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Camo-net Data portal",
  description:
    "This portal gives a snippet of the data being handled in the camo-net project",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <Providers>
        <SearchProvider>
          <body className={inter.className}>
            {children}
            <Toaster />
          </body>
        </SearchProvider>
      </Providers>
    </html>
  );
}
