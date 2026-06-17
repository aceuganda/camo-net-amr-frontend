"use client";
import React, { useState, useEffect, FormEvent } from "react";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Clock,
  XCircle,
  Plus,
} from "lucide-react";
import { useGetExternalDatasets, submitExternalDataset } from "@/lib/hooks/useExternalDatasets";
import dynamic from "next/dynamic";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { toast } from "sonner";
const DotsLoader = dynamic(() => import("../ui/dotsLoader"), { ssr: false });

const initialState = {
  name: "",
  category: "",
  type: "",
  size: "",
  countries: "",
  project_status: "",
  title: "",
  thematic_area: "",
  study_design: "",
  data_format: "",
  source: "",
  start_date: "",
  end_date: "",
  protocol_id: "",
  country_protocol_id: "",
  on_hold_reason: "",
  data_collection_methods: "",
  entries_count: "",
  citation_info: "",
  project_type: "",
  main_project_name: "",
  data_capture_method: "",
  amr_category: "",
  acronym: "",
  description: "",
};

type FieldName = keyof typeof initialState;
type FieldKind = "text" | "textarea" | "select" | "date";

interface FieldConfig {
  name: FieldName;
  label: string;
  type: FieldKind;
  placeholder?: string;
  options?: string[];
}

const fieldGroups: { title: string; description: string; fields: FieldConfig[] }[] = [
  {
    title: "Dataset Identity",
    description: "Core identifying information for the dataset.",
    fields: [
      { name: "name", label: "Name", type: "text" },
      { name: "title", label: "Title", type: "text" },
      { name: "acronym", label: "Acronym", type: "text" },
      { name: "category", label: "Category", type: "text" },
      { name: "amr_category", label: "AMR Category", type: "text" },
      { name: "thematic_area", label: "Thematic Area", type: "text" },
    ],
  },
  {
    title: "Project Details",
    description: "Where and how the underlying project runs.",
    fields: [
      { name: "project_type", label: "Project Type", type: "text" },
      { name: "main_project_name", label: "Main Project Name", type: "text" },
      { name: "project_status", label: "Project Status", type: "select", options: ["Active", "Closed", "On Hold"] },
      { name: "study_design", label: "Study Design", type: "text" },
      { name: "source", label: "Source", type: "text" },
      { name: "countries", label: "Countries", type: "text", placeholder: "Uganda, Kenya.." },
    ],
  },
  {
    title: "Data Characteristics",
    description: "Shape and format of the data being contributed.",
    fields: [
      { name: "type", label: "Type", type: "text" },
      { name: "data_format", label: "Data Format", type: "text" },
      { name: "data_capture_method", label: "Data Capture Method", type: "text" },
      { name: "entries_count", label: "Entries Count", type: "text" },
      { name: "size", label: "Size", type: "text" },
      { name: "data_collection_methods", label: "Data Collection Methods", type: "textarea" },
    ],
  },
  {
    title: "Timeline & Protocol",
    description: "Dates and protocol references for the study.",
    fields: [
      { name: "start_date", label: "Start Date", type: "date" },
      { name: "end_date", label: "End Date", type: "date" },
      { name: "protocol_id", label: "Protocol ID", type: "text" },
      { name: "country_protocol_id", label: "Country Protocol ID", type: "text" },
      { name: "on_hold_reason", label: "On Hold Reason", type: "textarea" },
    ],
  },
  {
    title: "Description & Citation",
    description: "Narrative context for reviewers.",
    fields: [
      { name: "description", label: "Description", type: "textarea" },
      { name: "citation_info", label: "Citation Info", type: "textarea" },
    ],
  },
];

const inputClassName =
  "mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20";

const formatDate = (value: string | null | undefined) => {
  if (!value) return "N/A";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "N/A";
  return parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

function StatusBadge({ status }: { status: string }) {
  if (status === "attained") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
        <CheckCircle2 className="h-3 w-3" /> Approved
      </span>
    );
  }
  if (status === "pending_review") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-amber-700">
        <Clock className="h-3 w-3" /> Pending
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-red-700">
      <XCircle className="h-3 w-3" /> Rejected
    </span>
  );
}

