"use client";

import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import dynamic from "next/dynamic";
import { Plus, AlertTriangle, Loader2, RefreshCw } from "lucide-react";
import {
  useGetAllModels,
  useGetModelVariables,
  createModel,
  updateModel,
  refreshModelVariables,
} from "@/lib/hooks/useMLModels";
import { useGetCatalogue } from "@/lib/hooks/useCatalogue";
import { Model, ModelInput, ModelPayload, DatasetType } from "@/types/constants";

const DotsLoader = dynamic(() => import("@/components/ui/dotsLoader"), {
  ssr: false,
});

const tabClass = (isActive: boolean) =>
  `flex-1 px-6 py-3 font-semibold transition-all duration-200 ${
    isActive
      ? "text-[#24408E] border-b-2 border-[#00B9F1] bg-gradient-to-r from-blue-50/50 to-transparent"
      : "text-gray-600 hover:text-[#24408E] hover:bg-gray-50"
  }`;

export default function AdminModelsPage() {
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useGetAllModels(0, 100);
  const { data: catalogueData } = useGetCatalogue();

  const models: Model[] = data?.data || [];
  const datasets: DatasetType[] = catalogueData?.data || [];

  const [selectedModel, setSelectedModel] = useState<Model | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"details" | "variables">(
    "details"
  );

  const filteredModels = models.filter((model) =>
    model.name.toLowerCase().includes(searchTerm)
  );

  const onSaved = (message: string) => {
    toast.success(message);
    queryClient.invalidateQueries({ queryKey: ["all_ml_models"] });
    setSelectedModel(null);
    setIsRegistering(false);
  };

  const { mutate: createFn, isPending: createPending } = useMutation({
    mutationFn: createModel,
    onSuccess: () => onSaved("Model registered successfully"),
    onError: (e: any) =>
      toast.error(e?.response?.data?.detail || "Failed to register model"),
  });

  const { mutate: updateFn, isPending: updatePending } = useMutation({
    mutationFn: updateModel,
    onSuccess: () => onSaved("Model updated successfully"),
    onError: (e: any) =>
      toast.error(e?.response?.data?.detail || "Failed to update model"),
  });

  const datasetName = (datasetId: string) =>
    datasets.find((dataset) => dataset.id === datasetId)?.name || datasetId;

  return (
    <div className="mx-auto p-4 flex flex-col overflow-hidden">
      <div className="bg-white shadow-md w-full rounded">
        <div className="p-4 border-b flex items-center gap-4">
          <input
            type="text"
            placeholder="Search models..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value.toLowerCase())}
            className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={() => {
              setIsRegistering(true);
              setSelectedModel(null);
            }}
            className="flex items-center gap-2 bg-[#24408E] text-white px-4 py-2 rounded hover:bg-[#1b3270] transition-colors"
          >
            <Plus className="w-4 h-4" />
            Register Model
          </button>
        </div>

        <div className="overflow-x-auto">
          {isLoading && (
            <div className="flex justify-center w-full p-4">
              <DotsLoader />
            </div>
          )}
          {error && (
            <div className="flex items-center gap-2 p-4 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              Failed to fetch models. Please try again later.
            </div>
          )}
          <ul className="flex space-x-4 p-4">
            {filteredModels.map((model) => (
              <li
                key={model.id}
                onClick={() => {
                  setSelectedModel(model);
                  setIsRegistering(false);
                  setActiveTab("details");
                }}
                className={`flex-shrink-0 w-64 p-4 border rounded-lg hover:bg-gray-100 cursor-pointer shadow-sm transition-all duration-200 ease-in-out ${
                  selectedModel?.id === model.id ? "border-[#00B9F1]" : ""
                }`}
              >
                <div className="font-semibold text-lg mb-2">{model.name}</div>
                <div className="text-sm text-gray-600 mb-1">
                  {datasetName(model.dataset_id)}
                </div>
                <div className="text-sm text-gray-500">
                  Created {new Date(model.created_at).toLocaleDateString()}
                </div>
              </li>
            ))}
          </ul>
        </div>

        {filteredModels.length === 0 && !isLoading && searchTerm && (
          <div className="text-center p-4 text-gray-500">
            No models found matching your search
          </div>
        )}
      </div>

      {isRegistering && (
        <div className="bg-white shadow-md rounded p-6 mt-4">
          <h2 className="text-2xl font-bold mb-4">Register New Model</h2>
          <ModelEditor
            datasets={datasets}
            saving={createPending}
            onSave={(payload) => createFn(payload as ModelPayload)}
            onCancel={() => setIsRegistering(false)}
          />
        </div>
      )}

      {selectedModel && (
        <div className="mt-4">
          <div className="bg-white shadow-md rounded mb-4">
            <div className="flex border-b">
              <button
                onClick={() => setActiveTab("details")}
                className={tabClass(activeTab === "details")}
              >
                Model Details
              </button>
              <button
                onClick={() => setActiveTab("variables")}
                className={tabClass(activeTab === "variables")}
              >
                Input Variables
              </button>
            </div>
          </div>

          {activeTab === "details" && (
            <div className="bg-white shadow-md rounded p-6">
              <h2 className="text-2xl font-bold mb-4">{selectedModel.name}</h2>
              <ModelEditor
                initial={selectedModel}
                datasets={datasets}
                saving={updatePending}
                onSave={(changed) =>
                  updateFn({ id: selectedModel.id, ...changed })
                }
                onCancel={() => setSelectedModel(null)}
              />
            </div>
          )}

          {activeTab === "variables" && (
            <VariablesPreview
              modelId={selectedModel.id}
              modelPath={selectedModel.modal_url}
            />
          )}
        </div>
      )}
    </div>
  );
}

