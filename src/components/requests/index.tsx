"use client";
import { useState, useEffect, useMemo } from "react";
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
import {
  useFetchAdminPermissions,
  denyAccess,
  allowAccess,
  type AdminPermission,
} from "@/lib/hooks/usePermissions";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  AlertTriangle,
  BadgeCheck,
  Building2,
  CalendarClock,
  CheckCircle2,
  Database,
  Download,
  ExternalLink,
  FileText,
  Mail,
  RefreshCw,
  Search,
  ShieldCheck,
  Table2,
  UserRound,
  XCircle,
} from "lucide-react";

const PAGE_SIZE = 10;

const statusFilters = [
  { label: "All", value: "" },
  { label: "Pending", value: "requested" },
  { label: "Approved", value: "approved" },
  { label: "Denied", value: "denied" },
] as const;

const statusMeta = (status?: string | null) => {
  switch ((status || "").toLowerCase()) {
    case "approved":
      return { label: "Approved", tone: "bg-emerald-100 text-emerald-800 ring-emerald-200" };
    case "denied":
      return { label: "Denied", tone: "bg-red-100 text-red-800 ring-red-200" };
    case "requested":
      return { label: "Pending review", tone: "bg-amber-100 text-amber-800 ring-amber-200" };
    default:
      return {
        label: status || "Unknown",
        tone: "bg-slate-100 text-slate-700 ring-slate-200",
      };
  }
};

// Labels stay short — these render inside a narrow table cell.
const refereeStatusMeta = (status?: string | null) => {
  switch ((status || "").toLowerCase()) {
    case "approved":
      return { label: "Endorsed", tone: "bg-emerald-100 text-emerald-800 ring-emerald-200" };
    case "denied":
      return { label: "Declined", tone: "bg-red-100 text-red-800 ring-red-200" };
    case "pending":
      return { label: "Awaiting", tone: "bg-amber-100 text-amber-800 ring-amber-200" };
    default:
      return { label: "Awaiting", tone: "bg-slate-100 text-slate-600 ring-slate-200" };
  }
};

const formatDate = (value?: string | null) =>
  value
    ? new Date(value).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

const formatDateTime = (value?: string | null) =>
  value
    ? new Date(value).toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

const titleCase = (value?: string | null) =>
  value ? value.charAt(0).toUpperCase() + value.slice(1).replace(/_/g, " ") : null;

function Field({
  label,
  value,
  icon: Icon,
  href,
  missingText = "Not provided",
  highlight = false,
}: {
  label: string;
  value?: string | number | null;
  icon?: React.ComponentType<{ className?: string }>;
  href?: string;
  missingText?: string;
  highlight?: boolean;
}) {
  const isMissing = value === null || value === undefined || value === "";

  return (
    <div
      className={`rounded-xl border px-3 py-2.5 ${
        highlight && !isMissing
          ? "border-cyan-200 bg-cyan-50/60"
          : isMissing
          ? "border-dashed border-slate-200 bg-slate-50/60"
          : "border-slate-200 bg-white"
      }`}
    >
      <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
        {Icon ? <Icon className="h-3 w-3" /> : null}
        {label}
      </p>
      {isMissing ? (
        <p className="mt-1 text-sm italic text-slate-400">{missingText}</p>
      ) : href ? (
        <a
          href={href}
          target={href.startsWith("http") ? "_blank" : undefined}
          rel="noreferrer"
          className="mt-1 inline-flex items-center gap-1 break-all text-sm font-medium text-cyan-700 hover:underline"
        >
          {value}
          {href.startsWith("http") ? <ExternalLink className="h-3 w-3" /> : null}
        </a>
      ) : (
        <p className="mt-1 break-words text-sm font-medium text-slate-900">{value}</p>
      )}
    </div>
  );
}

function Section({
  title,
  description,
  icon: Icon,
  children,
}: {
  title: string;
  description?: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-slate-50/50 p-3.5 sm:p-4">
      <div className="mb-3 flex items-start gap-2.5">
        <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-white">
          <Icon className="h-3.5 w-3.5" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
          {description ? (
            <p className="mt-0.5 text-xs leading-5 text-slate-500">{description}</p>
          ) : null}
        </div>
      </div>
      {children}
    </section>
  );
}

