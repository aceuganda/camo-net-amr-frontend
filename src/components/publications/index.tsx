"use client"

import { useState } from 'react';
import { ChevronLeftIcon, FileTextIcon, ExternalLinkIcon } from "@radix-ui/react-icons";
import Link from "next/link";
import data from "./publications.json"
import { useRouter } from "next/navigation";


export default function Publication() {
  const [currentPage, setCurrentPage] = useState(1);
  const publicationsPerPage = 10;
  const router = useRouter();

  // Calculate the index range for the current page
  const indexOfLastPublication = currentPage * publicationsPerPage;
  const indexOfFirstPublication = indexOfLastPublication - publicationsPerPage;
  const currentPublications = data.publications.slice(indexOfFirstPublication, indexOfLastPublication);

  // Handle page change
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  // Calculate total pages
  const totalPages = Math.ceil(data.publications.length / publicationsPerPage);

  return (
    <div className="background-net bg-opacity-50 min-h-[90vh] bg-no-repeat bg-cover relative bg-fixed bg-center p-6">
      
     
      <div className="flex items-center mb-6">
        <ChevronLeftIcon className="h-6 w-6 text-blue-600 mr-3 cursor-pointer" onClick={()=>{router.back()}} />
        <h1 className="text-2xl font-semibold">Publications</h1>
      </div>

      <div className="mb-6">
        <p className="text-gray-700 text-[13px] sm:text-lg">
          Here are some of the publications from the data, showcasing key research and findings in the AMR.
        </p>
      </div>

      <div className="space-y-4 mx-[1.5rem]">
        {currentPublications.map((publication) => (
          <div key={publication.id} className="border p-4 rounded-lg shadow-md bg-white hover:shadow-xl transition-shadow duration-300">
            <h3 className="text-[13px] sm:text-[16px] font-semibold text-blue-700 hover:text-blue-900 transition-colors duration-200">
              <div  className="hover:underline">
                {publication.title}
              </div>
            </h3>
            <p className="text-gray-600 sm:text-[15px] text-[11px] mt-2">Authors: {publication.authors.join(', ')}</p>
            <div className="mt-4 flex items-center space-x-3">
              {/* Paper Link with Icon */}
              <a href={publication.paperLink} target="_blank" rel="noopener noreferrer" className="flex items-center text-blue-500 hover:text-blue-700 transition-colors">
                <ExternalLinkIcon className="h-5 w-5 mr-2" />
                <span className='sm:text-[14px] text-[10px]'>Read Paper</span>
              </a>
              
            </div>
          </div>
        ))}
      </div>

     {data.publications.length > 10 && <div className="flex justify-center space-x-2 mt-6">
        <button
          onClick={() => paginate(currentPage - 1)}
          disabled={currentPage === 1}
          className="bg-blue-500 text-white p-2 rounded-md disabled:opacity-50"
        >
          Previous
        </button>
        {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
          <button
            key={pageNumber}
            onClick={() => paginate(pageNumber)}
            className={`px-3 py-2 rounded-md ${pageNumber === currentPage ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            {pageNumber}
          </button>
        ))}
        <button
          onClick={() => paginate(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="bg-blue-500 text-white p-2 rounded-md disabled:opacity-50"
        >
          Next
        </button>
      </div>}
    </div>
  );
}
