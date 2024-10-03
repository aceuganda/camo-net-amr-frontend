"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useVerifyEmail } from "@/lib/hooks/useAuth";
import { Suspense } from 'react';
const DotsLoader = dynamic(() => import("@/components/ui/dotsLoader"), {
  ssr: false,
});

const VerificationPage = () => {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const { isLoading, isError, isSuccess, error } = useVerifyEmail(token);
  const router = useRouter();

  return (
    <div
      style={{ backgroundImage: "url(/backgroundImageNet.webp)" }}
      className="flex justify-center items-center min-h-screen bg-gray-100 bg-no-repeat bg-cover relative bg-fixed bg-center"
    >
      <div className="bg-[#161047] absolute h-[100%] w-[30%] top-0 left-0"></div>

      <div className="w-[95%] sm:w-[70%] max-w-4xl h-auto mt-[3rem] bg-white rounded-[10px] shadow-box z-10 p-6 sm:p-12 relative">
        <div className="flex justify-center items-center flex-col">
        <h1 className="text-2xl font-bold mt-[3rem] mb-4">
          Verifying User Email
        </h1>

        {isLoading && <DotsLoader />}
        {isError && (
          <p className="text-red-500"> Sorry we could not verify you with this email. Beware, the verification link expires in 30 days </p>
        )}
        {isSuccess && (
          <p className="text-green-500">Email verified successfully!</p>
        )}
         <Link
          href="/"
          className="mt-4 inline-block px-4 py-2 text-white bg-[#00b9f1] rounded hover:bg-[#007acc]"
        >
          Go to Home Page
        </Link>
        </div>
      </div>
    </div>
  );
};

export default function AuthVerifyPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerificationPage />
    </Suspense>
  );
}
// export default VerificationPage;
