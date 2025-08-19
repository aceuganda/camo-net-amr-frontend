"use client";

import { Play, Loader2, AlertTriangle } from "lucide-react";
import { getModelIcon } from "./ModelCard";
import {
  ModelInput,
  ModelVariables,
  ModelFormData,
} from "@/types/constants";

export interface ModelFormProps {
  selectedModel: {
    name: string;
    modal_url?: string;
  };
  modelVariables: ModelVariables;
  formData: ModelFormData;
  onInputChange: (inputName: string, value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
  isFormValid: boolean;
  inferencePending: boolean;
  inferenceError: any;
}

export default function ModelForm({
  selectedModel,
  modelVariables,
  formData,
  onInputChange,
  onSubmit,
  onCancel,
  isFormValid,
  inferencePending,
  inferenceError,
}: ModelFormProps) {
  return (
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
                      onInputChange(input.name, e.target.value)
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
                      onInputChange(input.name, e.target.value)
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
            onClick={onSubmit}
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
            onClick={onCancel}
            disabled={inferencePending}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}