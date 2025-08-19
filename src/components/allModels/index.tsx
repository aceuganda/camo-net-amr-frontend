"use client";

import {
  Brain,
  Cpu,
  Activity,
  Clock,
  ChevronRight,
  Loader2,
  AlertTriangle,
  ChevronLeft,
  Play,
} from "lucide-react";
import { StackIcon } from "@radix-ui/react-icons";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useGetAllModels, useGetModelVariables, inferModel } from "@/lib/hooks/useMLModels";
import { useSearch } from "@/context/searchContext";
import { useMutation } from "@tanstack/react-query";
import NavigationBar from "@/components/navigationBar";
import {
  Model,
  ModelInput,
  ModelVariables,
  ModelFormData,
  ModelPredictionResult,
} from "@/types/constants";

type FetchedModel = {
  id: string;
  name: string;
  description: string;
  created_at: string;
  modal_url: string;
  dataset_id?: string;
};

const getModelIcon = (modelName: string) => {
  if (
    modelName.toLowerCase().includes("mortality") ||
    modelName.toLowerCase().includes("risk")
  ) {
    return <Activity className="w-6 h-6" />;
  }
  if (
    modelName.toLowerCase().includes("stay") ||
    modelName.toLowerCase().includes("length")
  ) {
    return <Clock className="w-6 h-6" />;
  }
  return <Brain className="w-6 h-6" />;
};

