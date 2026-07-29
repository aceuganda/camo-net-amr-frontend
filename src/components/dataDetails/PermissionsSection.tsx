import { useState } from "react";
import dynamic from "next/dynamic";
import {
  AlertCircle,
  Building2,
  Check,
  ChevronDown,
  ClipboardList,
  Clock,
  Download,
  FileText,
  Mail,
  RefreshCw,
  ShieldCheck,
  Trash2,
  UserRound,
  Users,
  X,
} from "lucide-react";

const DotsLoader = dynamic(() => import("../ui/dotsLoader"), { ssr: false });

/** Matches the server-side cap in amr_culture_controller / economic_data_controller. */
const MAX_DOWNLOADS = 3;

interface PermissionsSectionProps {
  userPermissions: any[];
  onReRequest: (permId: string) => void;
  reRequestPending: boolean;
  deletePermissionFn: (data: { permissionId: string }) => void;
  deletePending: boolean;
  validRe_request: (lastUpdate: Date | null) => boolean;
  formatDate: (date: any) => string;
}

type StepState = "done" | "active" | "pending" | "failed" | "concluded";

interface Step {
  key: string;
  label: string;
  description: string;
  state: StepState;
}

const statusLabel = (status: string) => {
  switch (status) {
    case "approved":
      return "Approved";
    case "denied":
      return "Denied";
    case "requested":
      return "Under review";
    default:
      return status || "Unknown";
  }
};

const statusBadge = (status: string) => {
  const base = "py-1 px-3 rounded-full text-xs font-semibold border";
  switch (status) {
    case "approved":
      return `${base} bg-emerald-100 text-emerald-800 border-emerald-200`;
    case "denied":
      return `${base} bg-red-100 text-red-800 border-red-200`;
    case "requested":
      return `${base} bg-amber-100 text-amber-800 border-amber-200`;
    default:
      return `${base} bg-gray-100 text-gray-800 border-gray-200`;
  }
};

/**
 * The review pipeline every request goes through. Only the first and last stages
 * have a state the API actually reports, so the three review stages stay neutral
 * ("in progress" / "concluded") rather than claiming a pass we cannot verify.
 */
const buildSteps = (perm: any): Step[] => {
  const isPending = perm.status === "requested";
  const isApproved = perm.status === "approved";
  const isDenied = perm.status === "denied";

  const reviewState: StepState = isPending
    ? "active"
    : isApproved
    ? "done"
    : "concluded";

  return [
    {
      key: "submitted",
      label: "Request submitted",
      description: "We received your application and the variables you selected.",
      state: "done",
    },
    {
      key: "reference",
      label: "Reference response",
      description: perm.referee_name
        ? `${perm.referee_name} was contacted to vouch for this request.`
        : "Your nominated referee is asked to vouch for this request.",
      state: reviewState,
    },
    {
      key: "pi",
      label: "PI consultation",
      description:
        "The dataset's principal investigator is consulted on the proposed use.",
      state: reviewState,
    },
    {
      key: "irb",
      label: "IRB verification",
      description: perm.irb_number
        ? `Your ethics approval (${perm.irb_number}) is verified against the study.`
        : "Ethics approval is verified — no IRB number was supplied with this request.",
      state: reviewState,
    },
    {
      key: "decision",
      label: isDenied ? "Decision — not granted" : "Decision",
      description: isApproved
        ? "Access granted. You can now download the dataset."
        : isDenied
        ? "This request was not approved."
        : "You will be emailed as soon as a decision is made.",
      state: isApproved ? "done" : isDenied ? "failed" : "pending",
    },
  ];
};

