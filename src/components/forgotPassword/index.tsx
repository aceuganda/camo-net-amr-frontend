"use client";

import React, { useState, useEffect } from "react";

import dynamic from "next/dynamic";
import { submitForgotPassword } from "@/lib/hooks/useAuth";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRouter } from "next/navigation";


const DotsLoader = dynamic(() => import("@/components/ui/dotsLoader"), {
  ssr: false,
});

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const myRouter = useRouter();
  const { data, isSuccess, error, isPending, mutate } = useMutation({
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
          Enter your account email to reset your password
        </div>
        <div className="py-6 bg-[#f2f2f2] min-h-[33rem] px-4 sm:px-[6rem] rounded-[10px] transition-all relative">
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div>
              <label
                htmlFor="email"
                className="block text-gray-700 text-sm font-bold mb-2"
              >
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-[40%] px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#007acc] focus:border-transparent"
                placeholder="Enter your email"
                required
              />
            </div>
            <button
              type="submit"
              className=" w-[10rem] min-h-[1.5rem] bg-[#007acc] text-white px-4 py-2 rounded-lg hover:bg-[#005fa3] transition-all"
            >
              {isPending ? <DotsLoader /> : "Submit"}
            </button>
            {isSuccess && <div className="text-green-700 text-[11px]"> Reset email sent. Please check your email to reset your password.</div>}
          </form>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
