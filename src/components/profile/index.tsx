"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useUserInfor } from "@/lib/hooks/useAuth";
import dynamic from "next/dynamic";
import { InfoCircledIcon } from "@radix-ui/react-icons";
import { User, Building, Calendar, ExternalLink, Save, ArrowLeft, Sparkles, Shield } from "lucide-react";
const DotsLoader = dynamic(() => import("../ui/dotsLoader"), { ssr: false });
import { updateUser } from "@/lib/hooks/useAuth";
import { useRouter } from "next/navigation";

type UserUpdate = {
  name?: string;
  institution?: string;
  age_range?: string;
  external_profile_link?: string;
};

const UserEditPage = () => {
  const { data, error, isLoading } = useUserInfor();
  const { data: updateData, isSuccess: updateSuccess, error: updateError, isPending, mutate: updateFn } = useMutation({
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
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
    <div className="min-h-screen bg-gradient-to-br max-sm:-z-10 from-slate-50 via-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">

        <div className="bg-white/90 backdrop-blur-sm border border-white/30 rounded-2xl shadow-2xl overflow-hidden">

          <div className="bg-gradient-to-r from-[#24408E] to-[#00B9F1] p-6 ">
            <div className="flex items-center gap-3 text-white">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <User className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Personal Information</h2>
                <p className="text-blue-100 text-sm">Keep your profile up to date</p>
              </div>
            </div>
          </div>

          <div className="p-8 space-y-6">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-[#24408E]">
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
                  className={`w-full px-4 py-3 border rounded-xl bg-white/50 backdrop-blur-sm transition-all duration-200 focus:ring-2 focus:ring-[#00B9F1] focus:border-transparent ${
                    focusedField === 'name' ? 'scale-105 shadow-lg' : 'border-gray-200'
                  }`}
                  placeholder="Enter your full name"
                />
                {focusedField === 'name' && (
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#00B9F1]/10 to-[#24408E]/10 pointer-events-none" />
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-[#24408E]">
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
                  className={`w-full px-4 py-3 border rounded-xl bg-white/50 backdrop-blur-sm transition-all duration-200 focus:ring-2 focus:ring-[#00B9F1] focus:border-transparent ${
                    focusedField === 'institution' ? 'scale-105 shadow-lg' : 'border-gray-200'
                  }`}
                  placeholder="Your organization or university"
                />
                {focusedField === 'institution' && (
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#00B9F1]/10 to-[#24408E]/10 pointer-events-none" />
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-[#24408E]">
                <Calendar className="w-4 h-4" />
                Age Range
              </label>
              <div className="relative">
                <select
                  value={formData.age_range || ""}
                  onChange={(e) => setFormData((prev) => ({ ...prev, age_range: e.target.value }))}
                  onFocus={() => setFocusedField('age_range')}
                  onBlur={() => setFocusedField(null)}
                  className={`w-full px-4 py-3 border rounded-xl bg-white/50 backdrop-blur-sm transition-all duration-200 focus:ring-2 focus:ring-[#00B9F1] focus:border-transparent appearance-none ${
                    focusedField === 'age_range' ? 'scale-105 shadow-lg' : 'border-gray-200'
                  }`}
                >
                  <option value="" disabled>Select your age range</option>
                  <option value="18 to 24">18 to 24</option>
                  <option value="25 to 34">25 to 34</option>
                  <option value="35 to 44">35 to 44</option>
                  <option value="45 and above">45 and above</option>
                </select>
                {focusedField === 'age_range' && (
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#00B9F1]/10 to-[#24408E]/10 pointer-events-none" />
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-[#24408E]">
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
                  className={`w-full px-4 py-3 border rounded-xl bg-white/50 backdrop-blur-sm transition-all duration-200 focus:ring-2 focus:ring-[#00B9F1] focus:border-transparent ${
                    focusedField === 'external_profile_link' ? 'scale-105 shadow-lg' : 'border-gray-200'
                  }`}
                  placeholder="https://orcid.org/0000-0000-0000-0000"
                />
                {focusedField === 'external_profile_link' && (
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#00B9F1]/10 to-[#24408E]/10 pointer-events-none" />
                )}
              </div>
            </div>

            <div className="pt-6">
              <button
                onClick={handleSubmit}
                disabled={isPending}
                className="w-full bg-gradient-to-r from-[#00B9F1] to-[#24408E] text-white py-4 px-6 rounded-xl hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-3 font-medium text-lg disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                {isPending ? (
                  <>
                    <DotsLoader />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5 group-hover:rotate-12 transition-transform duration-200" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="text-center mt-8">
          <p className="text-gray-500 text-sm">
            Your information is secure and will only be used to improve your experience
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserEditPage;