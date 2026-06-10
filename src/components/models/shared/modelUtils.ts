import { ModelPredictionResult } from "@/types/constants";

export const transformPredictionResult = (inferenceData: any): ModelPredictionResult => {
  const rawResult = inferenceData;

  // Transform the result based on the model type and prediction
  let transformedResult: ModelPredictionResult;

  if (
    rawResult.modal_name?.toLowerCase().includes("mortality") ||
    rawResult.modal_name?.toLowerCase().includes("risk")
  ) {
    // Mortality model: 0 = survived, 1 = died.
    // prediction_probabilities is [P(survive), P(die)] — the risk figure
    // to surface is the probability of death.
    transformedResult = {
      prediction:
        rawResult.prediction === 0
          ? "Predicted to survive"
          : "Predicted not to survive",
      probability: rawResult.prediction_probabilities
        ? rawResult.prediction_probabilities[1]
        : undefined,
      probabilityLabel: "Mortality risk",
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

export const getInferenceErrorMessage = (error: any): string => {
  const status = error?.response?.status;
  if (status === 502 || status === 503) {
    return "The prediction service is currently unavailable. Please try again shortly.";
  }
  const detail = error?.response?.data?.detail;
  if (typeof detail === "string") {
    return detail;
  }
  return "Failed to run prediction. Please try again.";
};
