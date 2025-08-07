"use client"

import { useState } from 'react';
import { ChevronLeftIcon, FileTextIcon, ExternalLinkIcon, PersonIcon, CalendarIcon, ReaderIcon } from "@radix-ui/react-icons";
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
    <div className="background-net bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100 min-h-[90vh] bg-no-repeat bg-cover relative bg-fixed bg-center">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/90 via-cyan-50/90 to-blue-100/90"></div>
      
      <div className="relative z-10 p-4 sm:p-6 md:p-8">
        {/* Header Section */}
        <div className="flex items-center mb-8">
          <button 
            onClick={() => router.back()}
            className="p-2 hover:bg-white/20 rounded-lg transition-all duration-200 mr-4"
          >
            <ChevronLeftIcon className="h-6 w-6 text-[#24408E] hover:text-[#00B9F1] transition-colors" />
          </button>
          <div className="flex items-center gap-3">
            <ReaderIcon className="w-8 h-8 text-[#24408E]" />
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#24408E] bg-gradient-to-r from-[#24408E] to-[#00B9F1] bg-clip-text text-transparent">
              Publications
            </h1>
          </div>
        </div>

        <div className="mb-8 bg-white/80 backdrop-blur-sm border border-white/20 rounded-xl p-4 sm:p-6 shadow-lg">
          <p className="text-gray-700 text-sm sm:text-lg leading-relaxed">
            Discover groundbreaking research and key findings in Antimicrobial Resistance (AMR) from our comprehensive dataset collections. 
            These publications showcase the latest insights and scientific breakthroughs in the field.
          </p>
          <div className="mt-4 flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <FileTextIcon className="w-4 h-4 text-[#00B9F1]" />
              <span>{data.publications.length} Publications</span>
            </div>
          </div>
        </div>


        <div className="grid gap-6 mb-8">
          {currentPublications.map((publication, index) => (
            <div 
              key={publication.id} 
              className="group bg-white/90 backdrop-blur-sm border border-white/30 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] hover:bg-white/95 overflow-hidden"
            >
              <div className="p-6">

                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-gradient-to-r from-[#00B9F1] to-[#24408E] rounded-lg">
                      <FileTextIcon className="w-5 h-5 text-white" />
                    </div>
                    <div className="px-3 py-1 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-full text-xs font-medium text-[#24408E]">
                      Publication #{indexOfFirstPublication + index + 1}
                    </div>
                  </div>
                </div>


                <h3 className="text-base sm:text-lg font-bold text-[#24408E] group-hover:text-[#00B9F1] transition-colors duration-200 leading-tight mb-4 line-clamp-3">
                  {publication.title}
                </h3>

                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <PersonIcon className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-600">Authors:</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {publication.authors.map((author, idx) => (
                      <span 
                        key={idx}
                        className="px-2 py-0.5 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-full text-[10px] sm:text-xs font-medium"
                      >
                        {author}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200/50">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <CalendarIcon className="w-3 h-3" />
                    <span>Research Publication</span>
                  </div>
                  
                  <a 
                    href={publication.paperLink} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="group/link flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#00B9F1] to-[#24408E] text-white rounded-lg hover:shadow-lg transition-all duration-200 text-sm font-medium hover:scale-105"
                  >
                    <ExternalLinkIcon className="w-4 h-4 group-hover/link:rotate-12 transition-transform duration-200" />
                    <span>Read Paper</span>
                  </a>
                </div>
              </div>
              
              {/* Gradient Border Effect */}
              <div className="h-1 bg-gradient-to-r from-[#00B9F1] via-[#24408E] to-[#00B9F1] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
          ))}
        </div>

        {data.publications.length > 10 && (
          <div className="flex justify-center items-center gap-2 mt-8">
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm border border-white/30 text-[#24408E] rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/90 hover:shadow-lg transition-all duration-200 font-medium"
            >
              <ChevronLeftIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Previous</span>
            </button>
            
            <div className="flex gap-1 px-2">
              {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
                <button
                  key={pageNumber}
                  onClick={() => paginate(pageNumber)}
                  className={`px-3 py-2 rounded-lg transition-all duration-200 font-medium ${
                    pageNumber === currentPage 
                      ? 'bg-gradient-to-r from-[#00B9F1] to-[#24408E] text-white shadow-lg transform scale-110' 
                      : 'bg-white/60 backdrop-blur-sm border border-white/30 text-[#24408E] hover:bg-white/80 hover:shadow-md hover:scale-105'
                  }`}
                >
                  {pageNumber}
                </button>
              ))}
            </div>
            
            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm border border-white/30 text-[#24408E] rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/90 hover:shadow-lg transition-all duration-200 font-medium"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronLeftIcon className="w-4 h-4 rotate-180" />
            </button>
          </div>
        )}

        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-4 px-6 py-3 bg-white/60 backdrop-blur-sm border border-white/30 rounded-xl">
            <div className="text-sm text-gray-600">
              Showing <span className="font-semibold text-[#24408E]">{indexOfFirstPublication + 1}</span> to{' '}
              <span className="font-semibold text-[#24408E]">{Math.min(indexOfLastPublication, data.publications.length)}</span> of{' '}
              <span className="font-semibold text-[#24408E]">{data.publications.length}</span> publications
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}