export default function AllModelsPage() {
  const router = useRouter();
  const { searchTerm } = useSearch();
  const [selectedModel, setSelectedModel] = useState<FetchedModel | null>(null);
  const [formData, setFormData] = useState<ModelFormData>({});
  const [result, setResult] = useState<ModelPredictionResult | null>(null);
  
  // Fetch models
  const {
    data: modelsData,
    isLoading: modelsLoading,
    error: modelsError,
  } = useGetAllModels(0, 100);

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
  const models: FetchedModel[] = modelsData?.data || [];
  const modelVariables = variablesData?.data || null;

  const filteredModels = models.filter((model) =>
    model.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleModelClick = (model: FetchedModel) => {
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
        payload[input.name] = value;
      }
    });

    inferFn({ modelPath: selectedModel.modal_url, payload });
  };

  useEffect(() => {
    if (inferenceSuccess && inferenceData) {
      const rawResult = inferenceData;

      // Transform the result based on the model type and prediction
      let transformedResult: ModelPredictionResult;

      if (
        rawResult.modal_name?.toLowerCase().includes("mortality") ||
        rawResult.modal_name?.toLowerCase().includes("risk")
      ) {
        // Mortality model: 0 = survived, 1 = died
        transformedResult = {
          prediction:
            rawResult.prediction === 0
              ? "Predicted to survive"
              : "Predicted to not to survive",
          probability: rawResult.prediction_probabilities
            ? Math.max(...rawResult.prediction_probabilities)
            : undefined,
          description: rawResult.output_description,
        };
      } else {
        // Other models (like hospital stay): show rounded numeric value
        transformedResult = {
          prediction: Number(rawResult.prediction).toFixed(2),
          unit: rawResult.output_description?.toLowerCase().includes("days")
            ? "days"
            : undefined,
          description: rawResult.output_description,
        };
      }

      setResult(transformedResult);
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
              <button 
                onClick={() => router.push('/')}
                className="text-[#00B9F1] hover:text-[#0090bd] font-medium"
              >
                Home
              </button>
              <span className="text-gray-400">/</span>
              <span className="text-[#24408E] font-semibold">
                Models
              </span>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-sm border border-white/30 rounded-xl shadow-xl p-6 mb-8">
            <div className="flex items-center gap-3">
              <StackIcon className="w-8 h-8 text-[#24408E]" />
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-[#24408E] bg-gradient-to-r from-[#24408E] to-[#00B9F1] bg-clip-text text-transparent">
                  ML Models
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  Explore available machine learning models
                </p>
              </div>
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
            ) : filteredModels.length === 0 && searchTerm ? (
              <div className="bg-white/80 backdrop-blur-sm border border-yellow-200 rounded-xl p-8 text-center">
                <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                  No Models Found
                </h3>
                <p className="text-yellow-600">
                  No models match your search term: {searchTerm}
                </p>
              </div>
            ) : filteredModels.length === 0 ? (
              <div className="bg-white/80 backdrop-blur-sm border border-orange-200 rounded-xl p-8 text-center">
                <AlertTriangle className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-orange-800 mb-2">
                  No Models Available
                </h3>
                <p className="text-orange-600">
                  There are currently no trained models available.
                </p>
              </div>
            ) : (
              <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                {filteredModels.map((model: FetchedModel) => (
                  <div
                    key={model.id}
                    onClick={() => handleModelClick(model)}
                    className="flex-shrink-0 w-80 bg-white/80 backdrop-blur-sm border border-white/50 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-105 group"
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <div className="p-3 bg-gradient-to-r from-[#00B9F1] to-[#24408E] rounded-lg group-hover:shadow-lg transition-shadow">
                        {getModelIcon(model.name)}
                        <div className="text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-[#24408E] mb-1 truncate">
                          {model.name}
                        </h3>
                        <p className="text-xs text-gray-500">
                          Created{" "}
                          {new Date(model.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 line-clamp-3 mb-4">
                      {model.description || "No description available"}
                    </p>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                        ML Model
                      </span>
                      <ChevronRight className="w-4 h-4 text-[#24408E] group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* {filteredModels.length > 0 && (
            <div className="bg-white/80 backdrop-blur-sm border border-white/30 rounded-xl p-4 text-center">
              <p className="text-sm text-gray-600">
                Showing{" "}
                <span className="font-semibold text-[#24408E]">
                  {filteredModels.length}
                </span>{" "}
                models
              </p>
            </div>
          )} */}

          {selectedModel && variablesLoading && (
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-8 text-center mb-8">
              <Loader2 className="w-8 h-8 text-[#24408E] animate-spin mx-auto mb-4" />
              <p className="text-[#24408E] font-medium">
                Loading model variables...
              </p>
            </div>
          )}

          {selectedModel && variablesError && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-6 h-6 text-red-600" />
                <div>
                  <h3 className="text-lg font-semibold text-red-800">
                    Error Loading Variables
                  </h3>
                  <p className="text-red-600 text-sm">
                    Failed to fetch model variables. Please try selecting the
                    model again.
                  </p>
                </div>
              </div>
            </div>
          )}

          {selectedModel && modelVariables && !variablesLoading && (
            <div className="bg-white/80 backdrop-blur-sm border border-white/50 rounded-xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-[#24408E] to-[#00B9F1] p-6">
                <div className="flex items-center gap-3 text-white">
                  {getModelIcon(selectedModel.name)}
                  <div>
                    <h2 className="text-xl font-bold">{modelVariables.name}</h2>
                    <p className="text-blue-100 text-sm">
                      Fill in the required information for prediction
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {modelVariables.inputs.map(
                    (input: ModelInput, index: number) => (
                      <div key={index} className="space-y-2">
                        <label className="block text-sm font-medium text-[#24408E] capitalize">
                          {input.name.replace(/_/g, " ")}
                          <span className="text-red-500 ml-1">*</span>
                        </label>

                        {input.type === "categorical" ? (
                          <select
                            value={formData[input.name] || ""}
                            onChange={(e) =>
                              handleInputChange(input.name, e.target.value)
                            }
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#00B9F1] focus:border-transparent bg-white/50 backdrop-blur-sm"
                          >
                            <option value="">
                              Select {input.name.replace(/_/g, " ")}
                            </option>
                            {input.mapping &&
                              Object.keys(input.mapping).map((option) => (
                                <option key={option} value={option}>
                                  {option}
                                </option>
                              ))}
                          </select>
                        ) : (
                          <input
                            type="number"
                            step="0.01"
                            value={formData[input.name] || ""}
                            onChange={(e) =>
                              handleInputChange(input.name, e.target.value)
                            }
                            placeholder={
                              input.description ||
                              `Enter ${input.name.replace(/_/g, " ")}`
                            }
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#00B9F1] focus:border-transparent bg-white/50 backdrop-blur-sm"
                          />
                        )}

                        {input.description && (
                          <p className="text-xs text-gray-500">
                            {input.description}
                          </p>
                        )}
                      </div>
                    )
                  )}
                </div>

                {inferenceError && (
                  <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-600 text-sm">
                      Failed to run prediction. Please try again.
                    </p>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={handleSubmit}
                    disabled={inferencePending || !isFormValid}
                    className="flex-1 bg-gradient-to-r from-[#00B9F1] to-[#24408E] text-white py-3 px-6 rounded-lg hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {inferencePending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Running Prediction...
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4" />
                        Run Prediction
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      setSelectedModel(null);
                      setFormData({});
                      setResult(null);
                    }}
                    disabled={inferencePending}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {result && (
            <div className="mt-8 bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-emerald-800 mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Prediction Result
              </h3>

              <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4">
                <div className="text-center">
                  <div
                    className={`text-3xl font-bold mb-2 ${
                      typeof result.prediction === "string" &&
                      result.prediction === "survived"
                        ? "text-green-600"
                        : typeof result.prediction === "string" &&
                            result.prediction === "died"
                          ? "text-red-600"
                          : "text-[#24408E]"
                    }`}
                  >
                    {typeof result.prediction === "string"
                      ? result.prediction.toUpperCase()
                      : `${result.prediction} ${result.unit || ""}`}
                  </div>

                  {result.probability && (
                    <p className="text-gray-600">
                      Confidence:{" "}
                      <span className="font-semibold">
                        {(result.probability * 100).toFixed(1)}%
                      </span>
                    </p>
                  )}

                  {result.description && (
                    <p className="text-gray-600 mt-2 text-sm">
                      {result.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      </div>
  );
}