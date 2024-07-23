

import React from "react";
import LogoHeader from "@/components/logosHeader";
import NavigationBar from "@/components/navigationBar";


export default function DatasetLayout({ children }: { children: React.ReactNode }) {
  return (
    <div >
      <LogoHeader />
      <NavigationBar/>
      {children}
    </div>
  );
}
