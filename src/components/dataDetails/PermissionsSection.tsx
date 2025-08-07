import { TrashIcon } from "@radix-ui/react-icons";
import dynamic from "next/dynamic";

const DotsLoader = dynamic(() => import("../ui/dotsLoader"), { ssr: false });

interface PermissionsSectionProps {
  userPermissions: any[];
  onReRequest: (permId: string) => void;
  reRequestPending: boolean;
  deletePermissionFn: (data: { permissionId: string }) => void;
  deletePending: boolean;
  validRe_request: (lastUpdate: Date | null) => boolean;
  formatDate: (date: any) => string;
}

const getStatusBadge = (status: string) => {
  const baseClasses = "py-1 px-3 rounded-full text-xs font-medium";
  switch (status) {
    case "approved":
      return `${baseClasses} bg-emerald-100 text-emerald-800 border border-emerald-200`;
    case "denied":
      return `${baseClasses} bg-red-100 text-red-800 border border-red-200`;
    case "requested":
      return `${baseClasses} bg-amber-100 text-amber-800 border border-amber-200`;
    default:
      return `${baseClasses} bg-gray-100 text-gray-800 border border-gray-200`;
  }
};

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
    <div className="bg-white/90 backdrop-blur-sm border border-white/30 rounded-xl shadow-lg p-6 mb-8">
      <h3 className="text-xl font-semibold text-[#24408E] mb-6 flex items-center gap-2">
        <span className="p-2 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
          </svg>
        </span>
        Permission Requests
        {userPermissions?.length > 0 && (
          <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
            {userPermissions.length}
          </span>
        )}
      </h3>
      
      {userPermissions?.length > 0 ? (
        <div className="overflow-x-auto">
          <div className="flex gap-4 pb-4 min-w-max">
            {userPermissions.map((perm, index) => {
              const isEligibleForReRequest =
                perm.status === "requested" &&
                !validRe_request(new Date(perm.last_update || perm.created_at));

              return (
                <div
                  key={index}
                  className="min-w-[320px] max-w-[360px] border border-gray-200 rounded-xl p-5 bg-gradient-to-br from-white to-blue-50 shadow-sm hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-[#24408E] truncate" title={perm.project_title || "Untitled Project"}>
                        {perm.project_title || "Untitled Project"}
                      </h4>
                      <p className="text-xs text-gray-600 mt-1">
                        Updated: {formatDate(perm.last_update || perm.created_at)}
                      </p>
                    </div>
                    <span className={getStatusBadge(perm.status)}>
                      {perm.status}
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="text-xs text-gray-600">
                      <span className="font-medium">Institution:</span> {perm.institution || "N/A"}
                    </div>
                    <div className="text-xs text-gray-600">
                      <span className="font-medium">Category:</span> {perm.category || "N/A"}
                    </div>
                    {perm.requested_variables && perm.requested_variables.length > 0 && (
                      <div className="text-xs text-gray-600">
                        <span className="font-medium">Variables:</span> {perm.requested_variables.length} selected
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    {isEligibleForReRequest && (
                      <>
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
                      </>
                    )}

                    {perm.status === "requested" && (
                      <button
                        onClick={(e: any) => {
                          e.preventDefault();
                          deletePermissionFn({ permissionId: perm.id });
                        }}
                        className="w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center text-sm font-medium"
                        disabled={deletePending}
                      >
                        <TrashIcon className="mr-2 h-4 w-4" />
                        {deletePending ? <DotsLoader /> : "Delete Request"}
                      </button>
                    )}

                    {perm.status === "approved" && (
                      <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                        <p className="text-xs text-emerald-700 font-medium">
                          ✓ Access granted - you can download this dataset
                        </p>
                      </div>
                    )}

                    {perm.status === "denied" && perm.denial_reason && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-xs text-red-700">
                          <span className="font-medium">Reason:</span> {perm.denial_reason}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="bg-gradient-to-br from-gray-50 to-blue-50 border border-gray-200 rounded-xl p-8">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h4 className="text-lg font-semibold text-gray-600 mb-2">No Permission Requests</h4>
            <p className="text-sm text-gray-500">
              You haven not submitted any access requests for this dataset yet.
            </p>
            <p className="text-xs text-gray-400 mt-2">
              Click Request Access above to get started
            </p>
          </div>
        </div>
      )}
    </div>
  );
}