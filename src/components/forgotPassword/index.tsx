"use client";

import React, { useState, useEffect } from "react";

import dynamic from "next/dynamic";
import { submitForgotPassword } from "@/lib/hooks/useAuth";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import AuthShell from "@/components/auth/AuthShell";


const DotsLoader = dynamic(() => import("@/components/ui/dotsLoader"), {
  ssr: false,
});

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const myRouter = useRouter();
  const { isSuccess, error, isPending, mutate } = useMutation({
    mutationFn: submitForgotPassword,
  });

  useEffect(() => {
    if (isSuccess) {
      toast.success("Reset link sent successfully");
      setTimeout(() => {
        myRouter.push("/authenticate");
      }, 2000);
    }
  }, [isSuccess]);
  useEffect(() => {
    if (error) {
      toast.error("Failed to send reset password link, please try again later");
    }
  }, [error]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please fill the email field");
      return;
    }
    await mutate(email);
  };

  return (
    <AuthShell
      title="Forgot your password?"
      subtitle="Enter the email linked to your account and we will send you a reset link."
      backHref="/authenticate"
      backLabel="Back to sign in"
    >
      <div className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm outline-none transition focus:border-[#00b9f1] focus:ring-2 focus:ring-[#00b9f1]/20"
                placeholder="Enter your email"
                required
              />
            </div>
            <button
              type="submit"
              className="min-h-[3rem] w-full rounded-xl bg-[#007acc] px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-[#005fa3] sm:w-[12rem]"
            >
              {isPending ? <DotsLoader /> : "Submit"}
            </button>
            {isSuccess && <div className="text-sm text-green-700">Reset email sent. Please check your email to continue.</div>}
          </form>
      </div>
    </AuthShell>
  );
}

export default ForgotPassword;
