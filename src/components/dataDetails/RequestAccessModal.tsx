import { useState } from "react";
import { Cross2Icon, MagnifyingGlassIcon } from "@radix-ui/react-icons";
import ConfidentialityAgreement from "../confidentialityAgreement";
import dynamic from "next/dynamic";

import FoldersIcon from "../../../public/svgs/folders.svg";

const DotsLoader = dynamic(() => import("../ui/dotsLoader"), { ssr: false });

interface RequestAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  formValues: any;
  selectedVariables: string[];
  dictionaryData: any;
  dictionaryDataLoading: boolean;
  dictionaryDataError: any;
  dictionarySuccess: boolean;
  requestPending: boolean;
  onInputChange: (e: any) => void;
  onCheckboxChange: (variable: string) => void;
  onSelectAll: (e: any) => void;
  onDeselectAll: (e: any) => void;
  onSubmit: (e: any) => void;
}

interface VariableInfo {
  type: string;
  description: string;
}

export default function RequestAccessModal({
  isOpen,
  onClose,
  formValues,
  selectedVariables,
  dictionaryData,
  dictionaryDataLoading,
  dictionaryDataError,
  dictionarySuccess,
  requestPending,
  onInputChange,
  onCheckboxChange,
  onSelectAll,
  onDeselectAll,
  onSubmit,
}: RequestAccessModalProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredVariables = dictionaryData?.data?.data
    ? Object.entries(dictionaryData.data.data as Record<string, VariableInfo>).filter(
        ([key, value]) =>
          key.toLowerCase().includes(searchTerm.toLowerCase()) ||
          value.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
          value.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">

      <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm" onClick={onClose} />
      
      <div className="absolute inset-y-0 right-0 w-full sm:w-[90%] md:w-[80%] lg:w-[70%] xl:w-[60%] bg-white shadow-2xl transform transition-transform duration-300 ease-in-out overflow-y-auto">
        <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-gray-200 p-6 z-10">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-[#24408E] bg-gradient-to-r from-[#24408E] to-[#00B9F1] bg-clip-text text-transparent">
              Request Access
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Cross2Icon className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <form onSubmit={onSubmit}>
            <div className="space-y-6">

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Institution / Organization <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="institution"
                    value={formValues.institution}
                    onChange={onInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00B9F1] focus:border-transparent"
                    placeholder="Enter institution"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title/Position <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formValues.title}
                    onChange={onInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00B9F1] focus:border-transparent"
                    placeholder="Enter title"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Referee Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="referee_name"
                    value={formValues.referee_name}
                    onChange={onInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00B9F1] focus:border-transparent"
                    placeholder="Enter referee name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Referee Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="referee_email"
                    value={formValues.referee_email}
                    onChange={onInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00B9F1] focus:border-transparent"
                    placeholder="Enter referee email"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="category"
                    value={formValues.category}
                    onChange={onInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00B9F1] focus:border-transparent"
                    required
                  >
                    <option value="" disabled>
                      Select your category
                    </option>
                    <option value="student">Student</option>
                    <option value="researcher">Researcher</option>
                    <option value="developer">Data scientist</option>
                    <option value="other">Other</option>
                  </select>
                  {formValues.category === "other" && (
                    <div className="mt-2">
                      <input
                        type="text"
                        name="otherCategory"
                        value={formValues.otherCategory}
                        onChange={onInputChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00B9F1] focus:border-transparent"
                        placeholder="Please specify your category"
                        required
                      />
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="project_title"
                  value={formValues.project_title}
                  onChange={onInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00B9F1] focus:border-transparent"
                  placeholder="Enter project title"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Description/Abstract <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="project_description"
                  value={formValues.project_description}
                  onChange={onInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00B9F1] focus:border-transparent h-32 resize-vertical"
                  placeholder="Enter project description"
                  required
                />
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-xl p-6">
                <h3 className="text-xl font-bold text-[#24408E] mb-4 flex items-center gap-2">
                  <span className="p-2 bg-gradient-to-r from-[#00B9F1] to-[#24408E] rounded-lg">
                    <FoldersIcon className="w-5 h-5 text-white" />
                  </span>
                  Select Variables to Download
                </h3>

                {dictionarySuccess && dictionaryData?.data?.data && (
                  <div className="flex flex-wrap gap-3 mb-4">
                    <button
                      type="button"
                      onClick={onSelectAll}
                      className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 text-sm font-medium"
                    >
                      Select All ({Object.keys(dictionaryData.data.data).length})
                    </button>
                    <button
                      type="button"
                      onClick={onDeselectAll}
                      className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 text-sm font-medium"
                    >
                      Deselect All
                    </button>
                    <div className="flex items-center px-3 py-2 bg-white rounded-lg border border-gray-200">
                      <span className="text-sm text-gray-600">
                        Selected: <span className="font-semibold text-[#24408E]">{selectedVariables.length}</span>
                      </span>
                    </div>
                  </div>
                )}

                <div className="relative mb-4">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MagnifyingGlassIcon className="w-4 h-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search variables by name, type, or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00B9F1] focus:border-transparent bg-white"
                  />
                  {searchTerm && (
                    <button
                      type="button"
                      onClick={() => setSearchTerm("")}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      <Cross2Icon className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {searchTerm && (
                  <div className="mb-4 p-3 bg-blue-100 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-700">
                      Found <span className="font-semibold">{filteredVariables.length}</span> variables matching  {searchTerm}
                    </p>
                  </div>
                )}

                <div className="max-h-96 overflow-y-auto">
                  {dictionaryDataLoading && (
                    <div className="flex justify-center items-center py-12">
                      <DotsLoader />
                    </div>
                  )}

                  {dictionaryDataError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <p className="text-red-600 text-center">
                        Failed to fetch data dictionary. Please refresh the page.
                      </p>
                    </div>
                  )}

                  {searchTerm && filteredVariables.length === 0 && dictionarySuccess && (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                      <p className="text-gray-600">No variables found matching your search.</p>
                    </div>
                  )}

                  {dictionarySuccess && filteredVariables.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {filteredVariables.map(([key, value]) => (
                        <div
                          key={key}
                          className={`border-2 rounded-lg p-3 cursor-pointer transition-all duration-200 ${
                            selectedVariables.includes(key)
                              ? "border-[#00B9F1] bg-blue-50"
                              : "border-gray-200 bg-white hover:border-gray-300"
                          }`}
                          onClick={() => onCheckboxChange(key)}
                        >
                          <div className="flex items-start gap-3">
                            <input
                              type="checkbox"
                              id={key}
                              checked={selectedVariables.includes(key)}
                              onChange={() => onCheckboxChange(key)}
                              className="mt-1 rounded border-gray-300 text-[#00B9F1] focus:ring-[#00B9F1]"
                            />
                            <div className="flex-1 min-w-0">
                              <label htmlFor={key} className="font-medium text-[#24408E] text-sm cursor-pointer truncate block" title={key}>
                                {key}
                              </label>
                              <div className="mt-1">
                                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                                  {value?.type}
                                </span>
                              </div>
                              <p className="text-gray-600 text-xs mt-2 line-clamp-2" title={String(value?.description)}>
                                {String(value?.description)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <ConfidentialityAgreement
                handleAgreedCallBack={(agreed: boolean) => {
                  if (agreed) {
                    onInputChange({
                      target: {
                        name: "agreed_to_privacy",
                        type: "checkbox",
                        checked: true,
                      },
                    });
                  }
                }}
              />

              <div className="sticky bottom-0 bg-white/95 backdrop-blur-sm border-t border-gray-200 pt-6 mt-6">
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-[#00B9F1] to-[#24408E] text-white py-4 rounded-lg hover:shadow-lg transition-all duration-200 text-lg font-semibold"
                  disabled={requestPending}
                >
                  {requestPending ? <DotsLoader /> : "Submit Request"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}