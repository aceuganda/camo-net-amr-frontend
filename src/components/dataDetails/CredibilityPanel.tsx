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
      <div className="sticky top-8 space-y-6 max-h-[calc(100vh-4rem)] overflow-y-auto">
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
      </div>
    </div>
  );
}