const stepVisuals = (state: StepState) => {
  switch (state) {
    case "done":
      return {
        ring: "border-emerald-500 bg-emerald-500 text-white",
        line: "bg-emerald-500",
        label: "text-emerald-800",
        icon: <Check className="h-3.5 w-3.5" />,
      };
    case "active":
      return {
        ring: "border-[#00B9F1] bg-white text-[#00B9F1] ring-4 ring-[#00B9F1]/15",
        line: "bg-gray-200",
        label: "text-[#24408E]",
        icon: <Clock className="h-3.5 w-3.5" />,
      };
    case "failed":
      return {
        ring: "border-red-500 bg-red-500 text-white",
        line: "bg-gray-200",
        label: "text-red-800",
        icon: <X className="h-3.5 w-3.5" />,
      };
    case "concluded":
      return {
        ring: "border-gray-400 bg-gray-400 text-white",
        line: "bg-gray-300",
        label: "text-gray-700",
        icon: <Check className="h-3.5 w-3.5" />,
      };
    default:
      return {
        ring: "border-gray-300 bg-white text-gray-400",
        line: "bg-gray-200",
        label: "text-gray-500",
        icon: <span className="h-1.5 w-1.5 rounded-full bg-gray-300" />,
      };
  }
};

function ProgressTracker({ steps }: { steps: Step[] }) {
  return (
    <ol className="relative">
      {steps.map((step, index) => {
        const visuals = stepVisuals(step.state);
        const isLast = index === steps.length - 1;

        return (
          <li key={step.key} className="relative flex gap-3 pb-4 last:pb-0">
            {!isLast && (
              <span
                aria-hidden
                className={`absolute left-[13px] top-7 h-[calc(100%-1.5rem)] w-0.5 ${visuals.line}`}
              />
            )}
            <span
              className={`relative z-10 mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 ${visuals.ring}`}
            >
              {visuals.icon}
            </span>
            <div className="min-w-0 flex-1 pt-0.5">
              <div className="flex flex-wrap items-center gap-2">
                <p className={`text-sm font-semibold ${visuals.label}`}>
                  {step.label}
                </p>
                {step.state === "active" && (
                  <span className="rounded-full bg-[#00B9F1]/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#00B9F1]">
                    In progress
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-xs leading-5 text-gray-600">
                {step.description}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function Detail({
  label,
  value,
  icon: Icon,
  missing = "Not provided",
}: {
  label: string;
  value?: string | number | null;
  icon?: React.ComponentType<{ className?: string }>;
  missing?: string;
}) {
  const empty = value === null || value === undefined || value === "";
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-3 py-2">
      <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-500">
        {Icon ? <Icon className="h-3 w-3" /> : null}
        {label}
      </p>
      {empty ? (
        <p className="mt-1 text-sm italic text-gray-400">{missing}</p>
      ) : (
        <p className="mt-1 break-words text-sm font-medium text-gray-800">{value}</p>
      )}
    </div>
  );
}

function RequestCard({
  perm,
  onReRequest,
  reRequestPending,
  deletePermissionFn,
  deletePending,
  validRe_request,
  formatDate,
}: {
  perm: any;
} & Omit<PermissionsSectionProps, "userPermissions">) {
  const [showDetails, setShowDetails] = useState(false);
  const [showAllVariables, setShowAllVariables] = useState(false);

  const steps = buildSteps(perm);
  const variables: string[] = perm.requested_variables || [];
  const visibleVariables = showAllVariables ? variables : variables.slice(0, 18);
  const downloadsUsed = perm.downloads_count || 0;
  const downloadsLeft = Math.max(MAX_DOWNLOADS - downloadsUsed, 0);

  const isEligibleForReRequest =
    perm.status === "requested" &&
    !validRe_request(new Date(perm.last_update || perm.created_at));

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-100 bg-gradient-to-r from-white to-blue-50/60 p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h4
              className="truncate text-base font-bold text-[#24408E]"
              title={perm.project_title || "Untitled project"}
            >
              {perm.project_title || "Untitled project"}
            </h4>
            <p className="mt-1 text-xs text-gray-600">
              Submitted {formatDate(perm.created_at)}
              {perm.last_update && perm.last_update !== perm.created_at
                ? ` · Last updated ${formatDate(perm.last_update)}`
                : ""}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {(perm.re_request_count || 0) > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full border border-indigo-200 bg-indigo-50 px-2 py-1 text-[10px] font-semibold text-indigo-700">
                <RefreshCw className="h-3 w-3" />
                Re-requested {perm.re_request_count}×
              </span>
            )}
            <span className={statusBadge(perm.status)}>
              {statusLabel(perm.status)}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 p-4 sm:p-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div>
          <p className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500">
            <ClipboardList className="h-3.5 w-3.5" />
            Where your request is
          </p>
          <ProgressTracker steps={steps} />

          {perm.status === "requested" && (
            <p className="mt-2 rounded-lg bg-blue-50 px-3 py-2 text-xs leading-5 text-blue-800">
              These three checks run before a decision is made. We do not publish
              individual check results — you will be emailed once the review
              concludes.
            </p>
          )}
        </div>

        <div>
          <p className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500">
            <FileText className="h-3.5 w-3.5" />
            What you submitted
          </p>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <Detail
              label="IRB / Ethics number"
              value={perm.irb_number}
              icon={ShieldCheck}
              missing="Not supplied"
            />
            <Detail label="Institution" value={perm.institution} icon={Building2} />
            <Detail label="Your position" value={perm.title} icon={UserRound} />
            <Detail label="Category" value={perm.category} />
            <Detail label="Referee" value={perm.referee_name} icon={Users} />
            <Detail label="Referee email" value={perm.referee_email} icon={Mail} />
          </div>

          <button
            type="button"
            onClick={() => setShowDetails((prev) => !prev)}
            className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[#00B9F1] hover:underline"
          >
            <ChevronDown
              className={`h-3.5 w-3.5 transition-transform ${
                showDetails ? "rotate-180" : ""
              }`}
            />
            {showDetails ? "Hide" : "Show"} project description and{" "}
            {variables.length} requested variable{variables.length === 1 ? "" : "s"}
          </button>

          {showDetails && (
            <div className="mt-3 space-y-3">
              <div className="rounded-lg border border-gray-200 bg-white px-3 py-2">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                  Project description
                </p>
                <p className="mt-1 whitespace-pre-line text-sm leading-6 text-gray-700">
                  {perm.project_description || (
                    <span className="italic text-gray-400">No description provided.</span>
                  )}
                </p>
              </div>

              <div className="rounded-lg border border-gray-200 bg-white px-3 py-2">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                  Requested variables ({variables.length})
                </p>
                {variables.length === 0 ? (
                  <p className="mt-1 text-sm italic text-gray-400">
                    No variables recorded for this request.
                  </p>
                ) : (
                  <>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {visibleVariables.map((variable) => (
                        <span
                          key={variable}
                          className="rounded border border-gray-200 bg-gray-50 px-1.5 py-0.5 font-mono text-[11px] text-gray-700"
                        >
                          {variable}
                        </span>
                      ))}
                    </div>
                    {variables.length > 18 && (
                      <button
                        type="button"
                        onClick={() => setShowAllVariables((prev) => !prev)}
                        className="mt-2 text-xs font-semibold text-[#00B9F1] hover:underline"
                      >
                        {showAllVariables
                          ? "Show fewer"
                          : `Show all ${variables.length}`}
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-3 border-t border-gray-100 bg-gray-50/70 p-4 sm:p-5">
        {perm.status === "approved" && (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
            <p className="flex items-center gap-2 text-sm font-semibold text-emerald-800">
              <Check className="h-4 w-4" /> Access granted
            </p>
            <p className="mt-1 flex items-center gap-1.5 text-xs text-emerald-700">
              <Download className="h-3.5 w-3.5" />
              {downloadsUsed} of {MAX_DOWNLOADS} downloads used
              {downloadsLeft === 0
                ? " — you have reached the download limit."
                : ` — ${downloadsLeft} remaining.`}
            </p>
          </div>
        )}

        {perm.status === "denied" && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3">
            <p className="flex items-center gap-2 text-sm font-semibold text-red-800">
              <AlertCircle className="h-4 w-4" /> This request was not approved
            </p>
            <p className="mt-1 text-xs leading-5 text-red-700">
              {perm.denial_reason ? (
                <>
                  <span className="font-semibold">Reason:</span> {perm.denial_reason}
                </>
              ) : (
                "No reason was recorded. Contact the data access team if you need clarification."
              )}
            </p>
          </div>
        )}

        {!perm.irb_number && perm.status === "requested" && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
            <p className="flex items-center gap-2 text-sm font-semibold text-amber-800">
              <AlertCircle className="h-4 w-4" /> No IRB number on this request
            </p>
            <p className="mt-1 text-xs leading-5 text-amber-700">
              IRB verification cannot be completed without an ethics approval
              number. Delete this request and submit a new one with the number to
              avoid delays.
            </p>
          </div>
        )}

        {isEligibleForReRequest && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
            <p className="text-xs leading-5 text-amber-800">
              No response after 14 days. You can nudge the review team by
              re-requesting access.
            </p>
            <button
              onClick={(e: any) => {
                e.preventDefault();
                onReRequest(perm.id);
              }}
              disabled={reRequestPending}
              className="mt-2 w-full rounded-lg bg-gradient-to-r from-[#00B9F1] to-[#24408E] px-4 py-2 text-sm font-medium text-white transition-all duration-200 hover:shadow-lg disabled:opacity-60 sm:w-auto"
            >
              {reRequestPending ? <DotsLoader /> : "Re-request access"}
            </button>
          </div>
        )}

        {perm.status === "requested" && (
          <button
            onClick={(e: any) => {
              e.preventDefault();
              deletePermissionFn({ permissionId: perm.id });
            }}
            disabled={deletePending}
            className="flex w-full items-center justify-center rounded-lg border border-red-200 bg-white py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-60 sm:w-auto sm:px-4"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            {deletePending ? <DotsLoader /> : "Withdraw request"}
          </button>
        )}
      </div>
    </div>
  );
}

export default function PermissionsSection({
  userPermissions,
  onReRequest,
  reRequestPending,
  deletePermissionFn,
  deletePending,
  validRe_request,
  formatDate,
}: PermissionsSectionProps) {
  return (
    <div className="mb-8 rounded-xl border border-white/30 bg-white/90 p-4 shadow-lg backdrop-blur-sm sm:p-6">
      <div className="mb-5">
        <h3 className="flex items-center gap-2 text-xl font-semibold text-[#24408E]">
          <span className="rounded-lg bg-gradient-to-r from-purple-500 to-indigo-600 p-2">
            <ClipboardList className="h-5 w-5 text-white" />
          </span>
          Your access requests
          {userPermissions?.length > 0 && (
            <span className="ml-1 rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
              {userPermissions.length}
            </span>
          )}
        </h3>
        {userPermissions?.length > 0 && (
          <p className="mt-2 text-sm leading-6 text-gray-600">
            Every request is checked by your referee, the dataset&apos;s principal
            investigator, and an ethics (IRB) review before a decision is made.
            Track where yours has reached below.
          </p>
        )}
      </div>

      {userPermissions?.length > 0 ? (
        <div className="space-y-4">
          {userPermissions.map((perm, index) => (
            <RequestCard
              key={perm.id || index}
              perm={perm}
              onReRequest={onReRequest}
              reRequestPending={reRequestPending}
              deletePermissionFn={deletePermissionFn}
              deletePending={deletePending}
              validRe_request={validRe_request}
              formatDate={formatDate}
            />
          ))}
        </div>
      ) : (
        <div className="py-12 text-center">
          <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-gray-50 to-blue-50 p-8">
            <ClipboardList className="mx-auto mb-4 h-14 w-14 text-gray-400" />
            <h4 className="mb-2 text-lg font-semibold text-gray-600">
              No access requests yet
            </h4>
            <p className="text-sm text-gray-500">
              You have not submitted any access requests for this dataset.
            </p>
            <p className="mt-2 text-xs text-gray-400">
              Use “Request Access” above to get started — you will need your
              institution, an IRB/ethics approval number, and a referee.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
