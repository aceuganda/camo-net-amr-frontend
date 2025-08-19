import { ModelPredictionResult } from "@/types/constants";

export const transformPredictionResult = (inferenceData: any): ModelPredictionResult => {
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

  return transformedResult;
};