interface ModelEditorProps {
  initial?: Model;
  datasets: DatasetType[];
  saving: boolean;
  onSave: (payload: Partial<ModelPayload>) => void;
  onCancel: () => void;
}

function ModelEditor({
  initial,
  datasets,
  saving,
  onSave,
  onCancel,
}: ModelEditorProps) {
  const [form, setForm] = useState<ModelPayload>({
    name: initial?.name ?? "",
    modal_url: initial?.modal_url ?? "",
    dataset_id: initial?.dataset_id ?? "",
    description: initial?.description ?? "",
  });

  useEffect(() => {
    setForm({
      name: initial?.name ?? "",
      modal_url: initial?.modal_url ?? "",
      dataset_id: initial?.dataset_id ?? "",
      description: initial?.description ?? "",
    });
  }, [initial]);

  const handleChange = (key: keyof ModelPayload, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    if (initial) {
      const changedFields: Partial<ModelPayload> = {};
      (Object.keys(form) as (keyof ModelPayload)[]).forEach((key) => {
        if (form[key] !== initial[key]) {
          changedFields[key] = form[key];
        }
      });

      if (Object.keys(changedFields).length === 0) {
        toast.message("No field has been edited");
        return;
      }
      onSave(changedFields);
    } else {
      if (!form.name || !form.modal_url || !form.dataset_id) {
        toast.error("Name, model file and dataset are required");
        return;
      }
      onSave(form);
    }
  };

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            NAME
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => handleChange("name", e.target.value)}
            placeholder="e.g. Mortality Prediction Model v2"
            className="mt-1 block w-full rounded-md border-gray-300 border-[1px] shadow-sm p-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            MODEL FILE (MODAL URL)
          </label>
          <input
            type="text"
            value={form.modal_url}
            onChange={(e) => handleChange("modal_url", e.target.value)}
            placeholder="e.g. BalancedRandomForest_calibrated_model_iteration_3_9.pkl"
            className="mt-1 block w-full rounded-md border-gray-300 border-[1px] shadow-sm p-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            DATASET
          </label>
          <select
            value={form.dataset_id}
            onChange={(e) => handleChange("dataset_id", e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 border-[1px] shadow-sm p-2"
          >
            <option value="">Select a dataset</option>
            {datasets.map((dataset) => (
              <option key={dataset.id} value={dataset.id}>
                {dataset.name}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            DESCRIPTION
          </label>
          <textarea
            value={form.description}
            onChange={(e) => handleChange("description", e.target.value)}
            rows={3}
            placeholder="What does this model predict and how should it be used?"
            className="mt-1 block w-full rounded-md border-gray-300 border-[1px] shadow-sm p-2"
          />
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-green-500 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {saving ? <DotsLoader /> : initial ? "Save Changes" : "Register Model"}
        </button>
        <button
          onClick={onCancel}
          disabled={saving}
          className="bg-gray-200 text-gray-700 px-4 py-2 rounded disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

function VariablesPreview({
  modelId,
  modelPath,
}: {
  modelId: string;
  modelPath: string;
}) {
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useGetModelVariables(modelPath, {
    enabled: !!modelPath,
  });
  const variables = data?.data;

  const { mutate: refreshFn, isPending: refreshing } = useMutation({
    mutationFn: () => refreshModelVariables(modelId),
    onSuccess: () => {
      toast.success("Model variables refreshed");
      queryClient.invalidateQueries({
        queryKey: ["dataset_model_variables", modelPath],
      });
      queryClient.invalidateQueries({ queryKey: ["all_ml_models"] });
    },
    onError: (e: any) =>
      toast.error(
        e?.response?.data?.detail || "Failed to refresh model variables"
      ),
  });

  const refreshButton = (
    <button
      onClick={() => refreshFn()}
      disabled={refreshing}
      className="flex items-center gap-2 bg-[#24408E] text-white px-4 py-2 rounded hover:bg-[#1b3270] transition-colors disabled:opacity-50"
    >
      <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
      {refreshing ? "Refreshing..." : "Refresh Variables"}
    </button>
  );

  if (isLoading) {
    return (
      <div className="bg-white shadow-md rounded p-6 text-center">
        <Loader2 className="w-8 h-8 text-[#24408E] animate-spin mx-auto mb-4" />
        <p className="text-[#24408E] font-medium">Loading model variables...</p>
      </div>
    );
  }

  if (error || !variables) {
    return (
      <div className="bg-white shadow-md rounded p-6">
        <div className="flex items-center gap-2 text-red-600 mb-4">
          <AlertTriangle className="w-5 h-5" />
          Failed to load variables for this model. Check that the model file
          name is correct and the ML service is reachable, or try refreshing
          the variables.
        </div>
        {refreshButton}
      </div>
    );
  }

  return (
    <div className="bg-white shadow-md rounded p-6">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <p className="text-sm font-medium text-gray-500 mb-1">PREDICTS</p>
          <p className="text-gray-900">
            {variables.output?.description || variables.output?.name || "N/A"}
          </p>
        </div>
        {refreshButton}
      </div>

      <p className="text-sm font-medium text-gray-500 mb-3">INPUT VARIABLES</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {variables.inputs?.map((input: ModelInput) => (
          <div key={input.name} className="border rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <p className="text-sm font-medium text-gray-900 capitalize">
                {input.name.replace(/_/g, " ")}
              </p>
              <span className="text-xs px-2 py-0.5 rounded-full bg-[#24408E]/10 text-[#24408E]">
                {input.type}
              </span>
            </div>
            {input.description && (
              <p className="text-xs text-gray-500 mb-1">{input.description}</p>
            )}
            {input.type === "categorical" && input.mapping && (
              <p className="text-xs text-gray-600">
                Options: {Object.keys(input.mapping).join(", ")}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
