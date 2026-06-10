"use client";

import {
  Brain,
  Loader2,
  AlertTriangle,
  ChevronLeft,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  useGetModels,
  useGetModelVariables,
  inferModel,
} from "@/lib/hooks/useMLModels";
import { useMutation } from "@tanstack/react-query";
import ModelCard from "@/components/models/shared/ModelCard";
import ModelInfoTabs from "@/components/models/shared/ModelInfoTabs";
import ModelForm from "@/components/models/shared/ModelForm";
import PredictionResult from "@/components/models/shared/PredictionResult";
import { transformPredictionResult } from "@/components/models/shared/modelUtils";
import {
  Model,
  ModelInput,
  ModelFormData,
  ModelPredictionResult,
  ModelsPageProps,
} from "@/types/constants";

export default function ModelsPage({ datasetId, dataset }: ModelsPageProps) {
  const [selectedModel, setSelectedModel] = useState<Model | null>(null);
  const [formData, setFormData] = useState<ModelFormData>({});
  const [result, setResult] = useState<ModelPredictionResult | null>(null);

  const router = useRouter();

  // Fetch models
  const {
    data: modelsData,
    isLoading: modelsLoading,
    error: modelsError,
  } = useGetModels(datasetId);

  // Fetch model variables when a model is selected
  const {
    data: variablesData,
    isLoading: variablesLoading,
    error: variablesError,
  } = useGetModelVariables(selectedModel?.modal_url || "", {
    enabled: !!selectedModel,
  });

  // Inference mutation
  const {
    data: inferenceData,
    isSuccess: inferenceSuccess,
    error: inferenceError,
    isPending: inferencePending,
    mutate: inferFn,
  } = useMutation({
    mutationFn: ({ modelPath, payload }: { modelPath: string; payload: any }) =>
      inferModel(modelPath, payload),
  });

  // Extract data
  const models: Model[] = modelsData?.data || [];
  const modelVariables = variablesData?.data || null;

  const handleModelClick = (model: Model) => {
    setSelectedModel(model);
    setFormData({});
    setResult(null);
  };

  const handleInputChange = (inputName: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [inputName]: value,
    }));
  };

  const handleSubmit = () => {
    if (!selectedModel || !modelVariables) return;

    const payload: Record<string, any> = {};

    modelVariables.inputs.forEach((input: ModelInput) => {
      const value: string | number | undefined = formData[input.name];
      if (value !== undefined && value !== "") {
        payload[input.name] =
          input.type === "numeric" ? Number(value) : value;
      }
    });

    inferFn({ modelPath: selectedModel.modal_url, payload });
  };

  useEffect(() => {
    if (inferenceSuccess && inferenceData) {
      setResult(transformPredictionResult(inferenceData));
    }
  }, [inferenceSuccess, inferenceData]);

  // Check if form is valid
  const isFormValid =
    modelVariables?.inputs.every((input: { name: string | number }) => {
      const value = formData[input.name];
      return value !== undefined && value !== "";
    }) || false;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="min-h-screen w-full">
        <div className="mx-auto px-4 w-full sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="bg-white/80 backdrop-blur-sm border border-white/30 rounded-xl shadow-lg p-4 mb-6">
            <div className="flex items-center space-x-2 text-sm">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-white/50 rounded-lg transition-all duration-200"
              >
                <ChevronLeft className="w-5 h-5 text-[#24408E]" />
              </button>
              <button className="text-[#00B9F1] hover:text-[#0090bd] font-medium">
                Datasets
              </button>
              <span className="text-gray-400">/</span>
              <span
                className="text-[#24408E] font-semibold truncate max-w-[300px]"
                title={dataset.data_set.name}
              >
                {dataset.data_set.name}
              </span>
            </div>
          </div>

          {modelsError && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-6 h-6 text-red-600" />
                <div>
                  <h3 className="text-lg font-semibold text-red-800">
                    Error Loading Models
                  </h3>
                  <p className="text-red-600 text-sm">
                    Failed to fetch models. Please try again later.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="mb-8">
            <h2 className="text-xl font-semibold text-[#24408E] mb-4 flex items-center gap-2">
              <Brain className="w-5 h-5" />
              Available Models
              {modelsLoading && (
                <Loader2 className="w-4 h-4 animate-spin text-[#00B9F1]" />
              )}
            </h2>

            {modelsLoading ? (
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-8 text-center">
                <Loader2 className="w-8 h-8 text-[#24408E] animate-spin mx-auto mb-4" />
                <p className="text-[#24408E] font-medium">Loading models...</p>
              </div>
            ) : models.length === 0 ? (
              <div className="bg-white/80 backdrop-blur-sm border border-orange-200 rounded-xl p-8 text-center">
                <AlertTriangle className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-orange-800 mb-2">
                  No Models Available
                </h3>
                <p className="text-orange-600">
                  There are currently no trained models available for this
                  dataset.
                </p>
              </div>
            ) : (
              <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                {models.map((model: Model) => (
                  <ModelCard
                    key={model.id}
                    model={model}
                    onClick={() => handleModelClick(model)}
                  />
                ))}
              </div>
            )}
          </div>

          {selectedModel && (
            <ModelInfoTabs
              model={selectedModel}
              modelVariables={modelVariables}
              variablesLoading={variablesLoading}
              variablesError={variablesError}
              datasetName={dataset.data_set.name}
            >
              {variablesLoading ? (
                <div className="text-center py-8">
                  <Loader2 className="w-8 h-8 text-[#24408E] animate-spin mx-auto mb-4" />
                  <p className="text-[#24408E] font-medium">
                    Loading model variables...
                  </p>
                </div>
              ) : variablesError ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
                  <p className="text-red-600 text-sm">
                    Failed to fetch model variables. Please try selecting the
                    model again.
                  </p>
                </div>
              ) : modelVariables ? (
                <>
                  <ModelForm
                    modelVariables={modelVariables}
                    formData={formData}
                    onInputChange={handleInputChange}
                    onSubmit={handleSubmit}
                    onCancel={() => {
                      setSelectedModel(null);
                      setFormData({});
                      setResult(null);
                    }}
                    isFormValid={isFormValid}
                    inferencePending={inferencePending}
                    inferenceError={inferenceError}
                  />
                  {result && <PredictionResult result={result} />}
                </>
              ) : null}
            </ModelInfoTabs>
          )}
        </div>
      </div>
    </div>
  );
}
