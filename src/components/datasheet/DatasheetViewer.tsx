"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Download, FileText } from "lucide-react";

interface DatasheetSection {
  title: string;
  questions: Array<{
    question: string;
    answer: string;
  }>;
}

interface DatasheetContent {
  questions: Record<string, string[]>;
  answers: Record<string, string>;
}

interface DatasheetData {
  id: string;
  dataset_id: string;
  template_version: string;
  content: DatasheetContent;
  created_at: string;
  updated_at: string;
  markdown?: string;
}

interface DatasheetViewerProps {
  datasheet: DatasheetData;
  onDownload?: () => void;
}

const SECTION_ORDER = [
  "Motivation",
  "Composition",
  "Collection",
  "Preprocessing/Cleaning/Labeling",
  "Uses",
  "Distribution",
  "Maintenance",
];

export default function DatasheetViewer({
  datasheet,
  onDownload,
}: DatasheetViewerProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(["Motivation"])
  );

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
    } else {
      setExpandedSections(new Set(SECTION_ORDER));
    }
  };

  const collapseAll = () => {
    setExpandedSections(new Set());
  };

  const parseSections = (): DatasheetSection[] => {
    const sections: DatasheetSection[] = [];

    if (!datasheet?.content) {
      return sections;
    }

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
            answer: (datasheet.content as any).answers?.[answerKey] || "No answer provided",
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

  const sections = parseSections();

  return (
    <div className="w-full">
      <div className="bg-white/90 backdrop-blur-sm border border-white/30 rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-[#24408E] to-[#00B9F1] p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="bg-white/20 p-2 sm:p-3 rounded-lg flex-shrink-0">
                <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white">
                  Dataset Datasheet
                </h2>
              </div>
            </div>
            {onDownload && (
              <button
                onClick={onDownload}
                className="flex items-center space-x-2 bg-white/20 hover:bg-white/30 text-white px-3 sm:px-4 py-2 rounded-lg transition-all duration-200 self-start"
              >
                <Download className="w-4 h-4" />
                <span className="text-sm font-medium">Export</span>
              </button>
            )}
          </div>
        </div>

        <div className="p-6">
          <div className="flex justify-end space-x-2 mb-4">
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
                      <h3 className="text-sm sm:text-base font-semibold text-[#24408E] text-left truncate">
                        {section.title}
                      </h3>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5 text-[#24408E] flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-[#24408E] flex-shrink-0" />
                    )}
                  </button>

                  {isExpanded && (
                    <div className="p-4 sm:p-6 bg-white space-y-4 sm:space-y-6">
                      {section.questions.map((qa, qaIndex) => (
                        <div
                          key={qaIndex}
                          className="border-l-4 border-[#00B9F1]/30 pl-3 sm:pl-4 hover:border-[#00B9F1] transition-colors"
                        >
                          <p className="font-medium text-gray-800 mb-2 text-sm">
                            {qa.question}
                          </p>
                          <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">
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
      </div>
    </div>
  );
}
