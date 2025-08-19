"use client";

import { Brain, Activity, Clock, ChevronRight } from "lucide-react";

export interface ModelCardProps {
  model: {
    id: string;
    name: string;
    description?: string;
    created_at: string;
    modal_url?: string;
  };
  onClick: () => void;
  className?: string;
}

export const getModelIcon = (modelName: string) => {
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

export default function ModelCard({ model, onClick, className = "" }: ModelCardProps) {
  return (
    <div
      onClick={onClick}
      className={`flex-shrink-0 w-80 bg-white/80 backdrop-blur-sm border border-white/50 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-105 group ${className}`}
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
  );
}