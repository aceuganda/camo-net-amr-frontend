"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUserInfor } from "@/lib/hooks/useAuth";
import AllModelsComponent from "@/components/models/allModels";
import NavigationBar from "@/components/navigationBar";
import LogoHeader from "@/components/logosHeader";

export default function ModelsPage() {
  const { error } = useUserInfor();
  const router = useRouter();

  useEffect(() => {
    if (error) {
      router.push("/authenticate?redirect=/models");
    }
  }, [error, router]);

  return (
    <div className="flex flex-col w-[100%] h-[100%]">
      <LogoHeader />
      <NavigationBar />
      <AllModelsComponent />
    </div>
  );
}