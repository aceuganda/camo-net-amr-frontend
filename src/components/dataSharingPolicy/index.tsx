"use client";

import React, { useState } from "react";

const DataSharingAgreement = ({ handleAgreedCallBack }: any) => {
  const currentDate = new Date();
  const day = currentDate.getDate();
  const month = currentDate.toLocaleString("default", { month: "long" });
  const year = currentDate.getFullYear();

  const [isChecked, setIsChecked] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const bottom =
      e.currentTarget.scrollHeight - e.currentTarget.scrollTop ===
      e.currentTarget.clientHeight;
    setIsScrolled(bottom);
  };

  const handleChange = () => {
      handleAgreedCallBack(true);
      setIsChecked(!isChecked);
  };

  return (
    <div className="flex flex-col justify-center items-center h-[40rem] bg-gray-100 p-6">
      <div
        className="bg-white rounded-lg shadow-lg p-8 max-w-3xl w-full h-[80vh] overflow-y-auto"
        onScroll={handleScroll}
      >
        <h1 className="text-2xl font-bold mb-6">DATA SHARING POLICY </h1>

        <p className="mb-4">
          This policy addresses the provision of IDI data to other researchers,
          institutions, and students.
        </p>
        <p className="mb-4">Principles</p>

        <p className="mb-4">
          IDI data are shared to allow new and extended use in high-quality,
          ethical research.
        </p>

        <p className="mb-4">IDI data may be shared when:</p>

        <p className="mb-4">
          1. The request is considered to have scientific merit and relevance.
        </p>

        <div className="mb-4">
          2. The integrity of on-going research at IDI is maintained and the
          interests of data subjects and IDI researchers are balanced.
        </div>

        <p className="mb-4">
          3. Use of data complies with other regulatory requirements and good
          research practice.
        </p>

        <p className="mb-4">
          4. There is no disclosure of personally identifiable data.
        </p>

        <p className="mb-4">
          5. Recipients of data agree not to pass the data on to unauthorised
          parties
        </p>

        <p className="mb-4">
          6. Recipients of data may not use the data in any way that could
          infringe the rights of the data subjects or otherwise affect them
          adversely.
        </p>

        <p className="mb-4">
          7. The researcher agrees to comply with data sharing policy.
        </p>

        <p className="mb-4">
          A condition of access to IDI data is that if any errors or degradation
          of data are found, these must be notified to the IDI data support team
          (amrdb@idi.co.ug). This will primarily be for purposes of
          improving IDI data quality
        </p>

        <p>
          1. The recipient of the data will be required to complete a data
          request form and specify a minimum dataset containing only the
          variables relevant to their specific purpose. The specific data
          required will be determined at the start of each study by completion
          of the data sharing agreement (See Appendix 1)
        </p>
        <p>
          2. All requests for data access will be sent to the respective
          Principal Investigator (PI) who will review individual requests and
          consider one of the following actions;{" "}
        </p>
        <ul>
            <li>Approve the data request. </li>
            <li>Reject the data request for a number of reasons, including but not limited to the following:  </li>
            <ol>
                <li>Expired or invalid IRB </li>
                <li>No response from the provided referee </li>
                <li>The data requested for does not align with the proposed study  </li>
                <li>Unsatisfactory reference </li>
                <li>Requester is a previous offender/violator </li>
                <li>Unsatisfactory project description </li>
                <li>Any other reasons as would be described by the PI </li>
            </ol>
        </ul>

        <p>
        3. If a request is denied, the applicant may re-apply for the data set, addressing the reasons why the initial request was denied.  
        </p>

        <h1 className="mt-[10px]">Appendix 1: AGREEMENT FOR PROVISION OF IDI DATA TO THE APPLICANT. </h1>

        <p>Read and the sign this section </p>
        <p>I have read, understood and agree to follow the principles of data sharing at the Infectious Diseases Institue (IDI) </p>
        <p>I guarantee that: - </p>
        <p>
        The data and its contents will not be passed on in whole or in part to a third party. Other intending users should apply directly through the system. 
        </p>
        <p>
        No publication of any sort, or public presentation, based on these data will be made without prior permission from IDI.  
        </p>
        <p>
        The data will not be used for any other purpose other than that for which approval was given.  
        </p>
        <p>
        The data will not be used for any other purpose other than that for which approval was given. 
        </p>
        <p>
        The findings resulting from this work will be shared with IDI.
        </p>

       <p>I will acknowledge the data source in any publication of any sort, or public presentation, based on these data, as stated on the access portal. </p> 


      </div>

      <div className="mt-6 flex items-center justify-center">
        <input
          type="checkbox"
          id="agree"
          className="mr-2"
          checked={isChecked}
          onChange={handleChange}
        />
        <label
          htmlFor="agree"
          className={`text-lg ${
            !isScrolled ? "text-gray-400" : "text-gray-800"
          }`}
        >
          I fully agree to this data sharing policy
        </label>
      </div>
    </div>
  );
};

export default DataSharingAgreement;
