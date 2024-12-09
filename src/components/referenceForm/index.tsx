"use client";

import { useState,useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useGetRequestUser, submitReference } from "@/lib/hooks/useAuth";
import { useMutation } from "@tanstack/react-query";
import dynamic from "next/dynamic";
const DotsLoader = dynamic(() => import("../ui/dotsLoader"), { ssr: false });

const RefereeResponseForm = ({ id }: any) => {
  const router = useRouter();
  const [userName, setUserName] = useState("")
  const [formData, setFormData] = useState({
    referee_name: "",
    referee_email: "",
    feedback: "",
    approval_status: "pending",
  });
  const { data, isLoading } = useGetRequestUser(id);
  const { data:refData, isSuccess:refSuccess, error, isPending, mutate:submitFn } = useMutation({
    mutationFn: submitReference,
  });

  useEffect(() => {
    if (data) {
      setUserName(data.data.user_name)
    }
  }, [data]);

  useEffect(() => {
    if (refSuccess) {
      toast.message('Submitted successfully. Thank you')
      router.push('/')
    }
  }, [refSuccess]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) {
        toast.error('Invalid link')
        return;
      }
    const { referee_name, referee_email, feedback, approval_status } = formData;
        if (!referee_name || !referee_email || !feedback || !approval_status) {
            toast.error("Please fill all the fields before you can submit this form");
            return;
        }
    submitFn({ user_permission_id:id,referee_name,referee_email,feedback, approval_status })
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md max-w-md w-full">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Referee Response Form
        </h2>
        <p className="text-sm text-gray-600 mb-6">
          You have received a data access referee request from the AMRDB site. A
          user by names of <span className="font-[600]">{isLoading? "loading": userName }</span> generated this request.
        </p>
        <p>Please fill in the form below to provide your response.</p>

        {error && <div className="text-red-500 text-sm mb-4">Failed to submit reference</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="referee_name"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Referee Name
            </label>
            <input
              type="text"
              id="referee_name"
              name="referee_name"
              value={formData.referee_name}
              onChange={handleChange}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="referee_email"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Referee Email
            </label>
            <input
              type="email"
              id="referee_email"
              name="referee_email"
              value={formData.referee_email}
              onChange={handleChange}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="feedback"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Feedback
            </label>
            <textarea
              id="feedback"
              name="feedback"
              value={formData.feedback}
              onChange={handleChange}
              rows={4}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Approval Status */}
          <div className="mb-6">
            <label
              htmlFor="approval_status"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Approval Status
            </label>
            <select
              id="approval_status"
              name="approval_status"
              value={formData.approval_status}
              onChange={handleChange}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="pending" disabled>
                Select Approval Status
              </option>
              <option value="approved">Approve</option>
              <option value="denied">Reject</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
          >
            {isPending ? <DotsLoader/>:"Submit Response"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RefereeResponseForm;
