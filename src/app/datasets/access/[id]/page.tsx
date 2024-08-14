"use client"
import DatasetDetails from "@/components/dataDetails";
import React, {useEffect} from "react";
// import { useUserInfor } from "@/lib/hooks/useAuth";
// import { toast } from "sonner";
// import { useRouter } from "next/navigation";


export default function Catalog({ params }: { params: { id: string } }) {
  // const { error } = useUserInfor(); 
  // const router = useRouter()
  // useEffect(() => {
  //   if (error){
  //     toast.error('Please login')
  //     router.push("/authenticate");
  //   }
  // }, [error]);
  return (
      <DatasetDetails id={params.id} />
  );
}
