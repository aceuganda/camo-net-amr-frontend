"use client";

import React, { useState, useEffect } from "react";
import { EyeClosedIcon, EyeOpenIcon } from "@radix-ui/react-icons";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import dynamic from "next/dynamic";
import { useMutation } from "@tanstack/react-query";
import { Suspense } from "react";
import { resetPassword } from "@/lib/hooks/useAuth";
import { checkPasswordStrength } from "@/lib/utils";
import AuthShell from "@/components/auth/AuthShell";

const DotsLoader = dynamic(() => import("@/components/ui/dotsLoader"), {
  ssr: false,
});

function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState("");
  const myRouter = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  
  const { isSuccess, error, isPending, mutate } = useMutation({
    mutationFn: resetPassword,
  });

  const handlePasswordChange = (e: any) => {
    const value = e.target.value;
    setPassword(value);
    setPasswordStrength(checkPasswordStrength(value));
  };

  useEffect(() => {
    if (isSuccess) {
      toast.success("Password Reset successfully");
      setTimeout(() => {
        myRouter.push("/authenticate");
      }, 2000);
    }
  }, [isSuccess]);
  useEffect(() => {
    if (error) {
      toast.error("Failed to reset password");
    }
  }, [error]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }
    if (passwordStrength !== "Strong") {
      toast.error("Please use a stronger password.");
      return;
    }

    await mutate({ token: token, newPassword: confirmPassword });
  };

  return (
    <AuthShell
      title="Reset your password"
      subtitle="Choose a new strong password for your account."
      backHref="/authenticate"
      backLabel="Back to sign in"
    >
      <div className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={password}
                  onChange={handlePasswordChange}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pr-12 text-sm shadow-sm outline-none transition focus:border-[#00b9f1] focus:ring-2 focus:ring-[#00b9f1]/20"
                  placeholder="Enter your new password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-500 hover:bg-slate-100"
                >
                  {showPassword ? <EyeOpenIcon /> : <EyeClosedIcon />}
                </button>
              </div>
              <p className="text-sm mt-1 text-gray-500">
                {passwordStrength && `Password strength: ${passwordStrength}`}
              </p>
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pr-12 text-sm shadow-sm outline-none transition focus:border-[#00b9f1] focus:ring-2 focus:ring-[#00b9f1]/20"
                  placeholder="Confirm your new password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-500 hover:bg-slate-100"
                >
                  {showPassword ? <EyeOpenIcon /> : <EyeClosedIcon />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="min-h-[3rem] w-full rounded-xl bg-[#007acc] px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-[#005fa3] sm:w-[16rem]"
            >
              {isPending ? <DotsLoader /> : "Reset Password"}
            </button>
            {isSuccess && (
              <div className="text-sm text-green-700">Password reset successfully.</div>
            )}
            {error && (
              <div className="text-sm text-red-700">Something went wrong, please try again later.</div>
            )}
          </form>
      </div>
    </AuthShell>
  );
}

export default function PasswordResetPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPassword />
    </Suspense>
  );
}
