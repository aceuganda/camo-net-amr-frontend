"use client";

import React from "react";
import { useRouter } from "next/navigation";

function UserGuide() {
  const router = useRouter();

  return (
    <div
      style={{ backgroundImage: "url(/backgroundImageNet.webp)" }}
      className="flex justify-center items-center min-h-screen bg-gray-100 bg-no-repeat bg-cover relative bg-fixed bg-center"
    >
      <div className="bg-[#161047] absolute h-[100%] w-[30%] top-0 left-0"></div>

      <div className="w-[70%] max-w-4xl h-auto mt-[3rem] bg-white rounded-[10px] shadow-box z-10 p-6 sm:p-12 relative">
        <button
          onClick={() => router.back()}
          className="absolute top-4 left-4 px-4 py-2 text-white bg-[#00b9f1] rounded hover:bg-[#007acc]"
        >
          Back
        </button>

        <h1 className="text-2xl font-bold mt-[3rem] mb-4">User Guide</h1>
        <p className="mb-4">
          Welcome to the UGANDA CAMONET DATA PORTAL. This guide will walk you through how to access and download data available on the platform.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">Accessing Data</h2>
        <p className="mb-4">
          To access data on our platform, follow these steps:
        </p>
        <ul className="list-decimal list-inside mb-4">
          <li>
            Navigate to the <strong>Data Access</strong> tab on the main menu.
          </li>
          <li>
            Browse through the available data catalogs to find the dataset you are interested in.
          </li>
          <li>
            Click on a dataset to view its details. This will include a description of the data, its contents, and any associated metadata.
          </li>
          <li>
            If you wish to download the data, you will need to request access. Click the <strong>Request Access</strong> button.
          </li>
        </ul>

        <h2 className="text-xl font-semibold mt-6 mb-2">Requesting Data Access</h2>
        <p className="mb-4">
          Once you request access to a dataset, the Principal Investigator (PI) responsible for the data will review your request. The PI will assess the validity of your request based on the information you provide.
        </p>
        <p className="mb-4">
          If your request is approved, you will receive access to download the data in CSV format. An email notification will be sent to you once the data is available for download.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">Home Page Overview</h2>
        <p className="mb-4">
          The Home page of the UGANDA CAMONET DATA PORTAL provides an introduction to the datasets housed on the platform. You will find an overview of the data, including various metrics and visualizations such as graphs and charts that give insights into the data.
        </p>
        <p className="mb-4">
          These visuals are designed to help you understand the scope and scale of the data before you request access.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">Contact Us</h2>
        <p>
          If you have any questions or need further assistance, please feel free to contact us at <a href="mailto:ace@idi.co.ug" className="text-blue-500 hover:underline">ace@idi.co.ug</a>.
        </p>
      </div>
    </div>
  );
}

export default UserGuide;
