"use client";

import { Activity } from "lucide-react";
import { ModelPredictionResult } from "@/types/constants";

export interface PredictionResultProps {
  result: ModelPredictionResult;
}

export default function PredictionResult({ result }: PredictionResultProps) {
  return (
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
  );
}