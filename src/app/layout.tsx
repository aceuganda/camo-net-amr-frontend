import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/lib/providers";
import React from "react";
import { Toaster } from "@/components/ui/sonner";
import { SearchProvider } from "@/context/searchContext";
// import  PageWrapper from "@/lib/animationWrapper";


const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AMR, CAMO-NET UG",
  description:
    "This portal gives a snippet of the data being handled in the amr projects in uganda",
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
