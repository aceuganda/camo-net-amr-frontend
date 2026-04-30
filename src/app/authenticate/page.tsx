"use client";

import React, { useState, useEffect, Suspense } from "react";
import { EyeClosedIcon, EyeOpenIcon } from "@radix-ui/react-icons";
import dynamic from "next/dynamic";
import { login, Register } from "@/lib/hooks/useAuth";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Cookies from "js-cookie";
import { AxiosError } from "axios";
import { checkPasswordStrength } from "@/lib/utils";
import AuthShell from "@/components/auth/AuthShell";

const DotsLoader = dynamic(() => import("@/components/ui/dotsLoader"), {
  ssr: false,
});

function LoginFormWithParams() {
  const searchParams = useSearchParams();
  return <LoginForm searchParams={searchParams} />;
}

function LoginForm({ searchParams }: { searchParams: any }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  const router = useRouter();
  const {
    isSuccess: loginSuccess,
    error,
    isPending,
    mutate: loginFn,
  } = useMutation({
    mutationFn: login,
  });

  useEffect(() => {
    if (loginSuccess) {
      toast.success("Signed in successfully");
      const redirectTo = searchParams.get('redirect') || '/datasets/access';
      setTimeout(() => {
        router.push(redirectTo);
      }, 400);
    }
    if (error) {
      const axiosError = (error as AxiosError).response;
      if (axiosError && axiosError.status === 409) {
        toast.error(`Failed to login: This user's access has been revoked`);
      } else {
        toast.error(
          `Failed to login: make sure you have the right login credentials`
        );
      }
    }
  }, [loginSuccess, error, router]);

  const handleLoginSubmit = async (e: any) => {
    e.preventDefault();
    if (password && email) {
      //console.log(password)
      loginFn({ email, password });
    } else {
      toast.error(`Please fill both the login fields`);
    }
  };

  return (
    <form onSubmit={handleLoginSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-slate-700">Email Address</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm outline-none transition focus:border-[#00b9f1] focus:ring-2 focus:ring-[#00b9f1]/20"
          placeholder="Email Address"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700">Password</label>
        <div className="relative mt-2">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
            }}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pr-12 text-sm shadow-sm outline-none transition focus:border-[#00b9f1] focus:ring-2 focus:ring-[#00b9f1]/20"
            placeholder="Enter your password"
          />
          <button
            type="button"
            onClick={handleTogglePasswordVisibility}
            className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100"
          >
            {showPassword ? (
              <EyeOpenIcon className="h-5 w-5" />
            ) : (
              <EyeClosedIcon className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
        <button
          disabled={isPending}
          className="flex min-h-[3rem] w-full items-center justify-center rounded-xl bg-[#00b9f1] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0aa6d8] disabled:opacity-70 sm:min-w-[13rem] sm:w-auto"
        >
          {isPending ? <DotsLoader /> : "LOGIN"}
        </button>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500">
          <Link href="/authenticate/forgot-password" className="transition hover:text-sky-600 hover:underline">
            Forgot password
          </Link>
          <Link href="/authenticate/privacy-policy" className="transition hover:text-sky-600 hover:underline">
            Privacy Policy
          </Link>
        </div>
      </div>
    </form>
  );
}

function RegistrationForm() {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [institution, setInstitution] = useState("");
  const [ageRange, setAgeRange] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPrivacyAccepted, setIsPrivacyAccepted] = useState(false);
  const [isInformationAccurate, setIsInformationAccurate] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState("");

  const { isSuccess, error, isPending, mutate } = useMutation({
    mutationFn: Register,
  });

  useEffect(() => {
    if (isSuccess) {
      toast.success("Registered successfully, please login.");
      window.location.reload();
    }
    if (error) {
      toast.error(
        `Failed to Register this account: An account with this email probably exists on the platform already`
      );
    }
  }, [isSuccess, error]);

  const handleRegistrationSubmit = async (e: any) => {
    e.preventDefault();
    if (!email || !fullName || !password || !institution || !ageRange) {
      toast.error("Please fill all the required fields");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Please make sure the passwords you have entered match");
      return;
    }
    if (!isPrivacyAccepted) {
      toast.error("Please agree to the privacy policy before you continue");
      return;
    }
    if (!isInformationAccurate) {
      toast.error(
        "Please agree that you have submitted the correct information"
      );
      return;
    }
    if (passwordStrength !== "Strong") {
      toast.error("Please use a stronger password.");
      return;
    }

    mutate({
      email,
      name: fullName,
      password,
      institution: institution,
      age_range: ageRange,
    });
  };

  return (
    <form
      onSubmit={handleRegistrationSubmit}
      className="max-h-[34rem] space-y-4 overflow-auto pr-1"
    >
      {/* Email and Full Name row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700">
            Email Address{" "}
            <span className="text-red-600 text-[11px]">(Required)</span>
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm outline-none transition focus:border-[#00b9f1] focus:ring-2 focus:ring-[#00b9f1]/20"
            placeholder="Email Address"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">
            Full Name{" "}
            <span className="text-red-600 text-[11px]">(Required)</span>
          </label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm outline-none transition focus:border-[#00b9f1] focus:ring-2 focus:ring-[#00b9f1]/20"
            placeholder="Full Name"
            required
          />
        </div>
      </div>

      {/* Institution and Age Range row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700">
            Institution{" "}
            <span className="text-red-600 text-[11px]">(Required)</span>
          </label>
          <input
            type="text"
            value={institution}
            onChange={(e) => setInstitution(e.target.value)}
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm outline-none transition focus:border-[#00b9f1] focus:ring-2 focus:ring-[#00b9f1]/20"
            placeholder="Institution"
            required
          />
        </div>
        <div>
          <label title={"For analysis purposes"}  className="block text-sm font-medium text-slate-700">
              Age Range{" "}
              <span className="text-red-600 text-[11px]">(Required)</span>
          </label>
          <select
            value={ageRange}
            onChange={(e) => setAgeRange(e.target.value)}
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm outline-none transition focus:border-[#00b9f1] focus:ring-2 focus:ring-[#00b9f1]/20"
            required
          >
            <option className="text-gray-700" value="" disabled>
              Select Age Range
            </option>
            <option value="18 to 24">18 to 24</option>
            <option value="25 to 34">25 to 34</option>
            <option value="35 to 44">35 to 44</option>
            <option value="45 and above">45 and above</option>
          </select>
        </div>
      </div>

      {/* Password fields row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700">
            Password{" "}
            <span className="text-red-600 text-[11px]">(Required)</span>
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setPasswordStrength(checkPasswordStrength(e.target.value));
            }}
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm outline-none transition focus:border-[#00b9f1] focus:ring-2 focus:ring-[#00b9f1]/20"
            placeholder="Password"
            required
          />
          <p
            className={`text-sm mt-1 ${
              passwordStrength.toLocaleLowerCase() === "strong"
                ? "text-green-600"
                : "text-red-600"
            } `}
          >
            {passwordStrength && `Password strength: ${passwordStrength}`}
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">
            Confirm Password{" "}
            <span className="text-red-600 text-[11px]">(Required)</span>
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm outline-none transition focus:border-[#00b9f1] focus:ring-2 focus:ring-[#00b9f1]/20"
            placeholder="Confirm Password"
            required
          />
        </div>
      </div>

      {/* Checkboxes */}
      <div className="mt-4">
        <div className="mb-2 flex items-start gap-2">
          <input
            type="checkbox"
            id="privacyPolicy"
            className="mt-1"
            checked={isPrivacyAccepted}
            onChange={(e) => setIsPrivacyAccepted(e.target.checked)}
          />
          <label htmlFor="privacyPolicy" className="text-sm leading-6 text-slate-600">
            I accept the Privacy Policy.{" "}
            <Link
              href="/authenticate/privacy-policy"
              className="text-blue-500 hover:underline"
            >
              Privacy Policy
            </Link>
          </label>
        </div>
        <div className="mb-2 flex items-start gap-2">
          <input
            type="checkbox"
            id="informationAccuracy"
            className="mt-1"
            checked={isInformationAccurate}
            onChange={(e) => setIsInformationAccurate(e.target.checked)}
          />
          <label htmlFor="informationAccuracy" className="text-sm leading-6 text-slate-600">
            I confirm that the information provided is accurate to the best of
            my knowledge.
          </label>
        </div>
      </div>

      {/* Button and Privacy Policy Link */}
      <div className="flex flex-wrap justify-between items-center gap-4 mt-4">
        <button
          disabled={isPending}
          className="flex min-h-[3rem] w-full items-center justify-center rounded-xl bg-[#00b9f1] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0aa6d8] disabled:opacity-70 sm:min-w-[13rem] sm:w-auto"
        >
          {isPending && !isSuccess && !error ? <DotsLoader /> : "REGISTER"}
        </button>
      </div>
    </form>
  );
}

function AuthComponent() {
  const [activeTab, setActiveTab] = useState("login");
  const [showCookieConsent, setShowCookieConsent] = useState(false);
  const handleAcceptCookies = () => {
    Cookies.set("cookieConsent", "true");
    setShowCookieConsent(false);
  };
  useEffect(() => {
    const cookieConsent = Cookies.get("cookieConsent");
    if (!cookieConsent) {
      setShowCookieConsent(true);
    }
  }, []);

  return (
    <AuthShell
      title="Access AMRDB"
      backHref="/"
      backLabel="Back to home"
      contentClassName="relative"
    >
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 rounded-2xl border border-sky-100 bg-white p-2 shadow-sm">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setActiveTab("login")}
              className={`rounded-xl px-4 py-3 text-center text-sm font-semibold transition ${
                activeTab === "login"
                  ? "bg-[#00b9f1] text-white shadow-sm"
                  : "text-slate-500 hover:bg-slate-50"
              }`}
            >
              LOGIN
            </button>
            <button
              onClick={() => setActiveTab("registration")}
              className={`rounded-xl px-4 py-3 text-center text-sm font-semibold transition ${
                activeTab === "registration"
                  ? "bg-[#00b9f1] text-white shadow-sm"
                  : "text-slate-500 hover:bg-slate-50"
              }`}
            >
              REGISTRATION
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          {activeTab === "registration" ? <RegistrationForm /> : (
            <Suspense fallback={<div className="py-10 text-center text-sm text-slate-500">Loading...</div>}>
              <LoginFormWithParams />
            </Suspense>
          )}
        </div>
      </div>
      {showCookieConsent && (
        <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto flex max-w-3xl flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl sm:flex-row sm:items-end sm:justify-between">
          <p className="text-sm leading-6 text-slate-600">
            This site uses cookies to enhance your experience. By continuing,
            you agree to our use of cookies.
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleAcceptCookies}
              className="rounded-xl bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600"
            >
              Accept
            </button>
            <button
              onClick={() => {
                setShowCookieConsent(false);
              }}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Reject
            </button>
          </div>
        </div>
      )}
    </AuthShell>
  );
}

export default AuthComponent;
