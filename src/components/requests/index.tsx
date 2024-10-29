"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useFetchAdminPermissions } from "@/lib/hooks/usePermissions";
import dynamic from "next/dynamic";
import { denyAccess, allowAccess } from "@/lib/hooks/usePermissions";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Modal } from "../modal";
import { useSearch } from "@/context/searchContext";

const DotsLoader = dynamic(() => import("../ui/dotsLoader"), { ssr: false });

interface Permission {
  permission_id: string;
  data_set_name: string;
  user_name: string;
  user_email: string;
  status: string;
  created_at: string;
  project_description: string;
  project_title: string;
  institution: any;
  category: string;
  title: any;
}

const AdminRequests = () => {
  const { data, isLoading, error } = useFetchAdminPermissions();
  const datasets: Permission[] = data?.data || [];
  const [selectedRequest, setSelectedRequest] = useState<Permission | null>(
    null
  );
  const [modalType, setModalType] = useState<"approve" | "deny" | null>(null);
  const { searchTerm } = useSearch();
  const [denyReason, setDenyReason] = useState("");

  const {
    data: denyData,
    isSuccess: isDenySuccess,
    error: denyError,
    isPending: denyPending,
    mutate: denyFn,
  } = useMutation({
    mutationFn: denyAccess,
  });
  const {
    data: allowData,
    isSuccess: allowSuccess,
    error: allowError,
    isPending: allowPending,
    mutate: allowFn,
  } = useMutation({
    mutationFn: allowAccess,
  });

  const filteredData = datasets.filter((data) =>
    data.user_email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US");

  const handleAccept = async (id: string) => {
    setSelectedRequest(
      datasets.find((request) => request.permission_id === id) || null
    );
    setModalType("approve");
  };

  const handleDeny = async (id: string) => {
    setSelectedRequest(
      datasets.find((request) => request.permission_id === id) || null
    );
    setModalType("deny");
  };

  const handleModalSubmit = async () => {
    if (modalType === "approve" && selectedRequest) {
      await allowFn(selectedRequest.permission_id);
    }
    if (modalType === "deny" && selectedRequest) {
      if(!denyReason){
        toast.error('Please add a reason for denial')
        return
      }
      await denyFn({
        id: selectedRequest.permission_id,
        reason: denyReason,
      });
    }
    setModalType(null);
    setDenyReason(""); // Reset denial reason
  };

  useEffect(() => {
    if (isDenySuccess) {
      toast.success("Request denied successfully");
      window.location.reload();
    }
    if (denyError) {
      toast.error("Failed to deny request");
    }
  }, [isDenySuccess, denyError]);

  useEffect(() => {
    if (allowSuccess) {
      toast.success("Request approved successfully");
      window.location.reload();
    }
    if (allowError) {
      toast.error("Failed to approve request");
    }
  }, [allowSuccess, allowError]);

  return (
    <div className="flex-1 p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Requests</h1>
      </div>

      {isLoading && (
        <div className="flex justify-center">
          <DotsLoader />
        </div>
      )}

      {error && (
        <div className="text-red-600 text-center">
          Failed to load data. Please try again later.
        </div>
      )}

      {filteredData.length === 0 && searchTerm && (
        <div className="text-center text-gray-500">
          No data found for search term: <strong>{searchTerm}</strong>
        </div>
      )}

      {filteredData.length > 0 && !isLoading && !error && (
        <div className="overflow-auto">
          <table className="w-full border-separate border-spacing-0 rounded-lg shadow-md">
            <thead className="bg-[#00B9F1] text-white">
              <tr>
                <th className="p-4 text-left">Dataset</th>
                <th className="p-4 text-left">Requester Name</th>
                <th className="p-4 text-left">Email</th>
                <th className="p-4 text-left">Date of Request</th>
                <th className="p-4 text-left">Status</th>
                <th className="p-4 text-left">Institution</th>
                <th className="p-4 text-left">Title</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((request) => (
                <tr key={request.permission_id} className="even:bg-[#F1F8FC]">
                  <td className="p-4">{request.data_set_name}</td>
                  <td className="p-4">{request.user_name}</td>
                  <td className="p-4">{request.user_email}</td>
                  <td className="p-4">{formatDate(request.created_at)}</td>
                  <td className="p-4">{request.status}</td>
                  <td className="p-4">{request.institution}</td>
                  <td className="p-4">{request.title}</td>
                  <td className="p-4 flex gap-4 justify-center">
                    <button
                      onClick={() => handleAccept(request.permission_id)}
                      className="text-green-600 hover:underline"
                    >
                      {allowPending ? <DotsLoader /> : "Accept"}
                    </button>
                    <span>|</span>
                    <button
                      onClick={() => handleDeny(request.permission_id)}
                      className="text-red-600 hover:underline"
                    >
                      {denyPending ? <DotsLoader /> : "Deny"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        isOpen={modalType !== null}
        onClose={() => setModalType(null)}
        onSubmit={handleModalSubmit}
        submitText={modalType === "approve" ? "Approve" : "Deny"}
        cancelText="Cancel"
      >
        {selectedRequest && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-center text-gray-700">
              Request Details
            </h2>

            {/* Grid for Primary Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <p>
                  <span className="font-semibold">Title:</span>{" "}
                  {selectedRequest.title}
                </p>
                <p>
                  <span className="font-semibold">Dataset:</span>{" "}
                  {selectedRequest.data_set_name}
                </p>
                <p>
                  <span className="font-semibold">Project Title:</span>{" "}
                  {selectedRequest.project_title}
                </p>
                <p>
                  <span className="font-semibold">Requester Name:</span>{" "}
                  {selectedRequest.user_name}
                </p>
                <p>
                  <span className="font-semibold">Email:</span>{" "}
                  {selectedRequest.user_email}
                </p>
              </div>

              <div className="space-y-2">
                <p>
                  <span className="font-semibold">Institution:</span>{" "}
                  {selectedRequest.institution}
                </p>
                <p>
                  <span className="font-semibold">Date of Request:</span>{" "}
                  {formatDate(selectedRequest.created_at)}
                </p>
                <p>
                  <span className="font-semibold">Status:</span>{" "}
                  {selectedRequest.status}
                </p>
                <p>
                  <span className="font-semibold">User category:</span>{" "}
                  {selectedRequest.category}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="font-semibold">Project Description:</p>
              <div className="p-4 border rounded-lg bg-gray-50">
                <p className="text-sm text-gray-600">
                  {selectedRequest.project_description ||
                    "No description provided."}
                </p>
              </div>
            </div>

            {modalType === "deny" && (
              <div className="mt-4">
                <label className="block font-semibold mb-2">
                  Reason for Denial
                </label>
                <textarea
                  value={denyReason}
                  onChange={(e) => setDenyReason(e.target.value)}
                  className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  placeholder="Provide a reason for denying this request..."
                />
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminRequests;
