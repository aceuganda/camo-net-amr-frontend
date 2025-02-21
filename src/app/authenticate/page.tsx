"use client";

import React, { useState, useEffect } from "react";
import { EyeClosedIcon, EyeOpenIcon } from "@radix-ui/react-icons";
import dynamic from "next/dynamic";
import { login, Register } from "@/lib/hooks/useAuth";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Cookies from "js-cookie";
import { AxiosError } from "axios";
import { checkPasswordStrength } from "@/lib/utils";

const DotsLoader = dynamic(() => import("@/components/ui/dotsLoader"), {
  ssr: false,
});

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  const router = useRouter();
  const {
    data,
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
      setTimeout(() => {
        router.push("/datasets/access");
      }, 700);
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
    <form onSubmit={handleLoginSubmit} className="space-y-4">
      <div>
        <label className="block text-gray-700">Email Address</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mt-1 p-2 bg-[#e6e6e6] rounded"
          placeholder="Email Address"
        />
      </div>
      <label className="block text-gray-700">Password</label>
      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
          }}
          className={`w-full mt-1 p-2 bg-[#e6e6e6] rounded pr-10  text-[18px]`}
          placeholder="****"
        />
        <div
          onClick={handleTogglePasswordVisibility}
          className="absolute top-[10px] right-0 flex items-center pr-3 h-[2rem]"
        >
          {showPassword ? (
            <EyeOpenIcon className="w-6 h-6 text-gray-500 top-[10px] " />
          ) : (
            <EyeClosedIcon className="w-6 h-6 text-gray-500" />
          )}
        </div>
      </div>
      <div className="w-full flex justify-between items-end">
        <button
          disabled={isPending}
          className="p-2 sm:min-w-[13rem] flex items-center justify-center min-h-[2.4rem] bg-[#00b9f1] mt-3 text-white rounded hover:bg-[#7ad4ef]"
        >
          {isPending ? <DotsLoader /> : "LOGIN"}
        </button>
        <Link
          href="authenticate/forgot-password"
          className="text-blue-500 hover:underline max-sm:text-[10px]"
        >
          Forgot password
        </Link>
        <Link
          href="authenticate/privacy-policy"
          className="text-blue-500 hover:underline max-sm:text-[10px] "
        >
          Privacy Policy
        </Link>
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

  const { data, isSuccess, error, isPending, mutate } = useMutation({
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
  className="h-[27rem] overflow-auto space-y-4 p-4"
>
  {/* Email and Full Name row */}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div>
      <label className="block text-gray-700">
        Email Address <span className="text-red-600 text-[11px]">(Required)</span>
      </label>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full mt-1 p-2 bg-[#e6e6e6] rounded"
        placeholder="Email Address"
        required
      />
    </div>
    <div>
      <label className="block text-gray-700">
        Full Name <span className="text-red-600 text-[11px]">(Required)</span>
      </label>
      <input
        type="text"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        className="w-full mt-1 p-2 bg-[#e6e6e6] rounded"
        placeholder="Full Name"
        required
      />
    </div>
  </div>

  {/* Institution and Age Range row */}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div>
      <label className="block text-gray-700">
        Institution <span className="text-red-600 text-[11px]">(Required)</span>
      </label>
      <input
        type="text"
        value={institution}
        onChange={(e) => setInstitution(e.target.value)}
        className="w-full mt-1 p-2 bg-[#e6e6e6] rounded"
        placeholder="Institution"
        required
      />
    </div>
    <div>
      <label className="block text-gray-700">
        Age Range <span className="text-red-600 text-[11px]">(Required)</span>
      </label>
      <select
        value={ageRange}
        onChange={(e) => setAgeRange(e.target.value)}
        className="w-full mt-1 p-2 bg-[#e6e6e6] rounded"
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
      <label className="block text-gray-700">
        Password <span className="text-red-600 text-[11px]">(Required)</span>
      </label>
      <input
        type="password"
        value={password}
        onChange={(e) => {
          setPassword(e.target.value)
          setPasswordStrength(checkPasswordStrength(e.target.value));
        }}
        className="w-full mt-1 p-2 bg-[#e6e6e6] rounded"
        placeholder="Password"
        required
      />
      <p className={`text-sm mt-1 ${passwordStrength.toLocaleLowerCase() === 'strong' ? 'text-green-600':'text-red-600'} `}>
        {passwordStrength && `Password strength: ${passwordStrength}`}
      </p>
    </div>
    <div>
      <label className="block text-gray-700">
        Confirm Password <span className="text-red-600 text-[11px]">(Required)</span>
      </label>
      <input
        type="password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        className="w-full mt-1 p-2 bg-[#e6e6e6] rounded"
        placeholder="Confirm Password"
        required
      />
    </div>
  </div>

  {/* Checkboxes */}
  <div className="mt-4">
    <div className="flex items-center mb-2">
      <input
        type="checkbox"
        id="privacyPolicy"
        className="mr-2"
        checked={isPrivacyAccepted}
        onChange={(e) => setIsPrivacyAccepted(e.target.checked)}
      />
      <label htmlFor="privacyPolicy" className="text-sm">
        I accept the Privacy Policy.
      </label>
    </div>
    <div className="flex items-center mb-2">
      <input
        type="checkbox"
        id="informationAccuracy"
        className="mr-2"
        checked={isInformationAccurate}
        onChange={(e) => setIsInformationAccurate(e.target.checked)}
      />
      <label htmlFor="informationAccuracy" className="text-sm">
        I confirm that the information provided is accurate to the best of my knowledge.
      </label>
    </div>
  </div>

  {/* Button and Privacy Policy Link */}
  <div className="flex flex-wrap justify-between items-center gap-4 mt-4">
    <button
      disabled={isPending}
      className="p-2 bg-[#00b9f1] sm:min-w-[13rem] flex items-center justify-center min-h-[2.4rem] text-white rounded hover:bg-[#7ad4ef]"
    >
      {isPending && !isSuccess && !error ? <DotsLoader /> : "REGISTER"}
    </button>
    <Link
      href="authenticate/privacy-policy"
      className="text-blue-500 hover:underline"
    >
      Privacy Policy
    </Link>
  </div>
</form>
  );
}

function AuthComponent() {
  const [activeTab, setActiveTab] = useState("login");
  const [showCookieConsent, setShowCookieConsent] = useState(false);
  const myRouter = useRouter();
  const handleAcceptCookies = () => {
    Cookies.set("cookieConsent", "true", { expires: 60 / 1440 });
    setShowCookieConsent(false);
  };
  useEffect(() => {
    const cookieConsent = Cookies.get("cookieConsent");
    if (!cookieConsent) {
      setShowCookieConsent(true);
    }
  }, []);

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
        {/* <div className="flex justify-between items-center p-4 rounded-t-lg border-b-gray-300 border-b-[2px]">
          <LogoHeader />
        </div> */}
        <div className="py-6 bg-[#f2f2f2] min-h-[33rem] px-4 sm:px-[6rem] rounded-[10px] transition-all relative">
          <div className="flex border-b mb-6">
            <button
              onClick={() => setActiveTab("login")}
              className={`w-1/2 text-center py-2 ${
                activeTab === "login"
                  ? "text-[#00b9f1] border-b-2 border-[#00b9f1]"
                  : "text-gray-500 border-b-2 border-gray-500"
              }`}
            >
              LOGIN
            </button>
            <button
              onClick={() => setActiveTab("registration")}
              className={`w-1/2 text-center py-2 ${
                activeTab === "registration"
                  ? "text-[#00b9f1] border-b-2 border-[#00b9f1]"
                  : "text-gray-500 border-b-2 border-gray-500"
              }`}
            >
              REGISTRATION
            </button>
          </div>
          {activeTab === "registration" ? <RegistrationForm /> : <LoginForm />}
        </div>
      </div>
      {showCookieConsent && (
        <div className="fixed bottom-0 left-0 w-full bg-white p-4 shadow-md flex gap-2  items-end  ">
          <p className="text-gray-700">
            This site uses cookies to enhance your experience. By continuing,
            you agree to our use of cookies.
          </p>
          <button
            onClick={handleAcceptCookies}
            className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          >
            Accept
          </button>
          <button
            onClick={() => {
              setShowCookieConsent(false);
            }}
            className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          >
            Reject
          </button>
        </div>
      )}
    </div>
  );
}

export default AuthComponent;
