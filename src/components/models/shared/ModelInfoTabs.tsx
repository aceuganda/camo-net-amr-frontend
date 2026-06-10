"use client";

import { useState, useEffect } from "react";
import { Info, Play, Loader2, AlertTriangle } from "lucide-react";
import { getModelIcon } from "./ModelCard";
import { ModelInput, ModelVariables } from "@/types/constants";

export interface ModelInfoTabsModel {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  modal_url?: string;
  dataset_id?: string;
}

export interface ModelInfoTabsProps {
  model: ModelInfoTabsModel;
  modelVariables: ModelVariables | null;
  variablesLoading: boolean;
  variablesError?: any;
  datasetName?: string;
  children: React.ReactNode;
}

const tabClass = (isActive: boolean) =>
  `flex-1 px-3 sm:px-6 py-3 sm:py-4 text-left font-semibold transition-all duration-200 ${
    isActive
      ? "text-[#24408E] border-b-2 border-[#00B9F1] bg-gradient-to-r from-blue-50/50 to-transparent"
      : "text-gray-600 hover:text-[#24408E] hover:bg-gray-50"
  }`;

export default function ModelInfoTabs({
  model,
  modelVariables,
  variablesLoading,
  variablesError,
  datasetName,
  children,
}: ModelInfoTabsProps) {
  const [activeTab, setActiveTab] = useState<"about" | "predict">("predict");

  useEffect(() => {
    setActiveTab("predict");
  }, [model.id]);

  const modelInformation = [
    { label: "Model Name", value: model.name },
    ...(datasetName ? [{ label: "Dataset", value: datasetName }] : []),
    {
      label: "Created",
      value: new Date(model.created_at).toLocaleDateString(),
    },
    { label: "Model File", value: model.modal_url || "N/A" },
    {
      label: "Predicts",
      value:
        modelVariables?.output?.description ||
        modelVariables?.output?.name ||
        "N/A",
    },
  ];

  return (
    <div className="bg-white/90 backdrop-blur-sm border border-white/30 rounded-xl shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-[#24408E] to-[#00B9F1] p-6">
        <div className="flex items-center gap-3 text-white">
          {getModelIcon(model.name)}
          <div>
            <h2 className="text-xl font-bold">{model.name}</h2>
            <p className="text-blue-100 text-sm">
              Review the model details or run a prediction
            </p>
          </div>
        </div>
      </div>

      <div className="border-b border-gray-200">
        <div className="flex">
          <button
            onClick={() => setActiveTab("predict")}
            className={tabClass(activeTab === "predict")}
          >
            <div className="flex items-center gap-2">
              <Play className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
              <span className="text-sm sm:text-base">Run Prediction</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab("about")}
            className={tabClass(activeTab === "about")}
          >
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
              <span className="text-sm sm:text-base">About Model</span>
            </div>
          </button>
        </div>
      </div>

      <div className="p-6">
        {activeTab === "about" && (
          <div>
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-lg border border-blue-100 mb-6">
              <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
                {model.description || "No description available"}
              </p>
            </div>

            {variablesLoading ? (
              <div className="text-center py-8">
                <Loader2 className="w-8 h-8 text-[#24408E] animate-spin mx-auto mb-4" />
                <p className="text-[#24408E] font-medium">
                  Loading model details...
                </p>
              </div>
            ) : variablesError ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <p className="text-red-600 text-sm">
                  Failed to load the model variables. Please try selecting the
                  model again.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-[#24408E] mb-4 pb-2 border-b border-gray-200">
                    Model Information
                  </h3>
                  {modelInformation.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-start space-x-3 p-3 hover:bg-blue-50 rounded-lg transition-colors"
                    >
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

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-[#24408E] mb-4 pb-2 border-b border-gray-200">
                    Input Variables
                  </h3>
                  {modelVariables?.inputs?.length ? (
                    modelVariables.inputs.map((input: ModelInput) => (
                      <div
                        key={input.name}
                        className="p-3 hover:bg-cyan-50 rounded-lg transition-colors"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-medium text-gray-900 capitalize">
                            {input.name.replace(/_/g, " ")}
                          </p>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-[#24408E]/10 text-[#24408E]">
                            {input.type}
                          </span>
                        </div>
                        {input.description && (
                          <p className="text-xs text-gray-500 mb-1">
                            {input.description}
                          </p>
                        )}
                        {input.type === "categorical" && input.mapping && (
                          <p className="text-xs text-gray-600">
                            Options: {Object.keys(input.mapping).join(", ")}
                          </p>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 p-3">
                      No input variables available for this model.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "predict" && <div>{children}</div>}
      </div>
    </div>
  );
}
