import { useState } from "react";
import dynamic from "next/dynamic";
import {
  AlertCircle,
  Check,
  ChevronDown,
  ClipboardList,
  Clock,
  Download,
  RefreshCw,
  Trash2,
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
  const base = "rounded-full border px-2 py-0.5 text-[11px] font-semibold";
  switch (status) {
    case "approved":
      return `${base} border-emerald-200 bg-emerald-100 text-emerald-800`;
    case "denied":
      return `${base} border-red-200 bg-red-100 text-red-800`;
    case "requested":
      return `${base} border-amber-200 bg-amber-100 text-amber-800`;
    default:
      return `${base} border-gray-200 bg-gray-100 text-gray-800`;
  }
};

/**
 * Only the first and last stages have a state the API reports, so the review
 * stage stays neutral ("in progress" / "concluded") rather than claiming a pass
 * we cannot verify.
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
      label: "Request submitted",
      description: "We received your application and selected variables.",
      state: "done",
    },
    {
      label: "Reference response",
      description: perm.referee_name
        ? `${perm.referee_name} was contacted to vouch for this request.`
        : "Your nominated referee is asked to vouch for this request.",
      state: reviewState,
    },
    {
      label: "PI consultation & IRB verification",
      description: perm.irb_number
        ? `The principal investigator is consulted and your ethics approval (${perm.irb_number}) is verified.`
        : "The principal investigator is consulted and ethics approval is verified — no IRB number was supplied.",
      state: reviewState,
    },
    {
      label: isDenied ? "Decision — not granted" : "Decision",
      description: isApproved
        ? "Access granted. You can now download this dataset."
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
        icon: <Check className="h-3 w-3" />,
      };
    case "active":
      return {
        ring: "border-[#00B9F1] bg-white text-[#00B9F1] ring-2 ring-[#00B9F1]/15",
        line: "bg-gray-200",
        label: "text-[#24408E]",
        icon: <Clock className="h-3 w-3" />,
      };
    case "failed":
      return {
        ring: "border-red-500 bg-red-500 text-white",
        line: "bg-gray-200",
        label: "text-red-800",
        icon: <X className="h-3 w-3" />,
      };
    case "concluded":
      return {
        ring: "border-gray-400 bg-gray-400 text-white",
        line: "bg-gray-300",
        label: "text-gray-700",
        icon: <Check className="h-3 w-3" />,
      };
    default:
      return {
        ring: "border-gray-300 bg-white text-gray-400",
        line: "bg-gray-200",
        label: "text-gray-500",
        icon: null,
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
          <li key={step.label} className="relative flex gap-2.5 pb-3 last:pb-0">
            {!isLast && (
              <span
                aria-hidden
                className={`absolute left-[11px] top-6 h-[calc(100%-1.25rem)] w-0.5 ${visuals.line}`}
              />
            )}
            <span
              className={`relative z-10 mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 text-[10px] font-bold ${visuals.ring}`}
            >
              {visuals.icon ?? index + 1}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-1.5">
                <p className={`text-[13px] font-semibold ${visuals.label}`}>
                  {index + 1}. {step.label}
                </p>
                {step.state === "active" && (
                  <span className="rounded-full bg-[#00B9F1]/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-[#00B9F1]">
                    In progress
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-[11px] leading-4 text-gray-600">
                {step.description}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function Detail({ label, value }: { label: string; value?: string | number | null }) {
  const empty = value === null || value === undefined || value === "";
  return (
    <div className="rounded-md border border-gray-200 bg-white px-2 py-1.5">
      <p className="text-[9px] font-semibold uppercase tracking-wider text-gray-500">
        {label}
      </p>
      {empty ? (
        <p className="mt-0.5 text-[11px] italic text-gray-400">Not provided</p>
      ) : (
        <p className="mt-0.5 break-words text-[12px] font-medium text-gray-800">
          {value}
        </p>
      )}
    </div>
  );
}

function Collapsible({
  title,
  defaultOpen = false,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50/60">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left"
      >
        <span className="text-[11px] font-bold uppercase tracking-wider text-gray-600">
          {title}
        </span>
        <ChevronDown
          className={`h-3.5 w-3.5 shrink-0 text-gray-500 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      {open && <div className="px-3 pb-3">{children}</div>}
    </div>
  );
}

function RequestCard({
  perm,
  ordinal,
  total,
  isMostRecent,
  defaultOpen,
  onReRequest,
  reRequestPending,
  deletePermissionFn,
  deletePending,
  validRe_request,
  formatDate,
}: {
  perm: any;
  ordinal: number;
  total: number;
  isMostRecent: boolean;
  defaultOpen: boolean;
} & Omit<PermissionsSectionProps, "userPermissions">) {
  const [open, setOpen] = useState(defaultOpen);
  const [showAllVariables, setShowAllVariables] = useState(false);

  const steps = buildSteps(perm);
  const variables: string[] = perm.requested_variables || [];
  const visibleVariables = showAllVariables ? variables : variables.slice(0, 15);
  const downloadsUsed = perm.downloads_count || 0;
  const downloadsLeft = Math.max(MAX_DOWNLOADS - downloadsUsed, 0);

  const isEligibleForReRequest =
    perm.status === "requested" &&
    !validRe_request(new Date(perm.last_update || perm.created_at));

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        className="flex w-full items-start gap-2.5 bg-gradient-to-r from-white to-blue-50/50 p-3 text-left transition-colors hover:bg-blue-50/60"
      >
        <ChevronDown
          className={`mt-0.5 h-4 w-4 shrink-0 text-gray-500 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            {total > 1 && (
              <span className="rounded bg-[#24408E] px-1.5 py-0.5 text-[10px] font-bold text-white">
                Application {ordinal} of {total}
              </span>
            )}
            {total > 1 && isMostRecent && (
              <span className="rounded border border-blue-200 bg-blue-50 px-1.5 py-0.5 text-[10px] font-semibold text-blue-700">
                Most recent
              </span>
            )}
            <span className={statusBadge(perm.status)}>
              {statusLabel(perm.status)}
            </span>
            {(perm.re_request_count || 0) > 0 && (
              <span className="inline-flex items-center gap-1 rounded border border-indigo-200 bg-indigo-50 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-700">
                <RefreshCw className="h-2.5 w-2.5" />
                {perm.re_request_count}×
              </span>
            )}
          </div>
          <h4
            className="mt-1 truncate text-sm font-bold text-[#24408E]"
            title={perm.project_title || "Untitled project"}
          >
            {perm.project_title || "Untitled project"}
          </h4>
          <p className="mt-0.5 text-[11px] text-gray-600">
            Submitted {formatDate(perm.created_at)}
            {perm.last_update && perm.last_update !== perm.created_at
              ? ` · Updated ${formatDate(perm.last_update)}`
              : ""}
          </p>
        </div>
      </button>

      {open && (
        <div className="space-y-2.5 border-t border-gray-100 p-3">
          {/* Primary content — deliberately not collapsible. The card toggle above
              already hides it, and this is the question the section exists to answer. */}
          <div className="px-0.5">
            <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-gray-600">
              Where your request is
            </p>
            <ProgressTracker steps={steps} />
            {perm.status === "requested" && (
              <p className="mt-1.5 rounded-md bg-blue-50 px-2.5 py-1.5 text-[11px] leading-4 text-blue-800">
                Individual check results are not published — you will be emailed
                once the review concludes.
              </p>
            )}
          </div>

          <Collapsible title="What you submitted">
            <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
              <Detail label="IRB / Ethics number" value={perm.irb_number} />
              <Detail label="Institution" value={perm.institution} />
              <Detail label="Your position" value={perm.title} />
              <Detail label="Category" value={perm.category} />
              <Detail label="Referee" value={perm.referee_name} />
              <Detail label="Referee email" value={perm.referee_email} />
            </div>
          </Collapsible>

          <Collapsible title="Project description">
            <p className="whitespace-pre-line text-[12px] leading-5 text-gray-700">
              {perm.project_description || (
                <span className="italic text-gray-400">No description provided.</span>
              )}
            </p>
          </Collapsible>

          <Collapsible title={`Requested variables (${variables.length})`}>
            {variables.length === 0 ? (
              <p className="text-[12px] italic text-gray-400">
                No variables recorded for this request.
              </p>
            ) : (
              <>
                <div className="flex flex-wrap gap-1">
                  {visibleVariables.map((variable) => (
                    <span
                      key={variable}
                      className="rounded border border-gray-200 bg-white px-1.5 py-0.5 font-mono text-[10px] text-gray-700"
                    >
                      {variable}
                    </span>
                  ))}
                </div>
                {variables.length > 15 && (
                  <button
                    type="button"
                    onClick={() => setShowAllVariables((prev) => !prev)}
                    className="mt-1.5 text-[11px] font-semibold text-[#00B9F1] hover:underline"
                  >
                    {showAllVariables ? "Show fewer" : `Show all ${variables.length}`}
                  </button>
                )}
              </>
            )}
          </Collapsible>

          {perm.status === "approved" && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-2.5">
              <p className="flex items-center gap-1.5 text-[12px] font-semibold text-emerald-800">
                <Check className="h-3.5 w-3.5" /> Access granted
              </p>
              <p className="mt-0.5 flex items-center gap-1.5 text-[11px] text-emerald-700">
                <Download className="h-3 w-3" />
                {downloadsUsed} of {MAX_DOWNLOADS} downloads used
                {downloadsLeft === 0
                  ? " — limit reached."
                  : ` — ${downloadsLeft} remaining.`}
              </p>
            </div>
          )}

          {perm.status === "denied" && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-2.5">
              <p className="flex items-center gap-1.5 text-[12px] font-semibold text-red-800">
                <AlertCircle className="h-3.5 w-3.5" /> Not approved
              </p>
              <p className="mt-0.5 text-[11px] leading-4 text-red-700">
                {perm.denial_reason ? (
                  <>
                    <span className="font-semibold">Reason:</span> {perm.denial_reason}
                  </>
                ) : (
                  "No reason was recorded. Contact the data access team for clarification."
                )}
              </p>
            </div>
          )}

          {!perm.irb_number && perm.status === "requested" && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-2.5">
              <p className="flex items-center gap-1.5 text-[12px] font-semibold text-amber-800">
                <AlertCircle className="h-3.5 w-3.5" /> No IRB number supplied
              </p>
              <p className="mt-0.5 text-[11px] leading-4 text-amber-700">
                Step 3 cannot complete without an ethics approval number. Withdraw
                this request and resubmit with the number to avoid delays.
              </p>
            </div>
          )}

          {isEligibleForReRequest && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-2.5">
              <p className="text-[11px] leading-4 text-amber-800">
                No response after 14 days. You can nudge the review team.
              </p>
              <button
                onClick={(e: any) => {
                  e.preventDefault();
                  onReRequest(perm.id);
                }}
                disabled={reRequestPending}
                className="mt-1.5 w-full rounded-md bg-gradient-to-r from-[#00B9F1] to-[#24408E] px-3 py-1.5 text-[12px] font-medium text-white transition-all hover:shadow-md disabled:opacity-60 sm:w-auto"
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
              className="flex w-full items-center justify-center rounded-md border border-red-200 bg-white py-1.5 text-[12px] font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-60 sm:w-auto sm:px-3"
            >
              <Trash2 className="mr-1.5 h-3.5 w-3.5" />
              {deletePending ? <DotsLoader /> : "Withdraw request"}
            </button>
          )}
        </div>
      )}
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
  const permissions = userPermissions || [];

  // Oldest first assigns the ordinal, then display newest first so the live
  // application is on top. "Application 3 of 3" is always the newest.
  const ordered = [...permissions]
    .map((perm, index) => ({ perm, fallback: index }))
    .sort((a, b) => {
      const at = new Date(a.perm.created_at || 0).getTime();
      const bt = new Date(b.perm.created_at || 0).getTime();
      return at === bt ? a.fallback - b.fallback : at - bt;
    })
    .map((entry, index) => ({ ...entry, ordinal: index + 1 }))
    .reverse();

  return (
    <div className="mb-6 rounded-xl border border-white/30 bg-white/90 p-3 shadow-lg backdrop-blur-sm sm:p-4">
      <div className="mb-3">
        <h3 className="flex flex-wrap items-center gap-2 text-base font-semibold text-[#24408E] sm:text-lg">
          <span className="rounded-md bg-gradient-to-r from-purple-500 to-indigo-600 p-1.5">
            <ClipboardList className="h-4 w-4 text-white" />
          </span>
          Your access requests
          {permissions.length > 0 && (
            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[11px] font-medium text-blue-800">
              {permissions.length}
            </span>
          )}
        </h3>
        {permissions.length > 0 && (
          <p className="mt-1.5 text-[12px] leading-5 text-gray-600">
            {permissions.length > 1
              ? `You have ${permissions.length} applications for this dataset. Each is reviewed separately — tap one to see its progress.`
              : "Reviewed by your referee, then the principal investigator and ethics (IRB) check, before a decision."}
          </p>
        )}
      </div>

      {permissions.length > 0 ? (
        <div className="space-y-2">
          {ordered.map(({ perm, ordinal }, index) => (
            <RequestCard
              key={perm.id || ordinal}
              perm={perm}
              ordinal={ordinal}
              total={permissions.length}
              isMostRecent={index === 0}
              defaultOpen={index === 0}
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
        <div className="rounded-lg border border-gray-200 bg-gradient-to-br from-gray-50 to-blue-50 px-4 py-8 text-center">
          <ClipboardList className="mx-auto mb-2.5 h-10 w-10 text-gray-400" />
          <h4 className="mb-1 text-sm font-semibold text-gray-600">
            No access requests yet
          </h4>
          <p className="text-[12px] text-gray-500">
            You have not submitted any access requests for this dataset.
          </p>
          <p className="mt-1 text-[11px] text-gray-400">
            Use “Request Access” above — you will need your institution, an
            IRB/ethics approval number, and a referee.
          </p>
        </div>
      )}
    </div>
  );
}
