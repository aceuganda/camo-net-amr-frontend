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

  
  const { data, isSuccess, error, isPending, mutate } = useMutation({
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
    <div
      style={{ backgroundImage: "url(/backgroundImageNet.webp)" }}
      className="flex justify-center items-center min-h-screen bg-gray-100 bg-no-repeat bg-cover relative bg-fixed bg-center"
    >
      <div className="bg-[#161047] absolute h-[100%] w-[30%] top-0 left-0"></div>

      <button
        onClick={() => myRouter.push("/")}
        className="absolute top-4 left-4 px-4 py-2 text-white bg-[#00b9f1] rounded hover:bg-[#007acc]"
      >
        Home
      </button>
      <div className="w-[70%] h-[full] bg-white rounded-[10px] shadow-box z-10">
        <div className="flex font-[700] text-[18px] items-center w-full justify-center p-4 rounded-t-lg border-b-gray-300 border-b-[2px]">
          Reset your password
        </div>
        <div className="py-6 bg-[#f2f2f2] min-h-[33rem] px-4 sm:px-[6rem] rounded-[10px] transition-all relative">
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div>
              <label
                htmlFor="password"
                className="block text-gray-700 text-sm font-bold mb-2"
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
                  className="w-full px-4 py-2 border bg-[#e6e6e6] border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#007acc] focus:border-transparent"
                  placeholder="Enter your new password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2 text-gray-600"
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
                className="block text-gray-700 text-sm font-bold mb-2"
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
                  className="w-full bg-[#e6e6e6] px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#007acc] focus:border-transparent"
                  placeholder="Confirm your new password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2 text-gray-600"
                >
                  {showPassword ? <EyeOpenIcon /> : <EyeClosedIcon />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-[20rem]  min-h-[1.5rem] bg-[#007acc] text-white px-4 py-2 rounded-lg hover:bg-[#005fa3] transition-all"
            >
              {isPending ? <DotsLoader /> : "Reset Password"}
            </button>
            {isSuccess && (
              <div className="text-green-700 text-[11px]">
                {" "}
                Password reset successfully.
              </div>
            )}
            {error && (
              <div className="text-red-700 text-[11px]">
                {" "}
                Something went wrong, please try again later.
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

export default function PasswordResetPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPassword />
    </Suspense>
  );
}
