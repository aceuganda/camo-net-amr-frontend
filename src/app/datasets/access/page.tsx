"use client"

import React, {useEffect} from "react";
import UserCatalogue from "@/components/userCatalogue";
// import { useUserInfor } from "@/lib/hooks/useAuth";
// import { toast } from "sonner";
// import { useRouter } from "next/navigation";


export default function Catalog() {
  // const { error } = useUserInfor(); 
  // const router = useRouter()
  // useEffect(() => {
  //   if (error){
  //     toast.error('Please login')
  //     router.push("/authenticate");
  //   }
  // }, [error]);
  return (
      <UserCatalogue />
  );
}
 