const AdminRequests = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [denyReason, setDenyReason] = useState("");
  const [showAllVariables, setShowAllVariables] = useState(false);

  const { data, isLoading, isFetching, error } = useFetchAdminPermissions(
    debouncedSearch,
    { status: statusFilter, page: currentPage, pageSize: PAGE_SIZE }
  );

  const page = data?.data;
  const requests: AdminPermission[] = useMemo(() => page?.items ?? [], [page]);
  const total = page?.total ?? 0;
  const statusCounts = page?.status_counts ?? {};
  const totalPages = Math.max(Math.ceil(total / PAGE_SIZE), 1);

  const selectedRequest = useMemo(
    () => requests.find((request) => request.permission_id === selectedId) ?? null,
    [requests, selectedId]
  );

  useEffect(() => {
    const handle = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 350);
    return () => clearTimeout(handle);
  }, [searchTerm]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, statusFilter]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const { isPending: denyPending, mutate: denyFn } = useMutation({
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

  const { isPending: allowPending, mutate: allowFn } = useMutation({
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

  const handleViewDetails = (request: AdminPermission) => {
    setSelectedId(request.permission_id);
    setDenyReason("");
    setShowAllVariables(false);
    setSheetOpen(true);
  };

  const handleDeny = () => {
    if (!denyReason.trim()) {
      toast.error("Please add a reason for denial");
      return;
    }
    if (selectedRequest) {
      denyFn({ id: selectedRequest.permission_id, reason: denyReason.trim() });
    }
  };

  const variables = selectedRequest?.requested_variables ?? [];
  const visibleVariables = showAllVariables ? variables : variables.slice(0, 24);
  const isDecided =
    selectedRequest?.status === "approved" || selectedRequest?.status === "denied";

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
              Review the full request record — requester, project, IRB approval and
              referee endorsement — then approve or deny without leaving the queue.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search requester, dataset, project, IRB, referee..."
                className="w-full rounded-full border border-slate-200 bg-white py-2 pl-9 pr-4 text-xs text-slate-700 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20 sm:w-80 sm:text-sm"
              />
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600 sm:px-4 sm:py-3 sm:text-sm">
              <span className="font-semibold text-slate-900">{total}</span>{" "}
              matching {total === 1 ? "request" : "requests"}
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {statusFilters.map((filter) => {
            const count =
              filter.value === ""
                ? Object.values(statusCounts).reduce((sum, value) => sum + value, 0)
                : statusCounts[filter.value] ?? 0;
            const active = statusFilter === filter.value;

            return (
              <button
                key={filter.value || "all"}
                type="button"
                onClick={() => setStatusFilter(filter.value)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                  active
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                }`}
              >
                {filter.label}
                <span
                  className={`ml-2 rounded-full px-1.5 py-0.5 text-[10px] ${
                    active ? "bg-white/20" : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {isLoading && (
        <div className="flex h-52 items-center justify-center rounded-[24px] border border-white/70 bg-white/80 sm:h-64 sm:rounded-[28px]">
          <div className="h-16 w-16 animate-spin rounded-full border-t-4 border-[#00B9F1]"></div>
        </div>
      )}

      {error && !isLoading && (
        <div className="rounded-[24px] border border-red-200 bg-red-50 p-4 text-center text-sm text-red-600 sm:rounded-[28px]">
          Failed to load data. Please try again later.
        </div>
      )}

      {!isLoading && !error && requests.length === 0 && (
        <div className="rounded-[24px] border border-slate-200 bg-white/90 p-6 text-center text-sm text-slate-500 sm:rounded-[28px]">
          {debouncedSearch ? (
            <>
              No requests found for <strong>{debouncedSearch}</strong>
            </>
          ) : (
            "There are no data access requests in this view yet."
          )}
        </div>
      )}

      <div className="flex-1 overflow-auto">
        {requests.length > 0 && !error && (
          <div
            className={`overflow-hidden rounded-[24px] border border-white/70 bg-white/90 shadow-[0_24px_80px_rgba(15,23,42,0.08)] transition-opacity sm:rounded-[28px] ${
              isFetching ? "opacity-60" : ""
            }`}
          >
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-950 text-white">
                  <TableRow>
                    <TableHead className="px-3 py-3 text-xs text-slate-100 sm:text-sm">
                      Dataset
                    </TableHead>
                    <TableHead className="px-3 py-3 text-xs text-slate-100 sm:text-sm">
                      Requester
                    </TableHead>
                    <TableHead className="hidden px-3 py-3 text-xs text-slate-100 lg:table-cell lg:text-sm">
                      Project
                    </TableHead>
                    <TableHead className="hidden px-3 py-3 text-xs text-slate-100 md:table-cell md:text-sm">
                      IRB No.
                    </TableHead>
                    <TableHead className="hidden px-3 py-3 text-xs text-slate-100 xl:table-cell xl:text-sm">
                      Referee
                    </TableHead>
                    <TableHead className="hidden px-3 py-3 text-xs text-slate-100 lg:table-cell lg:text-sm">
                      Submitted
                    </TableHead>
                    <TableHead className="px-3 py-3 text-xs text-slate-100 sm:text-sm">
                      Status
                    </TableHead>
                    <TableHead className="px-3 py-3 text-right text-xs text-slate-100 sm:text-sm">
                      Action
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.map((request) => {
                    const status = statusMeta(request.status);
                    const referee = refereeStatusMeta(request.approval_status);

                    return (
                      <TableRow
                        key={request.permission_id}
                        className="cursor-pointer align-top transition-colors hover:bg-cyan-50/70"
                        onClick={() => handleViewDetails(request)}
                      >
                        <TableCell className="px-3 py-3 text-xs font-medium sm:text-sm">
                          <span className="block max-w-[16rem] truncate">
                            {request.data_set_name || "—"}
                          </span>
                          {request.data_set_amr_category ? (
                            <span className="mt-1 block text-[11px] font-normal text-slate-500">
                              {request.data_set_amr_category}
                            </span>
                          ) : null}
                        </TableCell>
                        <TableCell className="px-3 py-3 text-xs sm:text-sm">
                          <span className="block font-medium text-slate-900">
                            {request.user_name || "—"}
                          </span>
                          <span className="mt-1 block max-w-[14rem] truncate text-[11px] text-slate-500">
                            {request.institution || request.user_institution || request.user_email}
                          </span>
                        </TableCell>
                        <TableCell className="hidden px-3 py-3 text-xs lg:table-cell lg:text-sm">
                          <span className="block max-w-[16rem] truncate">
                            {request.project_title || (
                              <span className="italic text-slate-400">No title</span>
                            )}
                          </span>
                        </TableCell>
                        <TableCell className="hidden px-3 py-3 text-xs md:table-cell md:text-sm">
                          {request.irb_number ? (
                            <span className="font-mono text-[11px] text-slate-800">
                              {request.irb_number}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] text-amber-600">
                              <AlertTriangle className="h-3 w-3" /> Missing
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="hidden px-3 py-3 xl:table-cell">
                          <span
                            className={`inline-flex rounded-full px-2 py-1 text-[10px] font-medium ring-1 ${referee.tone}`}
                          >
                            {referee.label}
                          </span>
                        </TableCell>
                        <TableCell className="hidden px-3 py-3 text-xs lg:table-cell lg:text-sm">
                          {formatDate(request.created_at)}
                        </TableCell>
                        <TableCell className="px-3 py-3">
                          <span
                            className={`inline-flex rounded-full px-2 py-1 text-[10px] font-medium ring-1 sm:text-xs ${status.tone}`}
                          >
                            {status.label}
                          </span>
                        </TableCell>
                        <TableCell className="px-2 py-3 text-right sm:px-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2 text-[11px] text-cyan-700 hover:bg-cyan-100 sm:h-9 sm:px-3 sm:text-sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewDetails(request);
                            }}
                          >
                            <FileText className="mr-1.5 h-4 w-4" /> Review
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {totalPages > 1 && (
              <Pagination className="bg-slate-50 p-3 sm:p-4">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentPage(Math.max(1, currentPage - 1));
                      }}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
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
                        currentPage === totalPages ? "pointer-events-none opacity-50" : ""
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </div>
        )}
      </div>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent
          side="right"
          className="w-full max-w-full overflow-y-auto border-l border-slate-200 bg-white p-0 sm:max-w-[46rem]"
        >
          {selectedRequest && (
            <div className="flex min-h-full flex-col">
              <div className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 px-4 py-4 backdrop-blur sm:px-6">
                <SheetHeader className="space-y-0 text-left">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ${
                        statusMeta(selectedRequest.status).tone
                      }`}
                    >
                      {statusMeta(selectedRequest.status).label}
                    </span>
                    {selectedRequest.data_set_amr_category ? (
                      <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600">
                        {selectedRequest.data_set_amr_category}
                      </span>
                    ) : null}
                    {(selectedRequest.re_request_count ?? 0) > 0 ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-2.5 py-1 text-[11px] font-medium text-indigo-700">
                        <RefreshCw className="h-3 w-3" />
                        Re-requested {selectedRequest.re_request_count}×
                      </span>
                    ) : null}
                  </div>
                  <SheetTitle className="mt-2 text-lg font-semibold text-slate-900 sm:text-xl">
                    {selectedRequest.data_set_name || "Data access request"}
                  </SheetTitle>
                  <SheetDescription className="mt-1 text-xs text-slate-500 sm:text-sm">
                    Requested by {selectedRequest.user_name || "an unknown user"} ·
                    Submitted {formatDateTime(selectedRequest.created_at)}
                  </SheetDescription>
                </SheetHeader>
              </div>

              <div className="space-y-4 px-4 py-5 sm:px-6">
                {!selectedRequest.irb_number ||
                !selectedRequest.agreed_to_privacy ||
                !selectedRequest.approval_status ? (
                  <div className="flex items-start gap-2.5 rounded-2xl border border-amber-200 bg-amber-50 px-3.5 py-3 text-amber-900">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                    <div className="text-xs leading-5">
                      <p className="font-semibold">Incomplete request record</p>
                      <ul className="mt-1 list-disc space-y-0.5 pl-4">
                        {!selectedRequest.irb_number && (
                          <li>No IRB / ethics approval number was supplied.</li>
                        )}
                        {!selectedRequest.agreed_to_privacy && (
                          <li>The confidentiality agreement was not acknowledged.</li>
                        )}
                        {!selectedRequest.approval_status && (
                          <li>The nominated referee has not responded yet.</li>
                        )}
                      </ul>
                    </div>
                  </div>
                ) : null}

                <Section
                  title="Ethics & compliance"
                  description="Approval evidence supplied with this request."
                  icon={ShieldCheck}
                >
                  <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                    <Field
                      label="IRB / Ethics approval number"
                      value={selectedRequest.irb_number}
                      missingText="No IRB number supplied"
                      highlight
                    />
                    <Field
                      label="Confidentiality agreement"
                      value={
                        selectedRequest.agreed_to_privacy
                          ? "Accepted by requester"
                          : undefined
                      }
                      missingText="Not acknowledged"
                    />
                    <Field
                      label="Data sharing policy category"
                      value={titleCase(selectedRequest.category)}
                    />
                    <Field
                      label="Variables requested"
                      value={selectedRequest.requested_variables_count || undefined}
                      missingText="None recorded (legacy request)"
                      icon={Table2}
                    />
                  </div>
                </Section>

                <Section
                  title="Requester"
                  description="Who is asking for the data and on whose behalf."
                  icon={UserRound}
                >
                  <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                    <Field label="Full name" value={selectedRequest.user_name} />
                    <Field
                      label="Email"
                      value={selectedRequest.user_email}
                      href={
                        selectedRequest.user_email
                          ? `mailto:${selectedRequest.user_email}`
                          : undefined
                      }
                      icon={Mail}
                    />
                    <Field
                      label="Position / title"
                      value={selectedRequest.title}
                    />
                    <Field
                      label="Institution (on request)"
                      value={selectedRequest.institution}
                      icon={Building2}
                    />
                    <Field
                      label="Institution (on profile)"
                      value={selectedRequest.user_institution}
                    />
                    <Field label="Contact" value={selectedRequest.user_contact} />
                    <Field
                      label="Account verified"
                      value={selectedRequest.user_is_verified ? "Verified" : undefined}
                      missingText="Not verified"
                      icon={BadgeCheck}
                    />
                    <Field
                      label="External profile"
                      value={selectedRequest.user_external_profile_link}
                      href={selectedRequest.user_external_profile_link || undefined}
                    />
                  </div>
                </Section>

                <Section
                  title="Project"
                  description="The stated purpose the data will be used for."
                  icon={FileText}
                >
                  <div className="space-y-2.5">
                    <Field label="Project title" value={selectedRequest.project_title} />
                    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2.5">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                        Project description / abstract
                      </p>
                      <p className="mt-1.5 whitespace-pre-line text-sm leading-6 text-slate-700">
                        {selectedRequest.project_description || (
                          <span className="italic text-slate-400">
                            No description provided.
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </Section>

                <Section
                  title="Reference / referee"
                  description="The referee nominated by the requester and their endorsement."
                  icon={BadgeCheck}
                >
                  <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                    <Field
                      label="Nominated referee"
                      value={selectedRequest.referee_name}
                      missingText="No referee attached to this request"
                    />
                    <Field
                      label="Referee email"
                      value={selectedRequest.referee_email}
                      href={
                        selectedRequest.referee_email
                          ? `mailto:${selectedRequest.referee_email}`
                          : undefined
                      }
                      icon={Mail}
                      missingText="No referee attached to this request"
                    />
                  </div>

                  <div className="mt-3 space-y-2.5">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                      Referee responses ({selectedRequest.referee_responses?.length ?? 0})
                    </p>
                    {(selectedRequest.referee_responses ?? []).length === 0 ? (
                      <div className="rounded-xl border border-dashed border-slate-200 bg-white px-3 py-3 text-sm italic text-slate-400">
                        The referee has not responded yet.
                      </div>
                    ) : (
                      (selectedRequest.referee_responses ?? []).map((response) => {
                        const tone = refereeStatusMeta(response.approval_status);
                        return (
                          <div
                            key={response.id}
                            className="rounded-xl border border-slate-200 bg-white px-3 py-3"
                          >
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-slate-900">
                                  {response.referee_name || "Unnamed referee"}
                                </p>
                                <p className="truncate text-[11px] text-slate-500">
                                  {response.referee_email || "No email on record"}
                                </p>
                              </div>
                              <div className="flex shrink-0 items-center gap-2">
                                <span
                                  className={`inline-flex rounded-full px-2 py-1 text-[10px] font-medium ring-1 ${tone.tone}`}
                                >
                                  {tone.label}
                                </span>
                                <span className="text-[11px] text-slate-500">
                                  {formatDate(response.response_date)}
                                </span>
                              </div>
                            </div>
                            <p className="mt-2 whitespace-pre-line border-t border-slate-100 pt-2 text-sm leading-6 text-slate-700">
                              {response.feedback || (
                                <span className="italic text-slate-400">
                                  No written feedback supplied.
                                </span>
                              )}
                            </p>
                          </div>
                        );
                      })
                    )}
                  </div>
                </Section>

                <Section
                  title="Requested variables"
                  description={
                    variables.length > 0
                      ? `${variables.length} variable${
                          variables.length === 1 ? "" : "s"
                        } selected for download.`
                      : undefined
                  }
                  icon={Table2}
                >
                  {variables.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-slate-200 bg-white px-3 py-3 text-sm italic text-slate-400">
                      No variables were selected (legacy request — full dataset).
                    </div>
                  ) : (
                    <>
                      <div className="flex flex-wrap gap-1.5">
                        {visibleVariables.map((variable) => (
                          <span
                            key={variable}
                            className="rounded-lg border border-slate-200 bg-white px-2 py-1 font-mono text-[11px] text-slate-700"
                          >
                            {variable}
                          </span>
                        ))}
                      </div>
                      {variables.length > 24 && (
                        <button
                          type="button"
                          onClick={() => setShowAllVariables((prev) => !prev)}
                          className="mt-2.5 text-xs font-semibold text-cyan-700 hover:underline"
                        >
                          {showAllVariables
                            ? "Show fewer"
                            : `Show all ${variables.length} variables`}
                        </button>
                      )}
                    </>
                  )}
                </Section>

                <Section
                  title="Dataset"
                  description="What the requester will get access to."
                  icon={Database}
                >
                  <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                    <Field label="Dataset" value={selectedRequest.data_set_name} />
                    <Field
                      label="AMR category"
                      value={selectedRequest.data_set_amr_category}
                    />
                    <Field
                      label="Principal investigator"
                      value={selectedRequest.data_set_principal_investigator}
                    />
                    <Field label="Licence" value={selectedRequest.data_set_license} />
                    <Field
                      label="DOI"
                      value={selectedRequest.data_set_doi}
                      href={
                        selectedRequest.data_set_doi
                          ? `https://doi.org/${selectedRequest.data_set_doi.replace(
                              /^https?:\/\/doi\.org\//,
                              ""
                            )}`
                          : undefined
                      }
                    />
                    <Field
                      label="Citation"
                      value={selectedRequest.data_set_citation_info}
                    />
                  </div>
                </Section>

                <Section
                  title="Request history"
                  description="Timeline and decision trail."
                  icon={CalendarClock}
                >
                  <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                    <Field
                      label="Submitted"
                      value={formatDateTime(selectedRequest.created_at)}
                    />
                    <Field
                      label="Last updated"
                      value={formatDateTime(selectedRequest.last_update)}
                    />
                    <Field
                      label="Downloads"
                      value={selectedRequest.downloads_count ?? 0}
                      icon={Download}
                    />
                    <Field
                      label="Re-requests"
                      value={selectedRequest.re_request_count ?? 0}
                      icon={RefreshCw}
                    />
                    <Field
                      label="Decided by"
                      value={selectedRequest.approver_name}
                      missingText="No decision recorded"
                    />
                    <Field
                      label="Request ID"
                      value={selectedRequest.permission_id}
                    />
                  </div>

                  {selectedRequest.denial_reason ? (
                    <div className="mt-2.5 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-red-700">
                        Reason for denial
                      </p>
                      <p className="mt-1 whitespace-pre-line text-sm leading-6 text-red-900">
                        {selectedRequest.denial_reason}
                      </p>
                    </div>
                  ) : null}
                </Section>
              </div>

              <div className="sticky bottom-0 mt-auto space-y-3 border-t border-slate-200 bg-white/95 px-4 py-4 backdrop-blur sm:px-6">
                {isDecided ? (
                  <p className="rounded-xl bg-slate-100 px-3 py-2 text-xs text-slate-600">
                    This request was already{" "}
                    <span className="font-semibold">
                      {statusMeta(selectedRequest.status).label.toLowerCase()}
                    </span>
                    . Submitting a new decision will overwrite the existing one.
                  </p>
                ) : null}

                <div>
                  <label className="block text-xs font-semibold text-slate-700">
                    Reason for denial{" "}
                    <span className="font-normal text-slate-400">
                      (required to deny — shared with the requester)
                    </span>
                  </label>
                  <textarea
                    value={denyReason}
                    onChange={(e) => setDenyReason(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20"
                    rows={3}
                    placeholder="Explain what is missing or why access cannot be granted..."
                  />
                </div>

                <div className="flex flex-col gap-2.5 sm:flex-row">
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={handleDeny}
                    disabled={denyPending || allowPending}
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    {denyPending ? "Denying..." : "Deny Request"}
                  </Button>
                  <Button
                    variant="default"
                    className="w-full bg-[#00B9F1] hover:bg-[#00A0D0]"
                    onClick={() => allowFn(selectedRequest.permission_id)}
                    disabled={allowPending || denyPending}
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    {allowPending ? "Approving..." : "Approve Request"}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default AdminRequests;