const ContributeDataset: React.FC = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({ ...initialState });
  const [selectedDataset, setSelectedDataset] = useState<any | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const {
    data: submittedData,
    isSuccess: submittedSuccess,
    isPending: submittedPending,
    mutate: submittedFn,
  } = useMutation({
    mutationFn: submitExternalDataset,
  });
  const { data: extDs, isLoading: extDsLoading, error: extDsError, isSuccess, refetch } = useGetExternalDatasets();
  const datasets: any[] = extDs?.data || [];

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const validateForm = () => {
    for (const field in formData) {
      // @ts-ignore
      if (!formData[field]) {
        toast.error(`Please fill in the ${field.replace(/_/g, " ").toUpperCase()}`);
        return false;
      }
    }
    return true;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      submittedFn(formData);
    }
  };

  useEffect(() => {
    if (submittedSuccess) {
      toast.message("Dataset submitted successfully");
      setFormData({ ...initialState });
      refetch();
    }
  }, [submittedData]);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.2),_transparent_22%),radial-gradient(circle_at_right,_rgba(36,64,142,0.12),_transparent_26%),linear-gradient(180deg,_#edf7ff_0%,_#dbeafe_46%,_#eff6ff_100%)]">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:gap-6">
          <div className="min-w-0 flex-1 space-y-4">
            <div className="rounded-[20px] border border-slate-200/70 bg-white/95 p-4 shadow-[0_12px_36px_rgba(15,23,42,0.05)] sm:p-5">
              <button
                onClick={() => router.back()}
                className="mb-3 inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-sky-300 hover:text-sky-600"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Back
              </button>
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-cyan-600 sm:text-xs">
                Community Contribution
              </p>
              <h1 className="mt-1.5 text-xl font-semibold text-slate-900 sm:text-2xl">
                {selectedDataset ? selectedDataset.name : "Contribute a Dataset"}
              </h1>
              <p className="mt-1.5 max-w-2xl text-xs leading-5 text-slate-500 sm:text-sm">
                {selectedDataset
                  ? "Submission details and current review status."
                  : "Share metadata about an external AMR dataset for our team to review."}
              </p>
            </div>

            {selectedDataset ? (
              <div className="rounded-[20px] border border-slate-200/70 bg-white/95 p-4 shadow-[0_10px_30px_rgba(15,23,42,0.05)] sm:p-5">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <button
                    onClick={() => setSelectedDataset(null)}
                    className="inline-flex items-center gap-2 rounded-full bg-[#00b9f1] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#0aa6d8]"
                  >
                    <Plus className="h-4 w-4" /> Submit new dataset
                  </button>
                  <StatusBadge status={selectedDataset.approval_status} />
                </div>

                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Submitted {formatDate(selectedDataset.created_at)}
                </p>

                {selectedDataset.approval_status === "attained" ? (
                  <p className="mt-2 text-sm font-medium text-emerald-600">
                    Approved — we will reach out for further collaboration.
                  </p>
                ) : selectedDataset.approval_status === "pending_review" ? (
                  <p className="mt-2 text-sm font-medium text-amber-600">
                    Pending review by our team.
                  </p>
                ) : (
                  <p className="mt-2 text-sm font-medium text-red-600">
                    Rejected — feel free to revise and resubmit.
                  </p>
                )}

                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {Object.entries(selectedDataset)
                    .filter(([key]) => !["id", "approval_status", "created_at"].includes(key))
                    .map(([key, value]) => (
                      <div key={key} className="rounded-2xl border border-slate-100 bg-slate-50/75 px-3.5 py-3">
                        <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">
                          {key.replace(/_/g, " ")}
                        </p>
                        <p className="mt-1 text-sm font-medium text-slate-800">
                          {value !== undefined && value !== null && value !== ""
                            ? String(value)
                            : "—"}
                        </p>
                      </div>
                    ))}
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {fieldGroups.map((group) => (
                  <div
                    key={group.title}
                    className="rounded-[20px] border border-slate-200/70 bg-white/95 p-4 shadow-[0_10px_30px_rgba(15,23,42,0.05)] sm:p-5"
                  >
                    <h3 className="text-sm font-semibold text-slate-900">{group.title}</h3>
                    <p className="mt-0.5 text-xs text-slate-500">{group.description}</p>

                    <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {group.fields.map((field) => (
                        <div key={field.name}>
                          <label className="block text-xs font-medium text-slate-600">
                            {field.label}
                          </label>
                          {field.type === "textarea" ? (
                            <textarea
                              name={field.name}
                              rows={2}
                              value={formData[field.name]}
                              onChange={handleChange}
                              className={inputClassName}
                            />
                          ) : field.type === "select" ? (
                            <select
                              name={field.name}
                              value={formData[field.name]}
                              onChange={handleChange}
                              className={inputClassName}
                            >
                              <option value="">Select {field.label}</option>
                              {field.options?.map((option) => (
                                <option key={option} value={option}>
                                  {option}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <input
                              type={field.type}
                              name={field.name}
                              placeholder={field.placeholder}
                              value={formData[field.name]}
                              onChange={handleChange}
                              className={inputClassName}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                <button
                  type="submit"
                  disabled={submittedPending}
                  className="flex min-h-[3rem] w-full items-center justify-center rounded-xl bg-[#00b9f1] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0aa6d8] disabled:opacity-70 sm:w-auto sm:min-w-[13rem]"
                >
                  {submittedPending ? <DotsLoader /> : "Submit Dataset"}
                </button>
              </form>
            )}
          </div>

          <aside
            className={`shrink-0 transition-all duration-200 ${
              sidebarCollapsed ? "w-full lg:w-14" : "w-full lg:w-80"
            }`}
          >
            <div className="rounded-[20px] border border-slate-200/70 bg-white/95 shadow-[0_10px_30px_rgba(15,23,42,0.05)] lg:sticky lg:top-6">
              <button
                onClick={() => setSidebarCollapsed((current) => !current)}
                className="flex w-full items-center justify-between rounded-[20px] p-4"
              >
                {!sidebarCollapsed && (
                  <span className="text-sm font-semibold text-slate-900">
                    Previously Submitted Datasets
                  </span>
                )}
                {sidebarCollapsed ? (
                  <ChevronLeft className="h-4 w-4 text-slate-500" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-slate-500" />
                )}
              </button>

              {!sidebarCollapsed && (
                <div className="max-h-[70vh] space-y-2 overflow-y-auto px-3 pb-4">
                  {extDsLoading && (
                    <div className="flex justify-center py-4">
                      <DotsLoader />
                    </div>
                  )}
                  {extDsError && (
                    <p className="px-1 text-xs text-slate-500">Failed to load previous datasets.Please login before you try again</p>
                  )}
                  {isSuccess && datasets.length === 0 && (
                    <p className="px-1 text-xs text-slate-500">No previous datasets.</p>
                  )}
                  {datasets.map((dataset, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedDataset(dataset)}
                      className={`w-full rounded-2xl border px-3.5 py-3 text-left transition hover:border-sky-300 hover:bg-sky-50/50 ${
                        selectedDataset?.name === dataset.name
                          ? "border-sky-300 bg-sky-50"
                          : "border-slate-100 bg-slate-50/75"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="truncate text-sm font-semibold text-slate-900">{dataset.name}</p>
                        <StatusBadge status={dataset.approval_status} />
                      </div>
                      <p className="mt-1 text-xs text-slate-500">{dataset.category}</p>
                      <p className="mt-1 text-[11px] text-slate-400">
                        Submitted {formatDate(dataset.created_at)}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default ContributeDataset;
