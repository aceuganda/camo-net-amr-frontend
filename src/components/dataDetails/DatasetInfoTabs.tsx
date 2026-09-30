"use client";

import { useState } from "react";
import FilesIcon from "../../../public/svgs/file.svg";
import { FileText, ChevronDown, ChevronUp, ChartNoAxesColumn, BookDown } from "lucide-react";
import { toast } from "sonner";
import dynamic from "next/dynamic";
import { DatasheetContent } from "@/types/datasheet";

// Loaded only when the tab is opened.
const DataProfile = dynamic(() => import("./profile/DataProfile"), { ssr: false });

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
  /** Export source key (data_set.db_name); the Data profile tab shows only when set. */
  profileSource?: string;
  /** Downloads the variable dictionary; the button shows only when set. */
  onDownloadDictionary?: () => void;
  dictionaryVariableCount?: number;
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
  profileSource,
  onDownloadDictionary,
  dictionaryVariableCount,
}: DatasetInfoTabsProps) {
  const [activeTab, setActiveTab] = useState<"about" | "datasheet" | "profile">("about");
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

  const datasheetMissing = !hasAnsweredQuestions(datasheet);
  const tabs = [
    {
      id: "about" as const,
      label: "About Dataset",
      hint: "Overview and project details",
      icon: FilesIcon,
      disabled: false,
      onSelect: () => setActiveTab("about"),
    },
    ...(profileSource
      ? [
          {
            id: "profile" as const,
            label: "Data profile",
            hint: "Statistics for every variable",
            icon: ChartNoAxesColumn,
            disabled: false,
            onSelect: () => setActiveTab("profile"),
          },
        ]
      : []),
    {
      id: "datasheet" as const,
      label: "Datasheet",
      hint: datasheetMissing ? "Not provided yet" : "How the data was collected and used",
      icon: FileText,
      disabled: datasheetMissing,
      onSelect: handleDatasheetTabClick,
    },
  ];

  return (
    <div className="bg-white/90 backdrop-blur-sm border border-white/30 rounded-xl shadow-lg mb-8">
      <div className="flex flex-col gap-2 border-b border-gray-200 p-2 sm:flex-row sm:items-stretch sm:p-3">
        <div
          role="tablist"
          aria-label="Dataset information"
          className="flex min-w-0 flex-1 gap-1 overflow-x-auto rounded-xl bg-slate-100/80 p-1"
        >
          {tabs.map((tab) => {
            const active = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                id={`dataset-tab-${tab.id}`}
                type="button"
                role="tab"
                aria-selected={active}
                aria-controls="dataset-tab-panel"
                aria-disabled={tab.disabled || undefined}
                onClick={tab.onSelect}
                className={`group flex min-w-[9.5rem] flex-1 items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00B9F1] sm:px-4 sm:py-3 ${
                  active
                    ? "bg-white shadow-md ring-1 ring-[#24408E]/10"
                    : tab.disabled
                      ? "cursor-not-allowed text-slate-400"
                      : "text-slate-600 hover:bg-white/60 hover:text-[#24408E]"
                }`}
              >
                <span
                  className={`shrink-0 rounded-lg p-2 transition-colors ${
                    active
                      ? "bg-gradient-to-br from-[#00B9F1] to-[#24408E] text-white shadow-sm"
                      : tab.disabled
                        ? "bg-slate-200/70 text-slate-400"
                        : "bg-white text-[#24408E] group-hover:text-[#00B9F1]"
                  }`}
                >
                  <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                </span>
                <span className="min-w-0">
                  <span
                    className={`block truncate text-sm font-semibold sm:text-base ${
                      active ? "text-[#24408E]" : ""
                    }`}
                  >
                    {tab.label}
                  </span>
                  <span
                    className={`hidden truncate text-xs sm:block ${
                      active ? "text-slate-500" : "text-slate-400"
                    }`}
                  >
                    {tab.hint}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
        {onDownloadDictionary && (
          <button
            type="button"
            onClick={onDownloadDictionary}
            title="Download the variable dictionary (CSV)"
            className="flex shrink-0 items-center justify-center gap-2.5 rounded-xl border border-[#24408E]/15 bg-white px-4 py-2.5 text-left text-[#24408E] shadow-sm transition-all duration-200 hover:border-[#00B9F1] hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00B9F1] sm:justify-start"
          >
            <span className="rounded-lg bg-gradient-to-br from-[#00B9F1] to-[#24408E] p-2 text-white">
              <BookDown className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-semibold sm:text-base">
                <span className="sm:hidden">Download dictionary</span>
                <span className="hidden sm:inline">Dictionary</span>
              </span>
              <span className="hidden text-xs text-slate-500 sm:block">
                {dictionaryVariableCount != null
                  ? `${dictionaryVariableCount} variables · CSV`
                  : "Download CSV"}
              </span>
            </span>
          </button>
        )}
      </div>

      <div
        id="dataset-tab-panel"
        role="tabpanel"
        aria-labelledby={`dataset-tab-${activeTab}`}
        className="p-6"
      >
        {activeTab === "about" && (
          <div>
            <div className="prose max-w-none mb-5">
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

            <div className="grid grid-cols-1 gap-x-8 gap-y-5 lg:grid-cols-2">
              <InfoList title="Dataset Information" items={leftColumnData} />
              <InfoList title="Project Details" items={rightColumnData} />
            </div>
          </div>
        )}

        {activeTab === "profile" && profileSource && <DataProfile source={profileSource} />}

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

/** A compact label / value list: label on the left, value on the right, hairlines between. */
function InfoList({ title, items }: { title: string; items: { label: string; value: any }[] }) {
  return (
    <section>
      <h3 className="mb-1 border-b border-gray-200 pb-1.5 text-base font-semibold text-[#24408E]">
        {title}
      </h3>
      <dl className="divide-y divide-gray-100">
        {items.map((item) => (
          <div
            key={item.label}
            className="grid grid-cols-[minmax(6.5rem,34%)_1fr] gap-3 rounded px-1.5 py-2 transition-colors hover:bg-blue-50/60"
          >
            <dt className="text-xs font-medium text-gray-500 pt-0.5">{item.label}</dt>
            <dd className="text-sm text-gray-900 break-words">{item.value || "—"}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
