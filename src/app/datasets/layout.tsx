

import React from "react";
import LogoHeader from "@/components/logosHeader";
import NavigationBar from "@/components/navigationBar";


export default function DatasetLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col w-[100%] h-[100%]">
      <LogoHeader />
      <NavigationBar/>
      {children}
    </div>
  );
}