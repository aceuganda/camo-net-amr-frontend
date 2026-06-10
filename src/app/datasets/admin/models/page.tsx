"use client";

import { useEffect } from "react";
import { useUserInfor } from "@/lib/hooks/useAuth";
import { useRouter } from "next/navigation";
import AdminModelsPage from "@/components/models/admin";

export default function ModelsAdmin() {
  const { data, isLoading, error } = useUserInfor();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      const roles = data?.data?.user?.roles;
      const isAdmin =
        roles?.includes("admin") || roles?.includes("super_admin");
      if (error || !isAdmin) {
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
  return <AdminModelsPage />;
}
