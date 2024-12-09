"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useUserInfor } from "@/lib/hooks/useAuth";
import dynamic from "next/dynamic";
import { InfoCircledIcon } from "@radix-ui/react-icons";
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
  const { data:updateData, isSuccess:updateSuccess, error:updateError, isPending, mutate:updateFn } = useMutation({
    mutationFn: updateUser,
  });
  const router = useRouter()

  const [formData, setFormData] = useState<UserUpdate>({
    name: "",
    institution: "",
    age_range: "",
    external_profile_link: "",
  });

  useEffect(() => {
    if (data) {
      setFormData(data.data.user);
    }
  }, [data]);

  useEffect(() => {
    if (updateSuccess) {
      toast.message('Profile has been updated successfully')
    }
  }, [updateSuccess]);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(!formData.name || !formData.institution || !formData.age_range || !formData.external_profile_link ){
        toast.error('Please make sure all fields are filled before you can save')
        return
    }
    updateFn(formData)
  };

  if (isLoading) {
    return (
      <div className="justify-center flex items-center  mt-10">
        <DotsLoader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center flex flex-col items-center justify-center mt-10 text-red-500">
        Failed to load user data
        <button
          onClick={() => router.push('/authenticate')}
          className="px-4 py-2 text-white bg-[#00b9f1] rounded hover:bg-[#007acc]"
        >
          Login
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center h-[80vh] ">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded px-8 pt-6 pb-8 mb-4 w-full max-w-md"
      >
        <h1 className="text-xl font-bold mb-6 text-center">Edit Profile</h1>

        <div className="mb-4">
          <label
            htmlFor="name"
            className="block text-gray-700 text-sm font-bold mb-2"
          >
            Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name || ""}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>

        <div className="mb-4">
          <label
            htmlFor="institution"
            className="block text-gray-700 text-sm font-bold mb-2"
          >
            Institution
          </label>
          <input
            type="text"
            id="institution"
            name="institution"
            value={formData.institution || ""}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>

        <div>
        <label className="block text-gray-700">
          Age Range 
        </label>
        <select
          value={formData.age_range}
          onChange={(e) => {setFormData((prev) => ({ ...prev, age_range: e.target.value }));}}
          className="shadow appearance-none border  w-full mt-1 p-2  rounded focus:outline-none focus:shadow-outline"
          
        >
          <option className=" " value="" disabled>Select Age Range</option>
          <option value="18 to 24">18 to 24</option>
          <option value="25 to 34">25 to 34</option>
          <option value="35 to 44">35 to 44</option>
          <option value="45 and above">45 and above</option>
        </select>
      </div>

        <div className="mb-4 relative group">
          <label
            htmlFor="external_profile_link"
            className="flex flex-row items-center text-gray-700 text-sm font-bold mb-2"
          >
            Research Profile Link
            <div className="relative ml-2 group">
              <InfoCircledIcon className="w-5 h-5 text-blue-600" />

              <div className="absolute -top-10 left-0 bg-gray-800 text-white text-xs rounded p-2 shadow-md whitespace-nowrap hidden group-hover:block">
                Provide a valid research profile link, such as ORCID or Google
                Scholar.
              </div>
            </div>
          </label>

          <input
            type="text"
            id="external_profile_link"
            name="external_profile_link"
            value={formData.external_profile_link || ""}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>

        <div className="flex items-center justify-between">
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            {isPending ? <DotsLoader /> : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserEditPage;
