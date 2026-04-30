"use client";

import { useState } from "react";
import FilesIcon from "../../../public/svgs/file.svg";
import { FileText, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import { DatasheetContent } from "@/types/datasheet";

interface DatasheetData {
  id: string;
  dataset_id: string;
  template_version: string;
  content: DatasheetContent;
  created_at: string;
  updated_at: string;
  markdown?: string;
}

interface DatasetInfoTabsProps {
  dataset: any;
  formatDate: (date: any) => string;
  datasheet?: DatasheetData | null;
  onDownloadDatasheet?: () => void;
}

const hasAnsweredQuestions = (datasheet: DatasheetData | null | undefined): boolean => {
  if (!datasheet?.content) return false;
  const content = datasheet.content as any;
  if (content.sections && Array.isArray(content.sections)) {
    return content.sections.some((section: any) =>
      section.questions?.some((q: any) => {
        const a = (q.answer || "").trim();
        return a && a !== "No answer provided";
      })
    );
  }
  if (content.answers) {
    return Object.values(content.answers).some(
      (a: any) => a && (a as string).trim() && (a as string).trim() !== "No answer provided"
    );
  }
  return false;
};

const SECTION_ORDER = [
  "Motivation",
  "Composition",
  "Collection",
  "Preprocessing/Cleaning/Labeling",
  "Uses",
  "Distribution",
  "Maintenance",
];

export default function DatasetInfoTabs({
  dataset,
  formatDate,
  datasheet,
  onDownloadDatasheet,
}: DatasetInfoTabsProps) {
  const [activeTab, setActiveTab] = useState<"about" | "datasheet">("about");
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(["Motivation"])
  );

  const handleDatasheetTabClick = () => {
    if (!hasAnsweredQuestions(datasheet)) {
      toast.info("No datasheet provided yet");
      return;
    }
    setActiveTab("datasheet");
  };

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  };

  const expandAll = () => {
    if (datasheet?.content?.sections) {
      const sectionTitles = datasheet.content.sections.map((s: any) => s.title);
      setExpandedSections(new Set(sectionTitles));
    } else if (datasheet?.content?.questions) {
      setExpandedSections(new Set(Object.keys(datasheet.content.questions)));
    }
  };

  const collapseAll = () => {
    setExpandedSections(new Set());
  };

  const parseSections = () => {
    if (!datasheet?.content) return [];

    const sections: Array<{
      title: string;
      questions: Array<{ question: string; answer: string }>;
    }> = [];

    // Handle sections format from backend
    if (datasheet.content.sections && Array.isArray(datasheet.content.sections)) {
      datasheet.content.sections.forEach((section: any) => {
        const sectionQuestions = section.questions?.map((q: any) => ({
          question: q.prompt || q.question,
          answer: q.answer || "No answer provided",
        })) || [];

        sections.push({
          title: section.title,
          questions: sectionQuestions,
        });
      });
    }
    // Fallback: Handle old format with questions/answers objects
    else if (datasheet.content.questions) {
      Object.entries(datasheet.content.questions).forEach(([sectionTitle, questionsList]) => {
        const sectionQuestions = (questionsList as string[]).map((question, index) => {
          const answerKey = `${sectionTitle}_${index}`;
          return {
            question,
            answer: datasheet.content.answers?.[answerKey] || "No answer provided",
          };
        });

        sections.push({
          title: sectionTitle,
          questions: sectionQuestions,
        });
      });

      return sections.sort((a, b) => {
        const aIndex = SECTION_ORDER.indexOf(a.title);
        const bIndex = SECTION_ORDER.indexOf(b.title);
        return aIndex - bIndex;
      });
    }

    return sections;
  };

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
      value: `${formatDate(dataset.start_date)} - ${formatDate(dataset.end_date)}`,
    },
    { label: "Export Data Format", value: dataset.data_format },
    { label: "Source", value: dataset.source },
    { label: "Data capture method", value: dataset.data_capture_method },
    { label: "Main Project Name (if any)", value: dataset.main_project_name || "N/A" },
  ];

  const sections = parseSections();

  return (
    <div className="bg-white/90 backdrop-blur-sm border border-white/30 rounded-xl shadow-lg mb-8">
      <div className="border-b border-gray-200">
        <div className="flex">
          <button
            onClick={() => setActiveTab("about")}
            className={`flex-1 px-3 sm:px-6 py-3 sm:py-4 text-left font-semibold transition-all duration-200 ${
              activeTab === "about"
                ? "text-[#24408E] border-b-2 border-[#00B9F1] bg-gradient-to-r from-blue-50/50 to-transparent"
                : "text-gray-600 hover:text-[#24408E] hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center gap-2">
              <FilesIcon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
              <span className="text-sm sm:text-base">About Dataset</span>
            </div>
          </button>
          <button
            onClick={handleDatasheetTabClick}
            className={`flex-1 px-3 sm:px-6 py-3 sm:py-4 text-left font-semibold transition-all duration-200 ${
              activeTab === "datasheet"
                ? "text-[#24408E] border-b-2 border-[#00B9F1] bg-gradient-to-r from-blue-50/50 to-transparent"
                : "text-gray-600 hover:text-[#24408E] hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
              <span className="text-sm sm:text-base">Datasheet</span>
            </div>
          </button>
        </div>
      </div>

      <div className="p-6">
        {activeTab === "about" && (
          <div>
            <div className="prose max-w-none mb-6">
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-lg border border-blue-100">
                <p className="text-gray-700 mb-3 text-sm sm:text-base leading-relaxed">
                  {dataset.description}
                </p>
                <p className="text-gray-800 mb-2 text-sm sm:text-base leading-relaxed font-semibold">
                  {dataset.name}
                </p>
                <p className="text-gray-600 text-sm leading-relaxed">{dataset.title}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-[#24408E] mb-4 pb-2 border-b border-gray-200">
                  Dataset Information
                </h3>
                {leftColumnData.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-start space-x-3 p-3 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-500 mb-1">{item.label}</p>
                      <p className="text-gray-900 text-sm sm:text-base break-words">
                        {item.value}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-[#24408E] mb-4 pb-2 border-b border-gray-200">
                  Project Details
                </h3>
                {rightColumnData.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-start space-x-3 p-3 hover:bg-cyan-50 rounded-lg transition-colors"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-500 mb-1">{item.label}</p>
                      <p className="text-gray-900 text-sm sm:text-base break-words">
                        {item.value}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "datasheet" && datasheet && (
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 pb-4 border-b border-gray-200 gap-3">
              <h3 className="text-base sm:text-lg font-semibold text-[#24408E]">Dataset Datasheet</h3>
              <div className="flex items-center space-x-3 flex-shrink-0">
                <button
                  onClick={expandAll}
                  className="text-sm text-[#00B9F1] hover:text-[#0090bd] font-medium transition-colors"
                >
                  Expand All
                </button>
                <span className="text-gray-300">|</span>
                <button
                  onClick={collapseAll}
                  className="text-sm text-[#00B9F1] hover:text-[#0090bd] font-medium transition-colors"
                >
                  Collapse All
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {sections.map((section, sectionIndex) => {
                const isExpanded = expandedSections.has(section.title);

                return (
                  <div
                    key={sectionIndex}
                    className="border border-gray-200 rounded-lg overflow-hidden transition-all duration-200 hover:border-[#00B9F1]/50"
                  >
                    <button
                      onClick={() => toggleSection(section.title)}
                      className="w-full flex items-center justify-between p-3 sm:p-4 bg-gradient-to-r from-gray-50 to-blue-50 hover:from-blue-50 hover:to-blue-100 transition-all duration-200"
                    >
                      <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
                        <div className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#24408E]/10 text-[#24408E] font-semibold text-xs sm:text-sm flex-shrink-0">
                          {sectionIndex + 1}
                        </div>
                        <h4 className="text-sm sm:text-base font-semibold text-[#24408E] text-left truncate">
                          {section.title}
                        </h4>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5 text-[#24408E] flex-shrink-0" />
                      ) : (
                        <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-[#24408E] flex-shrink-0" />
                      )}
                    </button>

                    {isExpanded && (
                      <div className="p-3 sm:p-5 bg-white space-y-4 sm:space-y-5">
                        {section.questions.map((qa, qaIndex) => (
                          <div
                            key={qaIndex}
                            className="border-l-4 border-[#00B9F1]/30 pl-3 sm:pl-4 hover:border-[#00B9F1] transition-colors"
                          >
                            <p className="font-medium text-gray-800 mb-2 text-xs sm:text-sm">
                              {qa.question}
                            </p>
                            <p className="text-gray-600 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">
                              {qa.answer}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
