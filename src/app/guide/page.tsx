"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

function UserGuide() {
  const router = useRouter();

  return (
    <div
      style={{ backgroundImage: "url(/backgroundImageNet.webp)" }}
      className="flex justify-center items-center min-h-screen bg-gray-100 bg-no-repeat bg-cover relative bg-fixed bg-center"
    >
      <div className="bg-[#161047] absolute h-[100%] w-[30%] top-0 left-0"></div>

      <div className="w-[95%] sm:w-[70%] max-w-4xl h-auto mt-[3rem] bg-white rounded-[10px] shadow-box z-10 p-6 sm:p-12 relative mb-12">
        <button
          onClick={() => router.back()}
          className="absolute top-4 left-4 px-4 py-2 text-white bg-[#00b9f1] text-[12px] rounded hover:bg-[#007acc]"
        >
          Back
        </button>

        <h1 className="text-2xl font-bold mt-[3rem] mb-4">User Guide</h1>
        <p className="mb-4">
          Welcome to the amrdb web portal. This guide will help you navigate the portal from the point of registration through to data access.
        </p>

        <h1 className="text-2xl font-bold mt-[3rem] mb-4">Home Page Overview</h1>
        <p className="mb-4">
          On this home page, you will find a few metrics and visualizations, including interactive graphs, charts, and choropleth maps that provide insights into the prevalence of AMR in different regions. These tools are designed to help you grasp the significance and scale of the data before you request access.
        </p>
        <div className="my-6 flex justify-center">
          <div className="relative w-full max-w-2xl h-64 md:h-80">
            <Image 
              src="/images/home.png" 
              alt="Home Page Overview Screenshot"
              className="border border-gray-200 rounded shadow-md object-contain"
              fill
              sizes="(max-width: 768px) 100vw, 800px"
            />
          </div>
        </div>

        <h2 className="text-xl font-semibold mt-6 mb-2">Login or Register</h2>
        <p className="mb-4">
          To access any features or datasets you must log in to the amrdb web portal. New users are required to register to have their account created. Returning users can simply log in with their credentials to continue with their work.
        </p>
        <Link href="/authenticate" className="text-blue-600 mb-4 inline-block">
          login/register
        </Link>
        <div className="my-6 flex justify-center">
          <div className="relative w-full max-w-2xl h-64 md:h-80">
            <Image 
              src="/images/register.png" 
              alt="Login and Registration Screenshot"
              className="border border-gray-200 rounded shadow-md object-contain"
              fill
              sizes="(max-width: 768px) 100vw, 800px"
            />
          </div>
        </div>

        <h2 className="text-xl font-semibold mt-6 mb-2">Accessing the data catalogue</h2>
        <ul className="list-disc list-inside mb-4 pl-4">
          <li>Navigate to the catalogue tab on the top left part of the navigation bar</li>
          <li>Using the filters on the left the user may choose to view only specific categories of data or filter by study status (active, closed or on hold). This will enable the user to view the dataset of their interest.</li>
          <li>The user may export the catalogue by clicking on --EXPORT CATALOGUE-- on the right-hand side of the catalogue page</li>
        </ul>
        <div className="my-6 flex justify-center">
          <div className="relative w-full max-w-2xl h-64 md:h-80">
            <Image 
              src="/images/catalogue.png" 
              alt="Data Catalogue Screenshot"
              className="border border-gray-200 rounded shadow-md object-contain"
              fill
              sizes="(max-width: 768px) 100vw, 800px"
            />
          </div>
        </div>

        <h2 className="text-xl font-semibold mt-6 mb-2">Data Access</h2>
        <p className="mb-4">
          To access data, follow these steps:
        </p>
        <ul className="list-decimal list-inside mb-4">
          <li>
            Log in.
          </li>
          <li>
            Navigate to the <strong>Data Access</strong> tab on the main menu.
          </li>
          <li>
            Browse through the available data catalogs to find the dataset you
            are interested in.
          </li>
          <li>
            Click on a dataset to view its details. This will include a
            description of the data, its contents, and any associated metadata.
          </li>
          <li>
            If you wish to download the data, you will need to request access.
            Click the <strong>Request Access</strong> button.
          </li>
        </ul>
        <div className="my-6 flex justify-center">
          <div className="relative w-full max-w-2xl h-64 md:h-80">
            <Image 
              src="/images/dataaccess.png" 
              alt="Data Access Process Screenshot"
              className="border border-gray-200 rounded shadow-md object-contain"
              fill
              sizes="(max-width: 768px) 100vw, 800px"
            />
          </div>
        </div>

        <h2 className="text-xl font-semibold mt-6 mb-2">
          Requesting Data Access
        </h2>
        <p className="mb-4">
          Once you request access to a dataset, the Principal Investigator (PI) of the study from which the dataset is generated will review your request. The PI will assess the validity of your request based on the information you have provided.
        </p>
        <p className="mb-4">
          Once your request is approved, an email notification will be sent to you with access to download the data in CSV format.
        </p>
       

        <h2 className="text-xl font-semibold mt-6 mb-2">Data Download</h2>
        <p className="mb-4">
          Once granted access to the data, the Download button on the Data Access page will be activated.
        </p>

        <div className="my-6 flex justify-center">
          <div className="relative w-full max-w-2xl h-64 md:h-80">
            <Image 
              src="/images/datadetails.png" 
              alt="Data Access Request Screenshot"
              className="border border-gray-200 rounded shadow-md object-contain"
              fill
              sizes="(max-width: 768px) 100vw, 800px"
            />
          </div>
        </div>
       

        <h2 className="text-xl font-semibold mt-6 mb-2">Admin User Overview</h2>
        <p className="mb-4">
          To become an admin user, you must hold an admin role and have approved
          permissions to access a dataset. Once these conditions are met, you
          will have the ability to manage user requests for data access. This
          includes viewing requests under the &ldquo;Requests&ldquo; tab in the
          Admin section, where you can approve or deny these requests based on
          the information provided by the requester.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">Contact Us</h2>
        <p>
          If you have any questions or need further assistance, please feel free to contact us at{" "}
          <a
            href="mailto:amrportaluganda@gmail.com"
            className="text-blue-500 hover:underline"
          >
            amrportaluganda@gmail.com
          </a>
          .
        </p>
      </div>
    </div>
  );
}

export default UserGuide;