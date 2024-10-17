"use client";
import React from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";


const ResistanceLineChart = dynamic(() => import("./resistanceChart"), {
  ssr: false,
});
const ResistanceChoropleth = dynamic(() => import("../resistanceChoropleth"), {
  ssr: false,
});
const OrganismResistanceLines = dynamic(
  () => import("./resistanceByOrganismChart"),
  {
    ssr: false,
  }
);
const ResistanceLinesByGender = dynamic(
  () => import("./resistanceByGenderChart"),
  {
    ssr: false,
  }
);
const ResistanceLinesByAge = dynamic(
  () => import("./resistanceByAgeAndOrganism"),
  {
    ssr: false,
  }
);

const objectivesData = [
  {
    title: "Objective 1",
    description:
      "To harness the power of data through strategic studies to generate new knowledge related to optimizing antimicrobial use.",
    image: "/data_analysis.webp",
  },
  {
    title: "Objective 2",
    description:
      "To implement co-produced, contextually fit, and sustainable solutions targeting innovation, systems, and behaviors.",
    image: "/produced_solutions.webp",
  },
  {
    title: "Objective 3",
    description:
      "To evaluate interventions and strategies targeting optimized antimicrobial use through intersectional approaches.",
    image: "/intersectional_approach.webp",
  },
];

