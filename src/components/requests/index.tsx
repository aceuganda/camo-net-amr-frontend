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
const DotsLoader = dynamic(() => import('../ui/dotsLoader'), { ssr: false });

interface Permission {
  permission_id: string;
  data_set_name: string;
  user_name: string;
  user_email: string;
  status: string;
  created_at: string;
  purpose: any;
  institution: any;
  title: any;
}

const AdminRequests = () => {
  const { data, isLoading, error } = useFetchAdminPermissions();
  const datasets: Permission[] = data?.data || [];
  const [selectedRequest, setSelectedRequest] = useState<Permission | null>(null);
  const [modalType, setModalType] = useState<"approve" | "deny" | null>(null);
  const { searchTerm } = useSearch();

  const { data:denyData, isSuccess:isDenySuccess, error:denyError, isPending:denyPending, mutate:denyFn } = useMutation({
    mutationFn: denyAccess,
  });
  const { data:allowData, isSuccess:allowSuccess, error:allowError, isPending:allowPending, mutate:allowFn } = useMutation({
    mutationFn: allowAccess,
  });

  const filteredData = datasets.filter((data) =>
    data.user_email.toLowerCase().includes(searchTerm.toLowerCase())
  );


  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US");
  };

  const handleAccept = async (id: string) => {
    setSelectedRequest(datasets.find(request => request.permission_id === id) || null);
    setModalType("approve");
  };

  const handleDeny = async (id: string) => {
    setSelectedRequest(datasets.find(request => request.permission_id === id) || null);
    setModalType("deny");
  };

  const handleModalSubmit = async () => {
    if (modalType === "approve" && selectedRequest) {
      await allowFn(selectedRequest.permission_id);
    }
    if (modalType === "deny" && selectedRequest) {
      await denyFn(selectedRequest.permission_id);
    }
    setModalType(null); 
  };

  useEffect(() => {
    if (denyData && isDenySuccess) {
      toast.success("Request updated successfully");
      window.location.reload();
    }
    if (denyError) {
      toast.error(`Failed to update request`);
    }
  }, [denyData, isDenySuccess, denyError]);

  useEffect(() => {
    if (allowData && allowSuccess) {
      toast.success("Request updated successfully");
      window.location.reload();
    }
    if (allowError) {
      toast.error(`Failed to update the request`);
    }
  }, [allowSuccess, allowData, allowError]);

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
        <div className="text-center w-full flex items-start justify-center text-gray-500">
          No data for search term: {searchTerm}{" "}
        </div>
      )}


      {filteredData.length > 0 && !isLoading && !error && (
        <div className="overflow-auto">
          <table className="text-[12px] sm:text-sm border-collapse rounded-t-lg overflow-hidden">
            <thead className="bg-[#00B9F1] text-white">
              <tr>
                <th className="p-5 text-left">Dataset</th>
                <th className="p-5 text-left">Requester Name</th>
                <th className="p-5 text-left">Email</th>
                <th className="p-5 text-left">Date of Request</th>
                <th className="p-5 text-left">Status</th>
                <th className="p-5 text-left">Title</th>
                <th className="p-5 text-left">Institution</th>
                <th className="p-5 text-left">Access Right</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((request: Permission) => (
                <tr key={request.permission_id} className="even:bg-[#EBF7FD]">
                  <td className="border p-5 text-left">{request.data_set_name}</td>
                  <td className="border p-5 text-left">{request.user_name}</td>
                  <td className="border p-5 text-left">{request.user_email}</td>
                  <td className="border p-5 text-left">{formatDate(request.created_at)}</td>
                  <td className="border p-5 text-left">{request.status}</td>
                  <td className="border p-5 text-left">{request.institution}</td>
                  <td className="border p-5 text-left">{request.title}</td>
                  <td className="border p-5 flex flex-row gap-[2rem] justify-center h-[100%] text-left">
                    <button
                      onClick={() => handleAccept(request.permission_id)}
                      className="text-green-600"
                    >
                      {allowPending ? <DotsLoader /> : "Accept"}
                    </button>{" "}
                    |
                    <button
                      onClick={() => handleDeny(request.permission_id)}
                      className="text-red-600"
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
          <div>
            <h2 className="text-lg font-semibold mb-4">Request Details</h2>
            <p><strong>Dataset:</strong> {selectedRequest.data_set_name}</p>
            <p><strong>Requester Name:</strong> {selectedRequest.user_name}</p>
            <p><strong>Email:</strong> {selectedRequest.user_email}</p>
            <p><strong>Date of Request:</strong> {formatDate(selectedRequest.created_at)}</p>
            <p><strong>Status:</strong> {selectedRequest.status}</p>
            <p><strong>Institution:</strong> {selectedRequest.institution}</p>
            <p><strong>Title:</strong> {selectedRequest.title}</p>
            <p><strong>Purpose:</strong> {selectedRequest.purpose}</p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminRequests;
