"use client";

import { useEffect } from "react";
import { useUserInfor } from "@/lib/hooks/useAuth";
import { useRouter } from "next/navigation";
import DatasetEditPage from "@/components/adminDatasetEdit";

export default function DatasetUpdater() {
  const { data, isLoading, error } = useUserInfor();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (error || !data?.data?.user.roles.includes("super_admin")) {
        router.push("/");
      }
    }
  }, [isLoading, error, data, router]);

  if (isLoading) {
    return <p>Loading...</p>; 
  }

  if (error) {
    return <p>Error: Unable to fetch user information</p>;
  }
  return (
      <DatasetEditPage />
  );
}
