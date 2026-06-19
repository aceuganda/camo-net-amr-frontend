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
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CheckCircle2, Search, XCircle } from "lucide-react";

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
  requested_variables: string[];
}

const AdminRequests = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const { data, isLoading, error } = useFetchAdminPermissions(debouncedSearch);
  const datasets: Permission[] = data?.data || [];
  const [selectedRequest, setSelectedRequest] = useState<Permission | null>(
    null
  );
  const [sheetOpen, setSheetOpen] = useState(false);
  const [denyReason, setDenyReason] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    const handle = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 350);
    return () => clearTimeout(handle);
  }, [searchTerm]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  const {
    isPending: denyPending,
    mutate: denyFn,
  } = useMutation({
    mutationFn: denyAccess,
    onSuccess: async () => {
      toast.success("Request denied successfully");
      setSheetOpen(false);
      setDenyReason("");
      await queryClient.invalidateQueries({ queryKey: ["user_permissions"] });
    },
    onError: () => {
      toast.error("Failed to deny request");
    },
  });

  const {
    isPending: allowPending,
    mutate: allowFn,
  } = useMutation({
    mutationFn: allowAccess,
    onSuccess: async () => {
      toast.success("Request approved successfully");
      setSheetOpen(false);
      setDenyReason("");
      await queryClient.invalidateQueries({ queryKey: ["user_permissions"] });
    },
    onError: () => {
      toast.error("Failed to approve request");
    },
  });

  const filteredData = datasets;

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

  const handleAccept = (id: string) => {
    const request = datasets.find((r) => r.permission_id === id);
    if (request) {
      allowFn(request.permission_id);
    }
  };

  const handleDeny = () => {
    if (!denyReason) {
      toast.error("Please add a reason for denial");
      return;
    }
    if (selectedRequest) {
      denyFn({
        id: selectedRequest.permission_id,
        reason: denyReason,
      });
    }
  };

  useEffect(() => {
    if (currentPage > 1 && paginatedData.length === 0 && filteredData.length > 0) {
      setCurrentPage(Math.min(currentPage, totalPages));
    }
  }, [currentPage, filteredData.length, paginatedData.length, totalPages]);

  return (
    <div className="flex min-h-[calc(100vh-3rem)] flex-col gap-4 sm:gap-6">
      <div className="rounded-[24px] border border-white/70 bg-white/90 p-4 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur sm:rounded-[28px] sm:p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-cyan-600 sm:text-xs">
              Access Workflow
            </p>
            <h1 className="mt-2 text-2xl font-semibold text-slate-900 sm:text-3xl">
              Data Access Requests
            </h1>
            <p className="mt-2 max-w-2xl text-xs leading-6 text-slate-600 sm:text-sm">
              Review incoming requests, inspect referee feedback, and approve or deny access without leaving the queue.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by requester, dataset, project, institution..."
                className="w-full rounded-full border border-slate-200 bg-white py-2 pl-9 pr-4 text-xs text-slate-700 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20 sm:w-72 sm:text-sm"
              />
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600 sm:px-4 sm:py-3 sm:text-sm">
              <span className="font-semibold text-slate-900">{filteredData.length}</span>{" "}
              matching requests
            </div>
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="flex h-52 items-center justify-center rounded-[24px] border border-white/70 bg-white/80 sm:h-64 sm:rounded-[28px]">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-[#00B9F1]"></div>
        </div>
      )}

      {error && (
        <div className="rounded-[24px] border border-red-200 bg-red-50 p-4 text-center text-sm text-red-600 sm:rounded-[28px]">
          Failed to load data. Please try again later.
        </div>
      )}

      {filteredData.length === 0 && searchTerm && (
        <div className="rounded-[24px] border border-slate-200 bg-white/90 p-4 text-center text-sm text-gray-500 sm:rounded-[28px]">
          No data found for search term: <strong>{searchTerm}</strong>
        </div>
      )}
      <div className="flex-1 overflow-auto">
        {filteredData.length > 0 && !isLoading && !error && (
          <div className="overflow-hidden rounded-[24px] border border-white/70 bg-white/90 shadow-[0_24px_80px_rgba(15,23,42,0.08)] sm:rounded-[28px]">
            <Table>
              <TableHeader className="bg-slate-950 text-white">
                <TableRow>
                  <TableHead className="w-[140px] px-3 py-3 text-xs text-slate-100 sm:w-[150px] sm:text-sm">Dataset</TableHead>
                  <TableHead className="px-3 py-3 text-xs text-slate-100 sm:text-sm">Requester</TableHead>
                  <TableHead className="hidden px-3 py-3 text-xs text-slate-100 sm:table-cell sm:text-sm">Email</TableHead>
                  <TableHead className="hidden px-3 py-3 text-xs text-slate-100 lg:table-cell lg:text-sm">Date</TableHead>
                  <TableHead className="px-3 py-3 text-xs text-slate-100 sm:text-sm">Status</TableHead>
                  <TableHead className="text-right text-xs text-slate-100 sm:text-sm">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.map((request) => (
                  <TableRow
                    key={request.permission_id}
                    className="cursor-pointer transition-colors hover:bg-cyan-50/70"
                    onClick={() => handleViewDetails(request)}
                    >
                    <TableCell className="px-3 py-3 text-xs font-medium sm:text-sm">
                      {request.data_set_name}
                    </TableCell>
                    <TableCell className="px-3 py-3 text-xs sm:text-sm">{request.user_name}</TableCell>
                    <TableCell className="hidden px-3 py-3 text-xs sm:table-cell sm:text-sm">{request.user_email}</TableCell>
                    <TableCell className="hidden px-3 py-3 text-xs lg:table-cell lg:text-sm">{formatDate(request.created_at)}</TableCell>
                    <TableCell className="px-3 py-3">
                      <span
                        className={`rounded-full px-2 py-1 text-[10px] sm:text-xs ${
                          request.status === "Pending"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-emerald-100 text-emerald-800"
                        }`}
                      >
                        {request.status}
                      </span>
                    </TableCell>
                    <TableCell className="px-2 py-3 text-right sm:px-3">
                      <div className="flex justify-end gap-1 sm:gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2 text-[11px] text-emerald-600 hover:bg-emerald-100 sm:h-9 sm:px-3 sm:text-sm"
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
                          className="h-8 px-2 text-[11px] text-red-600 hover:bg-red-100 sm:h-9 sm:px-3 sm:text-sm"
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

            <Pagination className="bg-slate-50 p-3 sm:p-4">
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
        <SheetContent
          side="right"
          className="w-full max-w-full overflow-y-auto border-l border-slate-200 bg-white px-4 sm:max-w-[500px] sm:px-6"
        >
          {selectedRequest && (
            <div className="space-y-5 py-4 sm:space-y-6 sm:py-6">
              <SheetHeader>
                <SheetTitle className="text-xl text-[#00B9F1] sm:text-2xl">
                  Request Details
                </SheetTitle>
                <SheetDescription className="text-xs sm:text-sm">
                  Review the details of this data access request
                </SheetDescription>
              </SheetHeader>

              <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
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
                <div className="rounded-lg bg-gray-50 p-3 sm:p-4">
                  <p className="text-sm text-gray-600">
                    {selectedRequest.feedback || "No response from referee"}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="font-semibold">Project Title:</p>
                <div className="rounded-lg bg-gray-50 p-3 sm:p-4">
                  <p className="text-sm text-gray-600">
                    {selectedRequest.project_title || "No title provided."}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="font-semibold">Project Description:</p>
                <div className="rounded-lg bg-gray-50 p-3 sm:p-4">
                  <p className="text-sm text-gray-600">
                    {selectedRequest.project_description ||
                      "No description provided."}
                  </p>
                </div>
              </div>

              <div>
              <p className="font-semibold">Requested Variables:</p>
              {selectedRequest.requested_variables &&
                selectedRequest.requested_variables.length > 0 && (
                  <div className="mb-4">
                    
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 sm:gap-4">
                      {selectedRequest.requested_variables.map(
                        (variable, index) => (
                          <div
                            key={index}
                            className="rounded-lg bg-gray-100 p-2 text-[10px] text-gray-800 shadow-sm"
                          >
                            {variable}
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}
                {!selectedRequest.requested_variables && (
                  <div className="rounded-lg bg-gray-50 p-3 sm:p-4">
                  <p className="text-sm text-gray-600">
                    { "No variables selected (old request)"}
                  </p>
                </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="font-semibold block">Reason for Denial</label>
                <textarea
                  value={denyReason}
                  onChange={(e) => setDenyReason(e.target.value)}
                  className="w-full rounded-lg border p-3 text-sm focus:ring-2 focus:ring-[#00B9F1]"
                  rows={4}
                  placeholder="Provide a reason for denying this request..."
                />
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
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
