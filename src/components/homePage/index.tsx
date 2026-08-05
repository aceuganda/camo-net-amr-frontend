"use client";
import React from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import SiteFooter from "@/components/siteFooter";
import PillMark from "./pillMark";
import DataWarehouseCorrection from "./dataWarehouseCorrection";
import { MIN_DATA_YEAR, MAX_DATA_YEAR } from "./constants";

const ResistanceChoropleth = dynamic(() => import("../resistanceChoropleth"), {
  ssr: false,
});

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center bg-white text-gray-800">
      <motion.div
        className="w-full h-[35vh] relative"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <Image
          src="/antibios.png"
          alt="Research laboratory"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="text-center text-white max-w-4xl mx-auto px-4">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
              AMRDB
              <PillMark />
            </h1>
            <p className="text-xl mb-4">
              A dedicated data portal facilitating access to antimicrobial
              resistance (AMR) data and insights to enhance public health
              initiatives.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Main content */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-4 py-12">
        <section className="mb-10 rounded-2xl border border-gray-100 bg-white px-4 py-6 shadow-sm">
          <p className="mb-6 text-center text-xs font-semibold uppercase tracking-widest text-gray-400">
            Supported &amp; Partnered By
          </p>
          <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-8 sm:gap-12">
            {/* width/height are each file's true pixel size — the rendered size
                comes from the h-10 class, and mismatched ratios here make Next
                warn about a modified dimension */}
            {[
              { src: "/logos/cnetug.webp", alt: "CAMO-Net UG", href: "https://camonet.org", width: 462, height: 168 },
              { src: "/logos/idmak.webp", alt: "IDI Makerere", href: "https://idi.mak.ac.ug", width: 2848, height: 1086 },
              { src: "/logos/ace.webp", alt: "ACE", href: "https://ace.ac.ug", width: 1051, height: 369 },
              { src: "/logos/welc.webp", alt: "Wellcome Trust", href: "https://wellcome.org", width: 262, height: 254 },
              { src: "/logos/lacuna.webp", alt: "Lacuna Fund", href: "https://lacunafund.org", width: 160, height: 60 },
              { src: "/logos/moh.webp", alt: "Ministry of Health", href: "https://www.health.go.ug", width: 448, height: 408 },
            ].map((s) => (
              <a
                key={s.src}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="opacity-70 transition-opacity duration-200 hover:opacity-100"
              >
                <Image
                  src={s.src}
                  alt={s.alt}
                  width={s.width}
                  height={s.height}
                  className="h-10 w-auto object-contain"
                />
              </a>
            ))}
          </div>
        </section>

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
              The Data Portal connects to the central antimicrobial resistance
              (AMR) related <DataWarehouseCorrection />, serving as a
              user-friendly interface for accessing the data. Users can
              request access to specific datasets, and the portal also
              provides visualizations of key trends derived from the data
              stored in the warehouse, facilitating informed decision-making
              and research.
            </p>
            <Image
              src="/data_visualization.webp"
              alt="Laboratory research"
              width={1900}
              height={1266}
              className="rounded-lg mb-4 h-auto w-full"
            />
            <Link href="/datasets">
              <button className="w-full py-2 rounded-lg bg-blue-500 text-white font-semibold hover:bg-lightblue-600 transition duration-200">
                Our Catalogue
              </button>
            </Link>
          </motion.div>

          <motion.div
            className="sm:w-[70%]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* <h2 className="text-2xl text-center font-semibold text-[#003366] mb-6">
              AMR Trends & Impact
            </h2> */}
            <div className="space-y-8">
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-xl text-center font-semibold text-[#003366] mb-2">
                  Overall pathogen-antibiotic number of resistance cases in 9
                  Regional Referral Hospitals
                </h3>
                <p className="mb-4 flex flex-wrap items-center justify-center gap-2 text-center">
                  <span className="rounded-full bg-[#24408E]/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-[#24408E]">
                    Retrospective
                  </span>
                  <span className="text-xs text-gray-500">
                    Laboratory records collected from {MIN_DATA_YEAR} to{" "}
                    {MAX_DATA_YEAR}
                  </span>
                </p>
                <ResistanceChoropleth />
              </div>

              {/* <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-xl text-center font-semibold text-[#003366] mb-4">
                  Total Resistance cases
                </h3>
                <ResistanceLineChart />
              </div> */}
            </div>
          </motion.div>

          {/* Right sidebar */}
          <motion.div
            className="lg:w-1/4 mt-8 lg:mt-0 lg:pl-8"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* <h2 className="text-2xl text-[17px] font-semibold text-[#003366] mb-4">
              About The Data
            </h2>

            <p className="text-gray-700 text-[12px] mb-4">
            Data about antimicrobial resistance (AMR), use and Economic burden data was collected from 9 regional referral hospitals (RRH) in Uganda by the Infectious Disease Institute namely: 
            Jinja Regional Referral Hospital (RRH), Gulu (RRH), Arua RRH, Lira RRH, Soroti RRH, Mbale RRH, Masaka RRH, Mbarara RRH and Kabale RRH. 
            </p> */}
            <h3 className="text-xl font-semibold text-[#003366] mb-2">
              Acknowledgments
            </h3>
            <p className="text-gray-700 text-[12px] mb-4">
              We would like to extend our heartfelt gratitude to{" "}
              <span className="font-[600]">CAMONET (Award Number: 226692/Z/22/Z)</span> for their significant
              assistance and involvement in this project. We also wish to
              express our sincere appreciation to the{" "}
              <span className="font-[600]">Fleming Fund</span> for their
              generous funding and contributions to this research. Additionally,
              we would like to thank the{" "}
              <span className="font-[600]">Ministry of Health Uganda</span> for
              their invaluable support and collaboration throughout the data
              collection process.
            </p>
            <Image
              src="/idiclinic.webp"
              alt="Capacity building"
              width={294}
              height={232}
              className="rounded-lg mb-4 h-auto max-sm:w-full"
            />

            <Link href="/datasets/access">
              <button className="w-full py-2 rounded-lg bg-blue-500 text-white font-semibold hover:bg-lightblue-600 transition duration-200">
                Request Access
              </button>
            </Link>
          </motion.div>
        </div>
      </div>

      <SiteFooter />
    </main>
  );
}
