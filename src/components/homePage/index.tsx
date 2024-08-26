"use client";

import dynamic from "next/dynamic";
import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

// Dynamically load components
const DotsLoader = dynamic(() => import("../ui/dotsLoader"), { ssr: false });
// const Chart = dynamic(() => import('../components/Chart'), { ssr: false });

export default function HomePage() {
  const { scrollY } = useScroll();
  const headerOpacity = useTransform(scrollY, [0, 700], [1, 0]);

  return (
    <main className="flex min-h-screen flex-col items-center bg-gradient-to-b from-[#F5F9FF] to-[#E1EEFF] text-[#24408E]">
      <div className="w-full flex flex-col items-center justify-center overflow-hidden">
        <motion.div
          className="relative w-full h-screen"
          style={{ opacity: headerOpacity }}
        >
          <Image
            src="/idi_building.webp"
            alt="AMR Research Collage"
            layout="fill"
            objectFit="cover"
            quality={100}
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#F5F9FF] opacity-90"></div>
          <motion.h1
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="absolute inset-0 flex items-center justify-center text-center font-bold text-6xl md:text-7xl lg:text-8xl text-[#003366] drop-shadow-lg"
          >
            AMR Data Portal, Uganda
           
          </motion.h1>
        </motion.div>

        <div className="relative w-full">
          {/* Blurred background image */}
          <div className="absolute inset-0 z-0">
            <Image
              src="/antibiotics.webp "
              alt="AMR Background"
              layout="fill"
              objectFit="cover"
              quality={100}
              className="filter blur-sm brightness-150"
            />
            <div className="absolute inset-0 bg-white bg-opacity-70"></div>
          </div>

          {/* Content */}
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            {/* Grid Layout for Content */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Introduction Section */}
              <motion.section
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="bg-white bg-opacity-90 p-6 rounded-lg shadow-lg"
              >
                <h2 className="text-3xl font-semibold mb-4 text-[#003366]">
                  Introduction
                </h2>
                <p className="text-base text-gray-700 mb-4">
                  Antimicrobial resistance (AMR) stands as one of the most
                  significant threats to global health in the 21st century. The
                  World Health Organization (WHO) has declared it a top ten
                  global public health threat facing humanity. By 2050, AMR is
                  predicted to become the leading cause of death globally, with
                  annual deaths projected to rise from 700,000 to 10 million if
                  current trends continue unchecked.
                </p>
                <p className="text-base text-gray-700">
                  In 2019, 1.27 million deaths were directly attributed to AMR,
                  surpassing mortality rates from HIV, malaria, and
                  tuberculosis. An additional 4.95 million deaths were
                  associated with AMR in the same year.
                </p>
              </motion.section>

              {/* Drivers of AMR Section */}
              <motion.section
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="bg-white bg-opacity-90 p-6 rounded-lg shadow-lg"
              >
                <h2 className="text-3xl font-semibold mb-4 text-[#003366]">
                  Drivers of AMR
                </h2>
                <p className="text-base text-gray-700 mb-4">
                  The factors contributing to the rise of AMR are complex and
                  interconnected, spanning various sectors including healthcare,
                  agriculture, and the environment. Key drivers include:
                </p>
                <ul className="list-disc list-inside text-base text-gray-700">
                  <li>Non-prescription access to antibiotics</li>
                  <li>Inadequate training of healthcare providers</li>
                  <li>Environmental contamination</li>
                  <li>Widespread use of antimicrobials in agriculture</li>
                  <li>Misuse and overuse in healthcare settings</li>
                  <li>Poor infection prevention and control</li>
                  <li>Limited access to quality medicines and diagnostics</li>
                </ul>
              </motion.section>

              {/* Consequences of AMR Section */}
              <motion.section
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="bg-white bg-opacity-90 p-6 rounded-lg shadow-lg"
              >
                <h2 className="text-3xl font-semibold mb-4 text-[#003366]">
                  Consequences of AMR
                </h2>
                <p className="text-base text-gray-700 mb-4">
                  The impacts of AMR extend far beyond individual patient
                  outcomes, affecting entire health systems and economies:
                </p>
                <h3 className="text-xl font-semibold mb-2 text-[#003366]">
                  Clinical Consequences
                </h3>
                <ul className="list-disc list-inside text-base text-gray-700 mb-4">
                  <li>Increased difficulty in treating infections</li>
                  <li>Higher rates of complications and mortality</li>
                  <li>Compromised medical procedures</li>
                </ul>
                <h3 className="text-xl font-semibold mb-2 text-[#003366]">
                  Economic Consequences
                </h3>
                <ul className="list-disc list-inside text-base text-gray-700">
                  <li>Higher healthcare costs</li>
                  <li>Productivity losses</li>
                  <li>Strain on health systems</li>
                </ul>
              </motion.section>

              {/* Our Project Section */}
              <motion.section
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="bg-white bg-opacity-90 p-6 rounded-lg shadow-lg"
              >
                <h2 className="text-3xl font-semibold mb-4 text-[#003366]">
                  Our Project
                </h2>
                <p className="text-base text-gray-700 mb-4">
                  Our project aims to develop a comprehensive AMR and
                  Antimicrobial Use and Consumption (AMUC) data warehouse for
                  Uganda, addressing critical gaps in AMR surveillance and
                  intervention strategies.
                </p>
                <h3 className="text-xl font-semibold mb-2 text-[#003366]">
                  Objectives
                </h3>
                <ul className="list-disc list-inside text-base text-gray-700 mb-4">
                  <li>Improve access to AMR and AMUC data</li>
                  <li>Analyze antibiotic prescribing patterns</li>
                  <li>Determine economic burden</li>
                  <li>Develop predictive models</li>
                </ul>
                <h3 className="text-xl font-semibold mb-2 text-[#003366]">
                  Methodology
                </h3>
                <p className="text-base text-gray-700">
                  Our approach combines data curation, machine learning-based
                  modeling, and cost-of-illness analysis, utilizing data from
                  nine regional referral hospitals in Uganda (2018-2026).
                </p>
              </motion.section>
            </div>

            {/* Placeholder for Trends Section */}
            <motion.section
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="bg-white bg-opacity-90 p-8 rounded-lg shadow-lg mt-8"
            >
              <h2 className="text-3xl font-semibold mb-4 text-[#003366]">
                AMR Trends
              </h2>
              <p className="text-base text-gray-700">Coming soon</p>
            </motion.section>

            {/* Call to Action */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.0 }}
              className="text-center py-16"
            >
              <Link href="/datasets">
                <button className="bg-[#00B9F1] text-white font-bold py-3 px-6 rounded-full hover:bg-[#0090BE] transition duration-300">
                  Explore Our Datasets
                </button>
              </Link>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full text-center py-4 text-sm text-gray-500 bg-[#003366] text-white">
        © 2024 AMR Data Portal | Cited Sources: Mayito et al, 2024. Combatting
        Antimicrobial Resistance through a Data-Driven Approach. Published in
        JMIR Preprints.
      </footer>
    </main>
  );
}
