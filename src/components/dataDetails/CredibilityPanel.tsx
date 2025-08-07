import { TrashIcon, LockClosedIcon } from "@radix-ui/react-icons";
import dynamic from "next/dynamic";
import CheckMarkIcon from "../../../public/svgs/checkmark.svg";
import FilesIcon from "../../../public/svgs/file.svg";

const DotsLoader = dynamic(() => import("../ui/dotsLoader"), { ssr: false });

interface CredibilityPanelProps {
  dataset: any;
  userPermissions: any[];
  approvedDownloadsCount: number;
}


export default function CredibilityPanel({
  dataset,
  userPermissions,
  approvedDownloadsCount,
}: CredibilityPanelProps) {
  const credibilityData = [
    { label: "Protocol ID", value: dataset.protocol_id },
    { label: "Citations", value: dataset.citation_info },
    { label: "Country Protocol ID", value: dataset.country_protocol_id },
    { label: "Number Downloads", value: approvedDownloadsCount },
    {
      label: "Number Re-requests Sent",
      value: userPermissions?.reduce((acc, perm) => acc + perm.re_request_count, 0),
    },
  ];

  return (
    <div className="w-full lg:w-80">
      {/* Single sticky container for both sections */}
      <div className="sticky top-8 space-y-6 max-h-[calc(100vh-4rem)] overflow-y-auto">
        {/* Credibility Section */}
        <div className="bg-white/90 backdrop-blur-sm border border-white/30 rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-[#24408E] mb-6 flex items-center gap-2">
            <span className="p-2 bg-gradient-to-r from-[#00B9F1] to-[#24408E] rounded-lg">
              <LockClosedIcon className="w-5 h-5 text-white" />
            </span>
            Credibility
          </h2>
          
          <div className="space-y-4">
            {credibilityData.map((item, index) => (
              <div key={index} className="p-3 hover:bg-blue-50 rounded-lg transition-colors">
                <p className="text-sm font-medium text-gray-500 mb-1">
                  {item.label}
                </p>
                <p
                  className={`text-sm sm:text-base break-words ${
                    item.label === "Number Downloads" &&
                    userPermissions
                      ?.filter((perm) => perm.status === "approved")
                      .some((perm) => perm.downloads_count > 2)
                      ? "text-red-600 font-semibold"
                      : "text-gray-900"
                  }`}
                >
                  {item.value || "N/A"}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Permission Requests Section - Now inside the same sticky container */}
        {/* <div className="bg-white/90 backdrop-blur-sm border border-white/30 rounded-xl shadow-lg p-6">
          <h3 className="text-sm font-semibold text-[#24408E] mb-4 flex items-center gap-2">
            <span className="p-2 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg">
              <CheckMarkIcon className="w-5 h-5 text-white" />
            </span>
            Permission Requests
          </h3>
          
          {userPermissions?.length > 0 ? (
            <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
              {userPermissions.map((perm, index) => {
                const isEligibleForReRequest =
                  perm.status === "requested" &&
                  !validRe_request(new Date(perm.last_update || perm.created_at));

                return (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-4 bg-gradient-to-r from-gray-50 to-blue-50 shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[#24408E] truncate" title={perm.project_title || "Untitled Project"}>
                          {perm.project_title || "Untitled Project"}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          Updated: {formatDate(perm.last_update || perm.created_at)}
                        </p>
                      </div>
                      <span className={getStatusBadge(perm.status)}>
                        {perm.status}
                      </span>
                    </div>

                    {isEligibleForReRequest && (
                      <div className="mt-4 space-y-3">
                        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                          <p className="text-xs text-amber-700">
                            This request is eligible for re-request. Please re-request access if no response has been received after 14 days.
                          </p>
                        </div>
                        
                        <button
                          onClick={(e: any) => {
                            e.preventDefault();
                            onReRequest(perm.id);
                          }}
                          className="w-full px-4 py-2 bg-gradient-to-r from-[#00B9F1] to-[#24408E] text-white rounded-lg hover:shadow-lg transition-all duration-200 text-sm font-medium"
                        >
                          {reRequestPending ? <DotsLoader /> : "Re-request Access"}
                        </button>
                      </div>
                    )}

                    {perm.status === "requested" && (
                      <button
                        onClick={(e: any) => {
                          e.preventDefault();
                          deletePermissionFn({ permissionId: perm.id });
                        }}
                        className="w-full mt-3 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center text-sm font-medium"
                        disabled={deletePending}
                      >
                        <TrashIcon className="mr-2 h-4 w-4" />
                        {deletePending ? <DotsLoader /> : "Delete Request"}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <FilesIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-sm text-gray-500 font-medium">No permission requests found</p>
                <p className="text-xs text-gray-400 mt-1">Request access to get started</p>
              </div>
            </div>
          )}
        </div> */}
      </div>
    </div>
  );
}