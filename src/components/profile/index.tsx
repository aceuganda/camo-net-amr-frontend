"use client";

import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useUserInfor } from "@/lib/hooks/useAuth";
import dynamic from "next/dynamic";
import { InfoCircledIcon } from "@radix-ui/react-icons";
import { User, Building, Calendar, ExternalLink, Save, Shield, ArrowLeft } from "lucide-react";
const DotsLoader = dynamic(() => import("../ui/dotsLoader"), { ssr: false });
import { updateUser } from "@/lib/hooks/useAuth";
import Link from "next/link";
import { useRouter } from "next/navigation";

type UserUpdate = {
  name?: string;
  institution?: string;
  age_range?: string;
  external_profile_link?: string;
};

const UserEditPage = () => {
  const { data, error, isLoading } = useUserInfor();
  const { isSuccess: updateSuccess, isPending, mutate: updateFn } = useMutation({
    mutationFn: updateUser,
  });
  const router = useRouter();

  const [formData, setFormData] = useState<UserUpdate>({
    name: "",
    institution: "",
    age_range: "",
    external_profile_link: "",
  });

  const [focusedField, setFocusedField] = useState<string | null>(null);

  useEffect(() => {
    if (data) {
      setFormData(data.data.user);
    }
  }, [data]);

  useEffect(() => {
    if (updateSuccess) {
      toast.message('Profile has been updated successfully');
    }
  }, [updateSuccess]);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.institution || !formData.age_range || !formData.external_profile_link) {
      toast.error('Please make sure all fields are filled before you can save');
      return;
    }
    updateFn(formData);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,#f8fbff_0%,#edf5ff_100%)] px-4 py-10">
        <div className="bg-white/80 backdrop-blur-sm border border-white/30 rounded-2xl shadow-2xl p-8">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-r from-[#00B9F1] to-[#24408E] rounded-full flex items-center justify-center animate-pulse">
              <User className="w-8 h-8 text-white" />
            </div>
            <DotsLoader />
            <p className="text-[#24408E] font-medium">Loading your profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,#f8fbff_0%,#edf5ff_100%)] px-4 py-10">
        <div className="bg-white/90 backdrop-blur-sm border border-red-200 rounded-2xl shadow-2xl p-8 text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-xl font-bold text-red-800 mb-2">Authentication Required</h3>
          <p className="text-red-600 mb-6">Failed to load user data. Please login to continue.</p>
          <button
            onClick={() => router.push('/authenticate')}
            className="w-full bg-gradient-to-r from-[#00B9F1] to-[#24408E] text-white py-3 px-6 rounded-lg hover:shadow-lg transition-all duration-200 font-medium"
          >
            Login Now
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8fbff_0%,#edf5ff_100%)] px-4 py-8 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-xl">
          <div className="flex flex-col gap-4 border-b border-slate-200 bg-white px-5 py-5 sm:px-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-r from-[#24408E] to-[#00B9F1] text-white shadow-sm">
                  <User className="h-6 w-6" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">
                    Personal Information
                  </h1>
                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    Keep your research profile current and accurate.
                  </p>
                </div>
              </div>
              <Link
                href="/datasets"
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-sky-300 hover:text-sky-600 lg:hidden"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Link>
            </div>
            <Link
              href="/datasets"
              className="hidden items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-sky-300 hover:text-sky-600 lg:inline-flex"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to datasets
            </Link>
          </div>

          <div className="bg-slate-50 p-5 sm:p-8">
            <div className="mb-6 rounded-2xl border border-sky-100 bg-white p-4 text-sm leading-6 text-slate-600 shadow-sm sm:p-5">
              This information supports account verification and helps us route
              dataset access requests appropriately.
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="space-y-6">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <User className="w-4 h-4" />
                Full Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="name"
                  value={formData.name || ""}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('name')}
                  onBlur={() => setFocusedField(null)}
                  className={`w-full rounded-xl border bg-white px-4 py-3 text-sm shadow-sm outline-none transition focus:border-[#00B9F1] focus:ring-2 focus:ring-[#00B9F1]/20 ${
                    focusedField === 'name' ? 'border-sky-300 shadow-md' : 'border-slate-200'
                  }`}
                  placeholder="Enter your full name"
                />
                {focusedField === 'name' && (
                  <div className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-r from-[#00B9F1]/5 to-[#24408E]/5" />
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <Building className="w-4 h-4" />
                Institution
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="institution"
                  value={formData.institution || ""}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('institution')}
                  onBlur={() => setFocusedField(null)}
                  className={`w-full rounded-xl border bg-white px-4 py-3 text-sm shadow-sm outline-none transition focus:border-[#00B9F1] focus:ring-2 focus:ring-[#00B9F1]/20 ${
                    focusedField === 'institution' ? 'border-sky-300 shadow-md' : 'border-slate-200'
                  }`}
                  placeholder="Your organization or university"
                />
                {focusedField === 'institution' && (
                  <div className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-r from-[#00B9F1]/5 to-[#24408E]/5" />
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <Calendar className="w-4 h-4" />
                Age Range
              </label>
              <div className="relative">
                <select
                  value={formData.age_range || ""}
                  onChange={(e) => setFormData((prev) => ({ ...prev, age_range: e.target.value }))}
                  onFocus={() => setFocusedField('age_range')}
                  onBlur={() => setFocusedField(null)}
                  className={`w-full appearance-none rounded-xl border bg-white px-4 py-3 text-sm shadow-sm outline-none transition focus:border-[#00B9F1] focus:ring-2 focus:ring-[#00B9F1]/20 ${
                    focusedField === 'age_range' ? 'border-sky-300 shadow-md' : 'border-slate-200'
                  }`}
                >
                  <option value="" disabled>Select your age range</option>
                  <option value="18 to 24">18 to 24</option>
                  <option value="25 to 34">25 to 34</option>
                  <option value="35 to 44">35 to 44</option>
                  <option value="45 and above">45 and above</option>
                </select>
                {focusedField === 'age_range' && (
                  <div className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-r from-[#00B9F1]/5 to-[#24408E]/5" />
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <ExternalLink className="w-4 h-4" />
                Research Profile Link
                <div className="relative group">
                  <InfoCircledIcon className="w-4 h-4 text-[#00B9F1] cursor-help" />
                  <div className="absolute bottom-full left-0 mb-2 bg-gray-800 text-white text-xs rounded-lg p-3 shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                    <div className="relative">
                      Provide a valid research profile link, such as ORCID or Google Scholar
                      <div className="absolute top-full left-4 border-4 border-transparent border-t-gray-800"></div>
                    </div>
                  </div>
                </div>
              </label>
              <div className="relative">
                <input
                  type="url"
                  name="external_profile_link"
                  value={formData.external_profile_link || ""}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('external_profile_link')}
                  onBlur={() => setFocusedField(null)}
                  className={`w-full rounded-xl border bg-white px-4 py-3 text-sm shadow-sm outline-none transition focus:border-[#00B9F1] focus:ring-2 focus:ring-[#00B9F1]/20 ${
                    focusedField === 'external_profile_link' ? 'border-sky-300 shadow-md' : 'border-slate-200'
                  }`}
                  placeholder="https://orcid.org/0000-0000-0000-0000"
                />
                {focusedField === 'external_profile_link' && (
                  <div className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-r from-[#00B9F1]/5 to-[#24408E]/5" />
                )}
              </div>
            </div>

                <div className="pt-4">
              <button
                onClick={handleSubmit}
                disabled={isPending}
                className="flex min-h-[3.25rem] w-full items-center justify-center gap-3 rounded-xl bg-[#00B9F1] px-6 py-3 text-base font-semibold text-white transition hover:bg-[#0aa6d8] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isPending ? (
                  <>
                    <DotsLoader />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-slate-500">
            Your information is secure and will only be used to improve your experience
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserEditPage;
