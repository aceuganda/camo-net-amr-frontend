import FilesIcon from "../../../public/svgs/file.svg";

interface DatasetAboutProps {
  dataset: any;
  formatDate: (date: any) => string;
}

export default function DatasetAbout({ dataset, formatDate }: DatasetAboutProps) {
  const leftColumnData = [
    { label: "Category", value: dataset.category },
    { label: "Thematic area", value: dataset.thematic_area },
    { label: "AMR Category", value: dataset.amr_category },
    { label: "Status", value: dataset.project_status },
    { label: "Size", value: dataset.size },
    { label: "Entries", value: dataset.entries_count || "UNK" },
    { label: "Study Design", value: dataset.study_design },
  ];

  const rightColumnData = [
    { label: "Countries", value: dataset.countries },
    { 
      label: "Timeline", 
      value: `${formatDate(dataset.start_date)} - ${formatDate(dataset.end_date)}` 
    },
    { label: "Export Data Format", value: dataset.data_format },
    { label: "Source", value: dataset.source },
    { label: "Data capture method", value: dataset.data_capture_method },
    { label: "Main Project Name (if any)", value: dataset.main_project_name || "N/A" },
  ];

  return (
    <div className="bg-white/90  backdrop-blur-sm border border-white/30 rounded-xl shadow-lg mb-8">
      <div className="p-6">
        <h2 className="text-xl font-semibold text-[#24408E] mb-6 flex items-center gap-2">
          <span className="p-2 bg-gradient-to-r from-[#00B9F1] to-[#24408E] rounded-lg">
            <FilesIcon className="w-5 h-5 text-white" />
          </span>
          About Dataset
        </h2>

        <div className="prose max-w-none mb-6">
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-lg border border-blue-100">
            <p className="text-gray-700 mb-3 text-sm sm:text-base leading-relaxed">
              {dataset.description}
            </p>
            <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
              {dataset.title}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {/* Left Column */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[#24408E] mb-4 pb-2 border-b border-gray-200">
              Dataset Information
            </h3>
            {leftColumnData.map((item, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 hover:bg-blue-50 rounded-lg transition-colors">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-500 mb-1">
                    {item.label}
                  </p>
                  <p className="text-gray-900 text-sm sm:text-base break-words">
                    {item.value}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[#24408E] mb-4 pb-2 border-b border-gray-200">
              Project Details
            </h3>
            {rightColumnData.map((item, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 hover:bg-cyan-50 rounded-lg transition-colors">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-500 mb-1">
                    {item.label}
                  </p>
                  <p className="text-gray-900 text-sm sm:text-base break-words">
                    {item.value}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}