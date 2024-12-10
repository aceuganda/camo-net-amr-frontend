"use client";
import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useFetchAdminPermissions } from "@/lib/hooks/usePermissions";
import { denyAccess, allowAccess } from "@/lib/hooks/usePermissions";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useSearch } from "@/context/searchContext";
import { CheckCircle2, XCircle, ChevronLeft, ChevronRight } from "lucide-react";

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
  feedback:string;
  approval_status: string;
  referee_email:string;
}

const AdminRequests = () => {
  const { data, isLoading, error } = useFetchAdminPermissions();
  const datasets: Permission[] = data?.data || [];
  const [selectedRequest, setSelectedRequest] = useState<Permission | null>(
    null
  );
  const [sheetOpen, setSheetOpen] = useState(false);
  const { searchTerm } = useSearch();
  const [denyReason, setDenyReason] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const {
    isSuccess: isDenySuccess,
    error: denyError,
    isPending: denyPending,
    mutate: denyFn,
  } = useMutation({
    mutationFn: denyAccess,
  });

  const {
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

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US");

  const handleViewDetails = (request: Permission) => {
    setSelectedRequest(request);
    setSheetOpen(true);
  };

  const handleAccept = async (id: string) => {
    const request = datasets.find((r) => r.permission_id === id);
    if (request) {
      await allowFn(request.permission_id);
    }
  };

  const handleDeny = async () => {
    if (!denyReason) {
      toast.error("Please add a reason for denial");
      return;
    }
    if (selectedRequest) {
      await denyFn({
        id: selectedRequest.permission_id,
        reason: denyReason,
      });
      setSheetOpen(false);
      setDenyReason("");
    }
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
    <div className="p-6 min-h-screen flex flex-col  bg-white ">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-[#00B9F1]">
          Data Access Requests
        </h1>
      </div>

      {isLoading && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-[#00B9F1]"></div>
        </div>
      )}

      {error && (
        <div className="text-red-600 text-center bg-red-50 p-4 rounded-lg">
          Failed to load data. Please try again later.
        </div>
      )}

      {filteredData.length === 0 && searchTerm && (
        <div className="text-center text-gray-500 bg-gray-50 p-4 rounded-lg">
          No data found for search term: <strong>{searchTerm}</strong>
        </div>
      )}
      <div className="flex-1 overflow-auto">
        {filteredData.length > 0 && !isLoading && !error && (
          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            <Table>
              <TableHeader className="bg-[#00B9F1] text-white">
                <TableRow>
                  <TableHead className="w-[150px]">Dataset</TableHead>
                  <TableHead>Requester</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.map((request) => (
                  <TableRow
                    key={request.permission_id}
                    className="hover:bg-[#F1F8FC] transition-colors cursor-pointer"
                    onClick={() => handleViewDetails(request)}
                  >
                    <TableCell className="font-medium">
                      {request.data_set_name}
                    </TableCell>
                    <TableCell>{request.user_name}</TableCell>
                    <TableCell>{request.user_email}</TableCell>
                    <TableCell>{formatDate(request.created_at)}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          request.status === "Pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {request.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-green-600 hover:bg-green-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewDetails(request);
                          }}
                        >
                          <CheckCircle2 className="mr-2 h-4 w-4" /> Accept
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:bg-red-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewDetails(request);
                          }}
                        >
                          <XCircle className="mr-2 h-4 w-4" /> Deny
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <Pagination className="p-4 bg-gray-50">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentPage(Math.max(1, currentPage - 1));
                    }}
                    className={
                      currentPage === 1 ? "pointer-events-none opacity-50" : ""
                    }
                  />
                </PaginationItem>
                {[...Array(totalPages)].map((_, i) => (
                  <PaginationItem key={i}>
                    <PaginationLink
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentPage(i + 1);
                      }}
                      isActive={currentPage === i + 1}
                    >
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentPage(Math.min(totalPages, currentPage + 1));
                    }}
                    className={
                      currentPage === totalPages
                        ? "pointer-events-none opacity-50"
                        : ""
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" className="w-[500px] overflow-y-auto">
          {selectedRequest && (
            <div className="p-6 space-y-6">
              <SheetHeader>
                <SheetTitle className="text-2xl text-[#00B9F1]">
                  Request Details
                </SheetTitle>
                <SheetDescription>
                  Review the details of this data access request
                </SheetDescription>
              </SheetHeader>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <p className="font-semibold">Dataset:</p>
                  <p>{selectedRequest.data_set_name}</p>

                  <p className="font-semibold mt-4">Requester Name:</p>
                  <p>{selectedRequest.user_name}</p>

                  <p className="font-semibold mt-4">Email:</p>
                  <p>{selectedRequest.user_email}</p>

                  <p className="font-semibold mt-4">Referee Email:</p>
                  <p>
                    {selectedRequest.referee_email ||
                      "No referee was attached to the request"}
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="font-semibold">Institution:</p>
                  <p>{selectedRequest.institution || "Not specified"}</p>

                  <p className="font-semibold mt-4">Request Date:</p>
                  <p>{formatDate(selectedRequest.created_at)}</p>

                  <p className="font-semibold mt-4">Status:</p>
                  <p>{selectedRequest.status}</p>

                  
                  <p className="font-semibold mt-4">Referee Approval Status:</p>
                  <p>
                    {selectedRequest.approval_status ||
                      "No response from referee"}
                  </p>
                </div>
              </div>

                  <div className="space-y-2">
                <p className="font-semibold">Referee Feedback:</p>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">
                  {selectedRequest.feedback || "No response from referee"}
                  </p>
                </div>
              </div>


              <div className="space-y-2">
                <p className="font-semibold">Project Description:</p>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">
                    {selectedRequest.project_description ||
                      "No description provided."}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="font-semibold block">Reason for Denial</label>
                <textarea
                  value={denyReason}
                  onChange={(e) => setDenyReason(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#00B9F1]"
                  rows={4}
                  placeholder="Provide a reason for denying this request..."
                />
              </div>

              <div className="flex gap-4">
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={handleDeny}
                  disabled={denyPending}
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  {denyPending ? "Denying..." : "Deny Request"}
                </Button>
                <Button
                  variant="default"
                  className="w-full bg-[#00B9F1] hover:bg-[#00A0D0]"
                  onClick={() => {
                    handleAccept(selectedRequest.permission_id);
                    setSheetOpen(false);
                  }}
                  disabled={allowPending}
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  {allowPending ? "Approving..." : "Approve Request"}
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default AdminRequests;
