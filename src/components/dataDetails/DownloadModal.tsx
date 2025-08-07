import { Cross2Icon, DownloadIcon } from "@radix-ui/react-icons";
import ConfidentialityAgreement from "../confidentialityAgreement";
import DataSharingAgreement from "../dataSharingPolicy";
import dynamic from "next/dynamic";
import FoldersIcon from "../../../public/svgs/folders.svg";
import WarningIcon from "../../../public/svgs/warning.svg";
import FileIcon from "../../../public/svgs/file.svg";

const DotsLoader = dynamic(() => import("../ui/dotsLoader"), { ssr: false });

interface DownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  userPermissions: any[];
  downloadPending: boolean;
  deletePending: boolean;
  onDownload: () => void;
  onDeletePermission: (data: { permissionId: string }) => void;
  onAgreedToConfidentiality: (agreed: boolean) => void;
  onAgreedToDataSharing: (agreed: boolean) => void;
}

export default function DownloadModal({
  isOpen,
  onClose,
  userPermissions: perms,
  downloadPending: dlPending,
  deletePending: delPending,
  onDownload,
  onDeletePermission: onDeletePerm,
  onAgreedToConfidentiality: onConfidentialityAgreed,
  onAgreedToDataSharing: onDataSharingAgreed,
}: DownloadModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm" onClick={onClose} />
      
      <div className="absolute inset-y-0 right-0 w-full sm:w-[60%] md:w-[50%] lg:w-[40%] bg-white shadow-2xl transform transition-transform duration-300 ease-in-out overflow-y-auto">
        <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-gray-200 p-6 z-10">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-[#24408E] bg-gradient-to-r from-[#24408E] to-[#00B9F1] bg-clip-text text-transparent flex items-center gap-2">
              <DownloadIcon className="w-6 h-6 text-[#24408E]" />
              Download Data
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Cross2Icon className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
      
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-xl p-6">
            <h3 className="font-semibold text-[#24408E] mb-4 flex items-center gap-2">
              <span className="p-2 bg-gradient-to-r from-[#00B9F1] to-[#24408E] rounded-lg">
                <FoldersIcon className="w-5 h-5 text-white" />
              </span>
              Requested Variables
            </h3>
            
            {perms && (
              <div className="space-y-4">
                {perms.flatMap((perm, idx) => {
                  const vars = perm.requested_variables;
                  const isApproved = perm.status === "approved";
                  const hasVars = vars && vars.length > 0;
                  
                  if (isApproved && hasVars) {
                    return (
                      <div key={`approved-${idx}`}>
                        <div className="mb-3">
                          <p className="text-sm font-medium text-[#24408E]">
                            Project: {perm.project_title || "Untitled Project"}
                          </p>
                          <p className="text-xs text-gray-600">
                            Variables: {vars.length} selected
                          </p>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {vars.map((variable: string, vIdx: number) => (
                            <div
                              key={`${idx}-${vIdx}`}
                              className="bg-white border border-blue-200 text-[#24408E] p-2 rounded-lg shadow-sm text-xs font-medium truncate"
                              title={variable}
                            >
                              {variable}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  } else if (isApproved && !hasVars) {
                    return (
                      <div key={`no-vars-${idx}`} className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <WarningIcon className="w-5 h-5 text-amber-600 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-amber-700 font-medium mb-2">
                              Legacy Request - No Variables Selected
                            </p>
                            <p className="text-xs text-amber-600 mb-3">
                              This request was made before our updated data sharing policy. Please revoke this request and create a new one with variable selection.
                            </p>
                            <button
                              onClick={(e: any) => {
                                e.preventDefault();
                                onDeletePerm({ permissionId: perm.id });
                              }}
                              className="w-full bg-gradient-to-r from-[#00B9F1] to-[#24408E] text-white py-2 rounded-lg hover:shadow-lg transition-all duration-200 text-sm font-medium"
                              disabled={delPending}
                            >
                              {delPending ? <DotsLoader /> : "Revoke & Create New Request"}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return [];
                })}
                
                {perms.filter(p => p.status === "approved").length === 0 && (
                  <div className="text-center py-6">
                    <FileIcon className="w-12 h-12 text-gray-400 mb-4 mx-auto" />
                    <p className="text-gray-500 text-sm">No approved requests found</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {dlPending && (
            <div className="bg-[#24408E] text-white p-4 rounded-lg flex items-center justify-center gap-3">
              <DotsLoader />
              <span className="font-medium">Processing data download...</span>
            </div>
          )}

          <div className="space-y-4">
            <ConfidentialityAgreement
              handleAgreedCallBack={(agreed: boolean) => {
                if (agreed) onConfidentialityAgreed(true);
              }}
            />

            <DataSharingAgreement
              handleAgreedCallBack={(agreed: boolean) => {
                if (agreed) onDataSharingAgreed(true);
              }}
            />
          </div>

          {perms && perms.some((p) => p.status === "approved") && (
            <div className="sticky bottom-0 bg-white/95 backdrop-blur-sm border-t border-gray-200 pt-6">
              <button
                onClick={onDownload}
                disabled={dlPending}
                className="w-full bg-gradient-to-r from-[#00B9F1] to-[#24408E] text-white py-4 rounded-lg hover:shadow-lg transition-all duration-200 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {dlPending ? (
                  <DotsLoader />
                ) : (
                  <>
                    <DownloadIcon className="w-5 h-5" />
                    Download Dataset
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}