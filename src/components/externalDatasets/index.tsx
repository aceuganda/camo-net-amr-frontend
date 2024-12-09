"use client";
import React, { useState, useEffect, FormEvent } from "react";
import { ChevronLeftIcon,HeartFilledIcon } from "@radix-ui/react-icons";
import { useGetExternalDatasets, submitExternalDataset } from "@/lib/hooks/useExternalDatasets";
import dynamic from "next/dynamic";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";


import { toast } from "sonner";
const DotsLoader = dynamic(() => import("../ui/dotsLoader"), { ssr: false });

const ContributeDataset: React.FC = () => {
    const router = useRouter();
 const initialState = {
    name: "",
    category: "",
    type: "",
    size: "",
    countries: "",
    project_status: "",
    title: "",
    thematic_area: "",
    study_design: "",
    data_format: "",
    source: "",
    start_date: "",
    end_date: "",
    protocol_id: "",
    country_protocol_id: "",
    on_hold_reason: "",
    data_collection_methods: "",
    entries_count: "",
    citation_info: "",
    project_type: "",
    main_project_name: "",
    data_capture_method: "",
    amr_category: "",
    acronym: "",
    description: "",
  }
  const [formData, setFormData] = useState({...initialState});
  const {
    data: submittedData,
    isSuccess: submittedSuccess,
    error: submittedError,
    isPending: submittedPending,
    mutate: submittedFn,
    
  } = useMutation({
    mutationFn: submitExternalDataset,
  });
  const { data:extDs, isLoading:extDsLoading, error:extDsError, isSuccess, refetch } = useGetExternalDatasets();
  var datasets: any[] = extDs?.data || [];
  var datasets = datasets.map(({ id, ...dataset }) => dataset);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };
  const validateForm = () => {
    // Check if any field is empty
    for (let field in formData) {
    // @ts-ignore
      if (!formData[field]) {
        toast.error(`Please fill in the ${field.replace(/_/g, " ").toUpperCase()}`);
        return false;
      }
    }
    return true;
  };


  const [selectedDataset, setSelectedDataset] = useState<any | null>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
        const data = formData
        submittedFn(data)
    }
  };

  useEffect(() => {
     if(submittedSuccess){
        toast.message('Dataset submitted successfully')
        setFormData({...initialState})
        refetch()
     }
  }, [submittedData]);

  return (
    <div className="min-h-screen bg-gray-100 flex">
      
        <div className="bg-gray-100 w-full md:w-1/4 p-4 border-r max-sm:hidden">
          
          <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
            <ChevronLeftIcon onClick={()=>{router.back()}} className="w-5 h-5 mr-2" />
            Previously Submitted Datasets
          </h2>
           {extDsLoading && <DotsLoader/>}
           {extDsError && <p className="text-gray-600">Failed to load  previous datasets</p>}
          {isSuccess && datasets.length === 0 && (
            <p className="text-gray-600">No previous datasets.</p>)}
          
           {datasets && <ul>
              {datasets.map((dataset,index) => (
                 <li
                 key={index}
                 className="p-3 border border-gray-300 mb-[1px] rounded-md hover:bg-gray-50 cursor-pointer"
                 onClick={() => setSelectedDataset(dataset)}
               >
                 <p className="font-semibold text-gray-700">{dataset.name}</p>
                 <p className="text-sm text-gray-600">Category: {dataset.category}</p>
               </li>
              ))}
            </ul>}
          
        </div>
     
      <div className="w-full sm:w-3/4 bg-white shadow-md rounded-lg p-6 ml-4">
        {selectedDataset ? (
          <>
            <button
              onClick={() => setSelectedDataset(null)}
              className="bg-blue-500 text-white py-1 px-4 rounded-md mb-6 hover:bg-blue-600"
            >
              Submit new dataset
            </button>
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-2xl font-bold text-gray-800 mr-[5rem]">{selectedDataset.name}</h1>
              <div>
                {selectedDataset.approval_status === "attained" ? (
                  <p className="text-green-600 font-semibold">
                    Approved. We will reach out for more collaboration!
                  </p>
                ) : selectedDataset.approval_status === "pending_review" ? 
                (
                    <p className="text-yellow-600 font-semibold">Pending review</p>
                  ):
                (
                  <p className="text-red-600 font-semibold">Rejected. Please try again.</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(selectedDataset).map(([key, value], index) => (
                <div key={index} className="text-gray-600">
                  <strong>
                    {key
                      .replace(/_/g, " ")
                      .replace(/\b\w/g, (l) => l.toUpperCase())}
                    :
                  </strong>{" "}
                  {value !== undefined && value !== null
                    ? String(value)
                    : "N/A"}
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="bg-gray-100 shadow-md rounded-lg w-full max-w-4xl p-6">
              <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                Contribute New Dataset
              </h1>

              <p className=" text-gray-800 mb-6 text-center">
                Please fill in the following information about the dataset
              </p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.keys(formData).map((field, index) => (
                    <div key={index}>
                      <label className="block text-sm font-medium text-gray-700 capitalize">
                        {field.replace("_", " ")}
                      </label>
                      {field === "on_hold_reason" ||
                      field === "data_collection_methods" ||
                      field === "citation_info" ||
                      field === "description" ? (
                        <textarea
                          name={field}
                          value={(formData as any)[field]}
                          onChange={handleChange}
                          className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        ></textarea>
                      ): field === "countries" ?
                      <input
                          type="text"
                          name={field}
                          placeholder="Uganda, Kenya.."
                          value={(formData as any)[field]}
                          onChange={handleChange}
                          className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        /> 
                        
                      : field === "project_status" ? (
                        <div>
                          
                          <select
                            name={"project_status"}
                            value={formData.project_status}
                            onChange={(e) => setFormData({ ...formData, project_status: e.target.value })}
                            className="mt-1 p-2 border rounded-md w-full"
                          >
                            <option value="">Select Project Status</option>
                            <option value="Active">Active</option>
                            <option value="Closed">Closed</option>
                            <option value="On Hold">On Hold</option>
                          </select>
                        </div>
                      ) :
                      
                      field === "start_date" || field === "end_date" ? (
                        <input
                          type="date"
                          name={field}
                          value={(formData as any)[field]}
                          onChange={handleChange}
                          className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        />
                      ) : (
                        <input
                          type="text"
                          name={field}
                          value={(formData as any)[field]}
                          onChange={handleChange}
                          className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        />
                      )}
                    </div>
                  ))}
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  {submittedPending?<DotsLoader/> : "Submit"}
                </button>
              </form>
            </div>{" "}
          </>
        )}
      </div>
    </div>
  );
};

export default ContributeDataset;