const themesData = [
  {
    title: "Technology and Innovation",
    description: "Utilizing AI for clinical decision support and diagnostics.",
    image: "/ai.webp",
  },
  {
    title: "Context, Culture, and Behaviours",
    description:
      "Focusing on organizational behavior change and health-seeking behaviors.",
    image: "/nurses.webp",
  },
  {
    title: "Medicines Management",
    description:
      "Addressing supply chains, prescribing systems, and quality assurance.",
    image: "/antibiotics.webp",
  },
];

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
          src="/idi_building.webp"
          alt="Research laboratory"
          fill
          objectFit="cover"
          priority
        />
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="text-center text-white max-w-4xl mx-auto px-4">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
              CAMO-Net Uganda Hub
            </h1>
            <p className="text-xl mb-4">
              A dedicated data portal for the Uganda hub, facilitating access to
              antimicrobial resistance (AMR) data and insights to enhance public
              health initiatives.
            </p>
          </div>
        </div>
      </motion.div>

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.section
          className="mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h2 className="text-2xl font-semibold text-[#003366] mb-4">
                About CAMO-Net Uganda
              </h2>
              <p className="text-gray-700 mb-4">
                The Infectious Diseases Institute (IDI) at Makerere University
                serves as the center for the CAMO-Net Uganda Hub. Our mission is
                to complement and enhance the existing ecosystem of global
                programmes designed to alleviate the global burden of
                antimicrobial resistance (AMR) and poorly treated infections.
              </p>
              <p className="text-gray-700 mb-4">
                Through a collaborative approach spanning April 2023 to March
                2026, we target health workers, researchers, policymakers, and
                innovators to create sustainable solutions for optimizing
                antimicrobial use in humans.
              </p>
              <p className="text-gray-700">
                A key component of our initiative is the development of a
                comprehensive data warehouse for AMR in Uganda. This data
                warehouse will facilitate the collection, storage, and analysis
                of AMR data, enabling informed decision making and
                implementation effective interventions. By harnessing
                data-driven insights, we aim to strengthen the response to AMR
                and improve health outcomes across the country.
              </p>
            </div>
            <div className="relative h-[450px]">
              <Image
                src="/hubgroup.webp"
                alt="Laboratory research"
                fill
                style={{ objectFit: "cover" }}
                className="rounded-lg"
              />
            </div>
          </div>
        </motion.section>

        {/* Objectives Section */}
        <motion.section
          className="mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-2xl font-semibold text-[#003366] mb-6 text-start">
            Objectives
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Objective Cards */}
            {objectivesData.map((objective, index) => (
              <div
                key={index}
                className="relative bg-cover bg-center h-[200px] rounded-lg shadow-md overflow-hidden transition-transform duration-300 transform hover:scale-105"
                style={{ backgroundImage: `url(${objective.image})` }}
              >
                <div className="absolute inset-0 bg-black bg-opacity-70 flex flex-col justify-center items-center p-4">
                  <h3 className="text-xl font-semibold text-white mb-2 text-center">
                    {objective.title}
                  </h3>
                  <p className="text-gray-200 text-center">
                    {objective.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.section>
        <motion.section
          className="mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-2xl font-semibold text-[#003366] mb-6 text-start">
            Key Research Themes
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {themesData.map((theme, index) => (
              <div
                key={index}
                className="relative bg-cover bg-center h-[200px] rounded-lg shadow-md overflow-hidden transition-transform duration-300 transform hover:scale-105"
                style={{ backgroundImage: `url(${theme.image})` }}
              >
                <div className="absolute inset-0 bg-black bg-opacity-70 flex flex-col justify-center items-center p-4">
                  <h4 className="text-lg font-semibold text-white mb-2 text-center">
                    {theme.title}
                  </h4>
                  <p className="text-gray-200 text-center">
                    {theme.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        <motion.section
          className="mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="relative h-[330px]">
              <Image
                src="/capacity_build.webp"
                alt="Laboratory research"
                fill
                style={{ objectFit: "cover" }}
                className="rounded-lg"
              />
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <h2 className="text-2xl font-semibold text-[#003366] mb-4">
                Capacity Building
              </h2>
              <h3 className="text-xl font-semibold text-[#003366] mb-4">
                Strengthening Skills and Knowledge
              </h3>
              <p className="text-gray-700 mb-4">
                Our capacity-building initiatives aim to enhance the skills and
                knowledge of health workers, researchers, and policymakers.
                Through tailored training programs, workshops, and mentorship,
                we empower individuals and institutions to effectively combat
                antimicrobial resistance.
              </p>
              <p className="text-gray-700">
                We focus on fostering a collaborative environment that
                encourages the sharing of best practices and innovative
                solutions, ensuring that all stakeholders are equipped to
                address the challenges posed by AMR.
              </p>
            </div>
          </div>
        </motion.section>

        {/* Research Projects Section */}
        <motion.section
          className="mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-2xl font-semibold text-[#003366] mb-6">
            Research Projects
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Project 1",
                description:
                  "Investigating the patterns and trends in antibiotic prescribing among People Living with HIV (PLWH) enrolled in routine cohorts at the Infectious Diseases Institute Clinics, Kampala, Uganda",
                image: "/idiclinic.webp",
              },
              {
                title: "Project 2",
                description:
                  "Innovative approaches to optimise antibiotic therapy in the context of HIV, and related co-morbidity and polypharmacy in an outpatient HIV clinic in Uganda",
                image: "/project2.webp",
              },
              {
                title: "Project 3",
                description:
                  "Combatting Antimicrobial Resistance in Uganda: A Data-Driven Approach to Optimize Antibiotic Use and Improve Patient Outcomes",
                image: "/data_visualization.webp",
              },
            ].map((project, index) => (
              <div
                key={index}
                className="bg-gray-50 p-6 rounded-lg flex flex-col"
              >
                <div className="relative h-[200px] mb-4">
                  <Image
                    src={project.image}
                    alt={`${project.title} visualization`}
                    fill
                    style={{ objectFit: "cover" }}
                    className="rounded-lg"
                  />
                </div>
                <h3 className="text-xl font-semibold text-[#003366] mb-2">
                  {project.title}
                </h3>
                <p className="text-gray-700 flex-grow">{project.description}</p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Data Visualization Section */}
        <motion.section
          className="mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-2xl font-semibold text-[#003366] mb-6">
            AMR Trends & Impact
          </h2>
          <div className="space-y-8">
            <div className="flex sm:flex-row flex-col gap-2 justify-between bg-[#ffffff] p-2 rounded-lg">
              <div className="p-6 rounded-lg w-[100%]">
                <h3 className="text-xl font-semibold text-[#003366] mb-4">
                  Total Resistance cases
                </h3>
                <ResistanceLineChart />
              </div>
              <div className="p-6 rounded-lg w-[100%]">
                <h3 className="text-xl font-semibold text-[#003366] mb-4">
                  Resistance Cases By Gender
                </h3>
                <ResistanceLinesByGender />
              </div>
            </div>
            <div className="flex sm:flex-row flex-col justify-between bg-[#ffffff] p-2 rounded-lg">
              <div className="bg-gray-50 p-6">
                <h3 className="text-xl font-semibold text-[#003366] mb-4">
                  Percentage resistance of Organisms as per antibiotics vs age
                </h3>
                <OrganismResistanceLines />
              </div>
              <div className="bg-gray-50 p-6">
                <h3 className="text-xl font-semibold text-[#003366] mb-4">
                  Percentage resistance of organisms as per antibiotics vs time
                </h3>
                <ResistanceLinesByAge />
              </div>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-[#003366] mb-4">
                Regional Distribution of AMR
              </h3>
              <ResistanceChoropleth />
            </div>
          </div>
        </motion.section>
      </div>

      <footer className="w-full py-6 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-600">© 2024 CAMO-Net Uganda Hub</p>
          <p className="text-sm text-gray-500 mt-2">
            A Wellcome Trust supported initiative to combat Antimicrobial
            Resistance
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Infectious Diseases Institute, McKinnell Knowledge Centre, Makerere
            University, P.O Box 22418, Kampala, Uganda
          </p>
        </div>
      </footer>
    </main>
  );
}
