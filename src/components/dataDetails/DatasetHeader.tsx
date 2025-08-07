import { DownloadIcon, CubeIcon, StackIcon } from "@radix-ui/react-icons";
import dynamic from "next/dynamic";
import KeyIcon from "../../../public/svgs/key.svg";


const DotsLoader = dynamic(() => import("../ui/dotsLoader"), { ssr: false });

interface DatasetHeaderProps {
  dataset: any;
  userPermissions: any[];
  canDownload: boolean;
  canRequestAccess: boolean;
  showDownloadButton: boolean;
  hasOnlyDeniedRequests: boolean;
  approvedDownloadsCount: number;
  permissionStatus: string;
  downloadPending: boolean;
  requestPending: boolean;
  onReapplyRequest: (e: any) => void;
  onDownloadRequest: () => void;
  onAccessRequest: (e: any) => void;
  onModelsClick: () => void;
}

const getStatusBadge = (status: string) => {
  const baseClasses = "py-2 px-4 rounded-full text-sm font-medium";
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

export default function DatasetHeader({
  dataset,
  userPermissions,
  canDownload,
  canRequestAccess,
  showDownloadButton,
  hasOnlyDeniedRequests,
  approvedDownloadsCount,
  permissionStatus,
  downloadPending,
  requestPending,
  onReapplyRequest,
  onDownloadRequest,
  onAccessRequest,
  onModelsClick,
}: DatasetHeaderProps) {
  return (
    <div className="bg-white/90 backdrop-blur-sm border border-white/30 rounded-xl shadow-xl p-6 mb-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div className="flex items-center gap-3 mb-4 sm:mb-0">
          <StackIcon className="w-8 h-8 text-[#24408E]" />
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#24408E] bg-gradient-to-r from-[#24408E] to-[#00B9F1] bg-clip-text text-transparent">
              {dataset.data_set.name}
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Dataset Details & Access Management
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          {userPermissions?.length > 0 && hasOnlyDeniedRequests && (
            <button
              onClick={onReapplyRequest}
              className="px-4 sm:px-6 py-2 rounded-lg bg-gradient-to-r from-[#00B9F1] to-[#24408E] text-white hover:shadow-lg transition-all duration-200 flex items-center justify-center text-sm font-medium"
            >
              Reapply
            </button>
          )}

          <button
            onClick={onModelsClick}
            className="px-4 sm:px-6 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-600 text-white hover:shadow-lg transition-all duration-200 flex items-center gap-2 text-sm font-medium"
          >
            <CubeIcon className="w-4 h-4" />
            View Models
          </button>

          {!showDownloadButton && (
            <div className="flex items-center px-4 py-2 bg-red-50 border border-red-200 rounded-lg">
              <span className="text-red-700 text-sm font-medium">
                Dataset not available for download yet
              </span>
            </div>
          )}

          {showDownloadButton &&
            userPermissions &&
            approvedDownloadsCount < 3 && (
              <button
                onClick={onDownloadRequest}
                disabled={!canDownload}
                className={`px-4 sm:px-6 py-2 rounded-lg transition-all duration-200 flex items-center justify-center min-w-[120px] text-sm font-medium ${
                  canDownload
                    ? "bg-gradient-to-r from-[#00B9F1] to-[#24408E] text-white hover:shadow-lg"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                {downloadPending ? (
                  <DotsLoader />
                ) : (
                  <>
                    <DownloadIcon className="w-4 h-4 mr-2" />
                    Download
                  </>
                )}
              </button>
            )}

          {userPermissions && approvedDownloadsCount >= 3 && (
            <div className="flex items-center px-4 py-2 bg-red-50 border border-red-200 rounded-lg max-w-[280px]">
              <div className="text-xs text-red-600 text-center">
                <div className="font-semibold">Maximum downloads reached</div>
                <div>Please contact amrdb@idi.co.ug for assistance</div>
              </div>
            </div>
          )}

          {canRequestAccess && dataset.data_set.in_warehouse && (
            <button
              onClick={onAccessRequest}
              className="px-4 sm:px-6 py-2 rounded-lg bg-gradient-to-r from-[#00B9F1] to-[#24408E] text-white hover:shadow-lg transition-all duration-200 flex items-center justify-center min-w-[140px] text-sm font-medium"
            >
              {requestPending ? (
                <DotsLoader />
              ) : (
                <>
                  <KeyIcon className="w-4 h-4 mr-2" />
                  Request Access
                </>
              )}
            </button>
          )}

          {!canRequestAccess && (
            <div className="flex items-center">
              <span className={getStatusBadge(permissionStatus)}>
                {permissionStatus === "requested"
                  ? "Access Requested"
                  : permissionStatus === "denied"
                  ? "Access Denied"
                  : "Approved"}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}