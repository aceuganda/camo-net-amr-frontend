"use client";
import { ReactNode } from "react";
import {
//   QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import React from 'react'

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = React.useState(() => new QueryClient())

  return (
    <QueryClientProvider client={queryClient}>
    {children}
    </QueryClientProvider>
  );
}
