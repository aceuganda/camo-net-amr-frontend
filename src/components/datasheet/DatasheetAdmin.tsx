"use client";

import { useState, useRef, useEffect } from "react";
import { Upload, FileText, Save, X, AlertCircle, CheckCircle, Download } from "lucide-react";
import { toast } from "sonner";
import dynamic from "next/dynamic";
import { useDatasheetTemplate } from "@/lib/hooks/useDatasheets";

const DotsLoader = dynamic(() => import("../ui/dotsLoader"), { ssr: false });

interface DatasheetContent {
  questions: Record<string, string[]>;
  answers: Record<string, string>;
}

interface DatasheetData {
  id?: string;
  dataset_id: string;
  template_version: string;
  content: DatasheetContent;
  created_at?: string;
  updated_at?: string;
  markdown?: string;
}

interface DatasheetAdminProps {
  datasetId: string;
  existingDatasheet?: DatasheetData | null;
  onSave: (datasheet: DatasheetData) => void;
  onCancel?: () => void;
  isSaving?: boolean;
}

const DEFAULT_SECTIONS = [
  "Motivation",
  "Composition",
  "Collection",
  "Preprocessing/Cleaning/Labeling",
  "Uses",
  "Distribution",
  "Maintenance",
];

export default function DatasheetAdmin({
  datasetId,
  existingDatasheet,
  onSave,
  onCancel,
  isSaving = false,
}: DatasheetAdminProps) {
  const [mode, setMode] = useState<"upload" | "edit">(
    existingDatasheet ? "edit" : "upload"
  );
  const [datasheetData, setDatasheetData] = useState<DatasheetData | null>(
    existingDatasheet || null
  );
  const [currentSection, setCurrentSection] = useState(0);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch template from API
  const { data: templateData, isLoading: templateLoading } = useDatasheetTemplate();

  useEffect(() => {
    if (existingDatasheet) {
      setDatasheetData(existingDatasheet);
      setMode("edit");
    }
  }, [existingDatasheet]); // eslint-disable-line react-hooks/exhaustive-deps

  const resolveTemplateContent = () => {
    const raw = templateData?.data;
    if (!raw) return null;
    // sections nested inside content field
    if (Array.isArray(raw.content?.sections)) return raw.content;
    // sections at top level
    if (Array.isArray(raw.sections)) return raw;
    // last resort
    return raw.content ?? raw;
  };

  const handleUseTemplate = () => {
    const content = resolveTemplateContent();
    if (!content) {
      toast.error("Template not available, please try again");
      return;
    }
    setDatasheetData({
      dataset_id: datasetId,
      template_version:
        templateData?.data?.template_version ||
        content?.template_version ||
        "1.0",
      content,
    });
    setMode("edit");
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadedFile(file);
    setIsProcessing(true);

    try {
      const fileContent = await file.text();
      const fileExtension = file.name.split(".").pop()?.toLowerCase();

      let parsedContent: DatasheetContent = {
        questions: {},
        answers: {},
      };

      if (fileExtension === "json") {
        const jsonData = JSON.parse(fileContent);

        // The uploaded file should be the content object directly
        // Send it as-is to the backend - the backend will normalize it
        parsedContent = jsonData;
      } else {
        throw new Error("Unsupported file format. Please upload JSON files.");
      }

      const parsedData: DatasheetData = {
        dataset_id: datasetId,
        template_version: parsedContent.template_version || "1.0",
        content: parsedContent,
      };

      setDatasheetData(parsedData);
      setMode("edit");
      toast.success("File uploaded successfully! You can now edit the content.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to parse file"
      );
      setUploadedFile(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const parseMarkdownDatasheet = (markdown: string): DatasheetContent => {
    const questions: Record<string, string[]> = {};
    const answers: Record<string, string> = {};

    const sections = markdown.split(/^##\s+/m).filter(Boolean);

    sections.forEach((section) => {
      const lines = section.trim().split("\n");
      const sectionTitle = lines[0].trim();

      const sectionQuestions: string[] = [];
      let currentQuestionIndex = -1;
      let currentAnswer = "";

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();

        if (line.startsWith("**") && line.includes("?")) {
          if (currentQuestionIndex >= 0) {
            answers[`${sectionTitle}_${currentQuestionIndex}`] = currentAnswer.trim();
          }

          const question = line.replace(/\*\*/g, "").trim();
          sectionQuestions.push(question);
          currentQuestionIndex++;
          currentAnswer = "";
        } else if (line && currentQuestionIndex >= 0) {
          currentAnswer += line + "\n";
        }
      }

      if (currentQuestionIndex >= 0) {
        answers[`${sectionTitle}_${currentQuestionIndex}`] = currentAnswer.trim();
      }

      if (sectionQuestions.length > 0) {
        questions[sectionTitle] = sectionQuestions;
      }
    });

    return {
      questions,
      answers,
    };
  };

  const createDefaultSections = (): Record<string, string[]> => {
    const defaultQuestions: Record<string, string[]> = {};

    DEFAULT_SECTIONS.forEach((section) => {
      defaultQuestions[section] = ["Please provide information about this section."];
    });

    return defaultQuestions;
  };

  const downloadTemplate = () => {
    const content = resolveTemplateContent();
    if (!content) {
      toast.error("Template not available");
      return;
    }

    const blob = new Blob([JSON.stringify(content, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "datasheet-template.json";
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
    toast.success("Template downloaded successfully!");
  };

  const handleAnswerChange = (sectionTitle: string, questionIndex: number, value: string) => {
    if (!datasheetData) return;

    // Handle sections format
    if (datasheetData.content.sections && Array.isArray(datasheetData.content.sections)) {
      const updatedSections = datasheetData.content.sections.map((section: any) => {
        if (section.title === sectionTitle) {
          const updatedQuestions = section.questions.map((q: any, idx: number) => {
            if (idx === questionIndex) {
              return { ...q, answer: value };
            }
            return q;
          });
          return { ...section, questions: updatedQuestions };
        }
        return section;
      });

      setDatasheetData({
        ...datasheetData,
        content: {
          ...datasheetData.content,
          sections: updatedSections,
        },
      });
    }
    // Handle old format
    else {
      const answerKey = `${sectionTitle}_${questionIndex}`;
      setDatasheetData({
        ...datasheetData,
        content: {
          ...datasheetData.content,
          answers: {
            ...datasheetData.content.answers,
            [answerKey]: value,
          },
        },
      });
    }
  };

  const handleSave = () => {
    if (!datasheetData) {
      toast.error("No datasheet data to save");
      return;
    }

    const incompleteSections: string[] = [];

    // Handle sections format
    if (datasheetData.content.sections && Array.isArray(datasheetData.content.sections)) {
      datasheetData.content.sections.forEach((section: any) => {
        section.questions?.forEach((q: any) => {
          if (!q.answer?.trim()) {
            incompleteSections.push(section.title);
          }
        });
      });
    }
    // Handle old format
    else if (datasheetData.content.questions) {
      Object.entries(datasheetData.content.questions).forEach(([section, questions]) => {
        questions.forEach((_, index) => {
          const answerKey = `${section}_${index}`;
          if (!datasheetData.content.answers?.[answerKey]?.trim()) {
            incompleteSections.push(section);
          }
        });
      });
    }

    if (incompleteSections.length > 0) {
      toast.error(
        `Please complete all questions in: ${[...new Set(incompleteSections)].join(", ")}`
      );
      return;
    }

    onSave({
      ...datasheetData,
      dataset_id: datasetId,
    });
  };

  const getSectionList = (): string[] => {
    if (!datasheetData?.content) return [];

    // Handle sections format
    if (datasheetData.content.sections && Array.isArray(datasheetData.content.sections)) {
      return datasheetData.content.sections.map((s: any) => s.title);
    }
    // Handle old format
    else if (datasheetData.content.questions) {
      return Object.keys(datasheetData.content.questions);
    }

    return [];
  };

  const getCurrentSectionData = () => {
    if (!datasheetData?.content) return null;

    const sectionList = getSectionList();
    const sectionTitle = sectionList[currentSection];
    if (!sectionTitle) return null;

    // Handle sections format
    if (datasheetData.content.sections && Array.isArray(datasheetData.content.sections)) {
      const section = datasheetData.content.sections.find((s: any) => s.title === sectionTitle);
      if (!section) return null;

      const questions = section.questions?.map((q: any) => q.prompt || q.question) || [];
      return { sectionTitle, questions };
    }
    // Handle old format
    else if (datasheetData.content.questions) {
      const questions = datasheetData.content.questions[sectionTitle] || [];
      return { sectionTitle, questions };
    }

    return null;
  };

  const isCurrentSectionComplete = (): boolean => {
    if (!datasheetData?.content) return false;

    const sectionData = getCurrentSectionData();
    if (!sectionData) return false;

    // Handle sections format
    if (datasheetData.content.sections && Array.isArray(datasheetData.content.sections)) {
      const section = datasheetData.content.sections.find((s: any) => s.title === sectionData.sectionTitle);
      if (!section) return false;

      return section.questions?.every((q: any) => q.answer?.trim()) ?? false;
    }
    // Handle old format
    else if (datasheetData.content.questions && datasheetData.content.answers) {
      return sectionData.questions.every((_, index) => {
        const answerKey = `${sectionData.sectionTitle}_${index}`;
        return datasheetData.content.answers[answerKey]?.trim();
      });
    }

    return false;
  };

  const sectionList = getSectionList();
  const currentSectionData = getCurrentSectionData();

  return (
    <div className="w-full">
      <div className="bg-white/90 backdrop-blur-sm border border-white/30 rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-[#24408E] to-[#00B9F1] p-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">
                {existingDatasheet ? "Update Datasheet" : "Upload Datasheet"}
              </h2>
              <p className="text-blue-100 text-sm mt-1">
                {mode === "upload"
                  ? "Upload a markdown or JSON datasheet file"
                  : "Review and edit datasheet content"}
              </p>
            </div>
            {onCancel && (
              <button
                onClick={onCancel}
                className="text-white/80 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            )}
          </div>
        </div>

        <div className="p-6">
          {mode === "upload" && (
            <div className="space-y-6">
              {/* Primary action: use template directly */}
              <div className="border-2 border-[#00B9F1] rounded-xl p-8 text-center bg-gradient-to-br from-blue-50 to-cyan-50">
                <div className="flex flex-col items-center space-y-4">
                  <div className="bg-white p-4 rounded-full shadow-sm">
                    <FileText className="w-8 h-8 text-[#00B9F1]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-[#24408E] mb-1">
                      Fill in with Template
                    </h3>
                    <p className="text-sm text-gray-600">
                      Load the standard datasheet template and answer the questions directly here
                    </p>
                  </div>
                  <button
                    onClick={handleUseTemplate}
                    disabled={templateLoading || !templateData?.data}
                    className="flex items-center space-x-2 bg-[#24408E] hover:bg-[#1a3070] text-white px-8 py-3 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    {templateLoading ? (
                      <>
                        <DotsLoader />
                        <span>Loading template...</span>
                      </>
                    ) : (
                      <>
                        <FileText className="w-5 h-5" />
                        <span>Use Template</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-sm text-gray-400">or upload a completed JSON file</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#00B9F1] transition-colors">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <div className="flex flex-col items-center space-y-3">
                  <Upload className="w-6 h-6 text-gray-400" />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isProcessing}
                    className="flex items-center space-x-2 bg-white border border-gray-300 hover:border-[#00B9F1] text-gray-700 hover:text-[#00B9F1] px-5 py-2 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    {isProcessing ? (
                      <>
                        <DotsLoader />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        <span>Choose JSON File</span>
                      </>
                    )}
                  </button>
                  {uploadedFile && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600 bg-blue-50 px-4 py-2 rounded-lg">
                      <FileText className="w-4 h-4" />
                      <span>{uploadedFile.name}</span>
                    </div>
                  )}
                  <button
                    onClick={downloadTemplate}
                    disabled={templateLoading || !templateData?.data}
                    className="text-xs text-[#00B9F1] hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Download blank template
                  </button>
                </div>
              </div>
            </div>
          )}

          {mode === "edit" && datasheetData && currentSectionData && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b pb-4">
                <div>
                  <h3 className="text-xl font-semibold text-[#24408E]">
                    {currentSectionData.sectionTitle}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Section {currentSection + 1} of {sectionList.length}
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  {isCurrentSectionComplete() ? (
                    <div className="flex items-center space-x-2 text-green-600 bg-green-50 px-3 py-1 rounded-full">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-sm font-medium">Complete</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2 text-amber-600 bg-amber-50 px-3 py-1 rounded-full">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-sm font-medium">Incomplete</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2 mb-6">
                {sectionList.map((section, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSection(index)}
                    className={`px-3 py-2 text-sm rounded-lg transition-all duration-200 ${
                      currentSection === index
                        ? "bg-[#00B9F1] text-white font-semibold"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {section}
                  </button>
                ))}
              </div>

              <div className="space-y-6">
                {currentSectionData.questions.map((question, qIndex) => {
                  // Get answer based on format
                  let answer = "";

                  if (datasheetData.content.sections && Array.isArray(datasheetData.content.sections)) {
                    // Handle sections format - get answer from question object
                    const section = datasheetData.content.sections.find((s: any) => s.title === currentSectionData.sectionTitle);
                    answer = section?.questions?.[qIndex]?.answer || "";
                  } else {
                    // Handle old format - get answer from answers object
                    const answerKey = `${currentSectionData.sectionTitle}_${qIndex}`;
                    answer = datasheetData.content.answers?.[answerKey] || "";
                  }

                  return (
                    <div
                      key={qIndex}
                      className="border border-gray-200 rounded-lg p-4 hover:border-[#00B9F1]/50 transition-colors"
                    >
                      <label className="block mb-3">
                        <span className="font-medium text-gray-800 block mb-2">
                          Q{qIndex + 1}: {question}
                        </span>
                        <textarea
                          value={answer}
                          onChange={(e) =>
                            handleAnswerChange(
                              currentSectionData.sectionTitle,
                              qIndex,
                              e.target.value
                            )
                          }
                          rows={4}
                          placeholder="Enter your answer here..."
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00B9F1] focus:border-transparent resize-y"
                        />
                      </label>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between pt-6 border-t">
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentSection((prev) => Math.max(0, prev - 1))}
                    disabled={currentSection === 0}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() =>
                      setCurrentSection((prev) => Math.min(sectionList.length - 1, prev + 1))
                    }
                    disabled={currentSection === sectionList.length - 1}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>

                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center space-x-2 bg-[#00B9F1] hover:bg-[#0090bd] text-white px-6 py-3 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? (
                    <>
                      <DotsLoader />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      <span>Save Datasheet</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
