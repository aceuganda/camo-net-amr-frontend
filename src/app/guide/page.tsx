"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import AuthShell from "@/components/auth/AuthShell";

function GuideImage({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="my-6 flex justify-center">
      <div className="relative h-64 w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm md:h-80">
        <Image
          src={src}
          alt={alt}
          className="object-contain"
          fill
          sizes="(max-width: 768px) 100vw, 800px"
        />
      </div>
    </div>
  );
}

function UserGuide() {
  return (
    <AuthShell
      title="User Guide"
      subtitle="Navigate the AMRDB portal from registration through to data access."
      backHref="/"
      backLabel="Back to home"
      backgroundClassName="bg-[#24408E]"
    >
      <div className="mx-auto max-w-3xl space-y-1 text-slate-700">
        <p className="mb-4 leading-7">
          Welcome to the amrdb web portal. This guide will help you navigate the portal from the point of registration through to data access.
        </p>

        <h2 className="mb-2 mt-8 text-xl font-semibold text-slate-900">Home Page Overview</h2>
        <p className="mb-4 leading-7">
          On this home page, you will find a few metrics and visualizations, including interactive graphs, charts, and choropleth maps that provide insights into the prevalence of AMR in different regions. These tools are designed to help you grasp the significance and scale of the data before you request access.
        </p>
        <GuideImage src="/images/homescreen.png" alt="Home Page Overview Screenshot" />

        <h2 className="mb-2 mt-8 text-xl font-semibold text-slate-900">Login or Register</h2>
        <p className="mb-4 leading-7">
          To access any features or datasets you must log in to the amrdb web portal. New users are required to register to have their account created. Returning users can simply log in with their credentials to continue with their work.
        </p>
        <Link href="/authenticate" className="mb-4 inline-block font-medium text-sky-600 hover:underline">
          login/register
        </Link>
        <GuideImage src="/images/authscreen.png" alt="Login and Registration Screenshot" />

        <h2 className="mb-2 mt-8 text-xl font-semibold text-slate-900">Accessing the data catalogue</h2>
        <ul className="mb-4 list-inside list-disc space-y-1 pl-4 leading-7">
          <li>Navigate to the catalogue tab on the top left part of the navigation bar</li>
          <li>Using the filters on the left the user may choose to view only specific categories of data or filter by study status (active, closed or on hold). This will enable the user to view the dataset of their interest.</li>
          <li>The user may export the catalogue by clicking on --EXPORT CATALOGUE-- on the right-hand side of the catalogue page</li>
          <li>Datasets can be browsed as cards for a quick visual overview, or switched to a table view for a denser, side-by-side comparison</li>
        </ul>
        <GuideImage src="/images/catalogue_cards.png" alt="Data Catalogue Card View Screenshot" />
        <GuideImage src="/images/catalogue_tables.png" alt="Data Catalogue Table View Screenshot" />

        <h2 className="mb-2 mt-8 text-xl font-semibold text-slate-900">Data Access</h2>
        <p className="mb-4 leading-7">To access data, follow these steps:</p>
        <ul className="mb-4 list-inside list-decimal space-y-1 leading-7">
          <li>Log in.</li>
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
        <GuideImage src="/images/data_access_page.png" alt="Data Access Page Screenshot" />

        <h2 className="mb-2 mt-8 text-xl font-semibold text-slate-900">Dataset Details</h2>
        <p className="mb-4 leading-7">
          The dataset details page lays out the full description, metadata, and associated study information for a dataset before you decide to request access.
        </p>
        <GuideImage src="/images/datadetails_new.png" alt="Dataset Details Screenshot" />

        <h2 className="mb-2 mt-8 text-xl font-semibold text-slate-900">Requesting Data Access</h2>
        <p className="mb-4 leading-7">
          When requesting access, you will be asked to select the specific variables you need from the dataset as part of the request form. This helps the data owner understand exactly what you intend to use.
        </p>
        <p className="mb-4 leading-7">
          Once you submit a request, the Principal Investigator (PI) of the study from which the dataset is generated will review it and assess the validity of your request based on the information you have provided.
        </p>
        <p className="mb-4 leading-7">
          Once your request is approved, an email notification will be sent to you with access to download the data in CSV format.
        </p>
        <GuideImage src="/images/datarequest.png" alt="Data Request Variable Selection Screenshot" />

        <h2 className="mb-2 mt-8 text-xl font-semibold text-slate-900">Data Dictionary</h2>
        <p className="mb-4 leading-7">
          A data dictionary is available on both the download and request forms, describing each variable in the dataset so you know exactly what each column represents before requesting or downloading it.
        </p>
        <GuideImage src="/images/data_dictionary.png" alt="Data Dictionary Screenshot" />

        <h2 className="mb-2 mt-8 text-xl font-semibold text-slate-900">Data Download</h2>
        <p className="mb-4 leading-7">
          Once granted access to the data, the Download button on the Data Access page will be activated.
        </p>
         <GuideImage src="/images/datadownload.png" alt="Data Download Screenshot" />

        <h2 className="mb-2 mt-8 text-xl font-semibold text-slate-900">Models</h2>
        <p className="mb-4 leading-7">
          The Models page lets you run trained AMR prediction models directly in the portal. Pick a model, fill in its required input variables, and submit to get an instant prediction result.
        </p>
        <GuideImage src="/images/models.png" alt="Models Page Screenshot" />

        <h2 className="mb-2 mt-8 text-xl font-semibold text-slate-900">Publications</h2>
        <p className="mb-4 leading-7">
          The Publications page lists research papers and findings drawn from AMR datasets hosted on the portal, giving you the published context behind the data.
        </p>
        <GuideImage src="/images/publications.png" alt="Publications Page Screenshot" />

        <h2 className="mb-2 mt-8 text-xl font-semibold text-slate-900">Admin User Overview</h2>
        <p className="mb-4 leading-7">
          To become an admin user, you must hold an admin role and have approved permissions to access a dataset. Once these conditions are met, you will have the ability to manage user requests for data access. This includes viewing requests under the &ldquo;Requests&ldquo; tab in the Admin section, where you can approve or deny these requests based on the information provided by the requester.
        </p>

        <h2 className="mb-2 mt-8 text-xl font-semibold text-slate-900">Contact Us</h2>
        <p className="leading-7">
          If you have any questions or need further assistance, please feel free to contact us at{" "}
          <a
            href="mailto:amrdb@idi.co.ug"
            className="font-medium text-sky-600 hover:underline"
          >
            amrdb@idi.co.ug
          </a>
          .
        </p>
      </div>
    </AuthShell>
  );
}

export default UserGuide;
