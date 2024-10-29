"use client";
import React from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link"; // Import Link for navigation

// const ResistanceLineChart = dynamic(() => import("./resistanceChart"), { ssr: false });
const ResistanceChoropleth = dynamic(() => import("../resistanceChoropleth"), { ssr: false });
const OrganismResistanceByAge = dynamic(() => import("./resistanceByAgeAndOrganisms"), { ssr: false });
const ResistanceLinesByGender = dynamic(() => import("./resistanceByGenderChart"), { ssr: false });
const OrganismResistanceByTime = dynamic(() => import("./resistanceByTimeAndOrganism"), { ssr: false });

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center bg-white text-gray-800">
      {/* Introduction */}
      <motion.div
        className="w-full h-[35vh] relative"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <Image
          src="/idi_building.webp"
          alt="Research laboratory"
          fill
          objectFit="cover"
          priority
        />
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="text-center text-white max-w-4xl mx-auto px-4">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
              CAMO-NET Uganda AMR data portal
            </h1>
            <p className="text-xl mb-4">
              A dedicated data portal for the Uganda hub, facilitating access to
              antimicrobial resistance (AMR) data and insights to enhance public
              health initiatives.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Main content */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-4 py-12">
        <div className="flex flex-col lg:flex-row">
          {/* Left sidebar */}
          <motion.div
            className="lg:w-1/4 mb-8 lg:mb-0 lg:pr-8"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-[17px] font-semibold text-[#003366] mb-4">
              About The Data Portal
            </h2>
            <p className="text-gray-700 text-[12px] mb-4">
            The Data Portal connects to the central antimicrobial resistance (ARM) related Data Warehouse, serving as a user-friendly interface for accessing the data. Users can request access to specific datasets, and the portal also provides visualizations of key trends derived from the data stored in the warehouse, facilitating informed decision-making and research.
            </p>
            <Image
              src="/hubgroup.webp"
              alt="Laboratory research"
              width={300}
              height={200}
              className="rounded-lg mb-4"
            />
            <Link href="/datasets">
              <button className="w-full py-2 rounded-lg bg-blue-500 text-white font-semibold hover:bg-lightblue-600 transition duration-200">
                Our Catalogue
              </button>
            </Link>
          </motion.div>

          {/* Center content - Map and Trends */}
          <motion.div
            className="sm:w-[70%]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl text-center font-semibold text-[#003366] mb-6">
              AMR Trends & Impact
            </h2>
            <div className="space-y-8">
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-xl text-center font-semibold text-[#003366] mb-4">
                  Over All resistance in 9 Regional Referral Hospitals
                </h3>
                <ResistanceChoropleth />
              </div>
              
              {/* <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-xl text-center font-semibold text-[#003366] mb-4">
                  Total Resistance cases
                </h3>
                <ResistanceLineChart />
              </div> */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-xl text-center font-semibold text-[#003366] mb-4">
                  Resistance Cases By Gender
                </h3>
                <ResistanceLinesByGender />
              </div>
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-xl text-center font-semibold text-[#003366] mb-4">
                  Percentage resistance of organisms as per antibiotics vs time
                </h3>
                <OrganismResistanceByTime />
              </div>
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-xl text-center font-semibold text-[#003366] mb-4">
                  Percentage resistance of organisms as per antibiotics vs age
                </h3>
                <OrganismResistanceByAge />
              </div>
              
            </div>
          </motion.div>

          {/* Right sidebar */}
          <motion.div
            className="lg:w-1/4 mt-8 lg:mt-0 lg:pl-8"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl text-[17px] font-semibold text-[#003366] mb-4">
              About The Data
            </h2>
            
            <p className="text-gray-700 text-[12px] mb-4">
            Data about antimicrobial resistance (AMR), use and Economic burden data was collected from 9 regional referral hospitals (RRH) in Uganda by the Infectious Disease Institute namely: 
            Jinja Regional Referral Hospital (RRH), Gulu (RRH), Arua RRH, Lira RRH, Soroti RRH, Mbale RRH, Masaka RRH, Mbarara RRH and Kabale RRH. 
            </p>
            <Image
              src="/capacity_build.webp"
              alt="Capacity building"
              width={300}
              height={200}
              className="rounded-lg mb-4"
            />
            
            <Link href="/datasets/access">
              <button className="w-full py-2 rounded-lg bg-blue-500 text-white font-semibold hover:bg-lightblue-600 transition duration-200">
                Request Access
              </button>
            </Link>
          </motion.div>
        </div>
      </div>

      <footer className="w-full py-6 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-600">© 2024 CAMO-Net Uganda Hub</p>
          <p className="text-sm text-gray-500 mt-2">
            A Wellcome Trust supported initiative to combat Antimicrobial Resistance
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Infectious Diseases Institute, P.O Box 22418, Kampala, Uganda
          </p>
        </div>
      </footer>
    </main>
  );
}