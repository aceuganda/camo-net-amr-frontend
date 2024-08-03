"use client";

import React from "react";
import { useRouter } from "next/navigation";

function PrivacyPolicy() {
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

        <h1 className="text-2xl font-bold mt-[3rem] mb-4">Privacy Policy</h1>
        <p className="mb-4">
          ACE Uganda built the UGANDA CAMONET  DATA PORTAL  as a Free app. This SERVICE is provided by ACE Uganda at no cost and is intended for use as is.
        </p>
        <p className="mb-4">
          This page is used to inform visitors regarding our policies with the collection, use, and disclosure of Personal Information if anyone decided to use our Service.
        </p>
        <p className="mb-4">
          If you choose to use our Service, then you agree to the collection and use of information in relation to this policy. The Personal Information that we collect is used for providing and improving the Service. We will not use or share your information with anyone except as described in this Privacy Policy.
        </p>
        <p className="mb-4">
          The terms used in this Privacy Policy have the same meanings as in our Terms and Conditions, which are accessible at  UGANDA CAMONET  DATA PORTAL unless otherwise defined in this Privacy Policy.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">Information Collection and Use</h2>
        <p className="mb-4">
          For a better experience, while using our Service, we may require you to provide us with certain personally identifiable information, including but not limited to name, email address, phone contact. The information that we request will be retained on your device and is not collected by us in any way.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">Log Data</h2>
        <p className="mb-4">
          We want to inform you that whenever you use our Service, in the case of an error in the app we collect data and information (through third-party products) on your phone called Log Data. This Log Data may include information such as your device Internet Protocol (“IP”) address, device name, operating system version, the configuration of the app when utilizing our Service, the time and date of your use of the Service, and other statistics.
        </p>
        <h2 className="text-xl font-semibold mt-6 mb-2">Cookies</h2>
        <p className="mb-4">
        Cookies are files with a small amount of data that are commonly used as anonymous unique identifiers. These are sent to your browser from the websites that you visit and are stored on your devices internal memory. This Service does not use these “cookies” explicitly. However, the app may use third-party code and libraries that use “cookies” to collect information and improve their services. You have the option to either accept or refuse these cookies and know when a cookie is being sent to your device. If you choose to refuse our cookies, you may not be able to use some portions of this Service.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">Service Providers</h2>
        <p className="mb-4">
          We may employ third-party companies and individuals due to the following reasons:
        </p>
        <ul className="list-disc list-inside mb-4">
          <li>To facilitate our Service;</li>
          <li>To provide the Service on our behalf;</li>
          <li>To perform Service-related services; or</li>
          <li>To assist us in analyzing how our Service is used.</li>
        </ul>
        <p className="mb-4">
          We want to inform users of this Service that these third parties have access to their Personal Information. The reason is to perform the tasks assigned to them on our behalf. However, they are obligated not to disclose or use the information for any other purpose.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">Security</h2>
        <p className="mb-4">
          We value your trust in providing us your Personal Information, thus we are striving to use commercially acceptable means of protecting it. But remember that no method of transmission over the internet, or method of electronic storage is 100% secure and reliable, and we cannot guarantee its absolute security.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">Links to Other Sites</h2>
        <p className="mb-4">
          This Service may contain links to other sites. If you click on a third-party link, you will be directed to that site. Note that these external sites are not operated by us. Therefore, we strongly advise you to review the Privacy Policy of these websites. We have no control over and assume no responsibility for the content, privacy policies, or practices of any third-party sites or services.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">Changes to this Privacy Policy</h2>
        <p className="mb-4">
          The owners of this application may update our Privacy Policy from time to time. Thus, you are advised to review this page periodically for any changes. We will notify you of any changes by posting the new Privacy Policy on this page.
        </p>
        <p className="mb-4">
          This policy is effective as of 2024-01-08
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">Contact Us</h2>
        <p>
          If you have any questions or suggestions about this Privacy Policy, do not hesitate to contact us at <a href="mailto:ace@idi.co.ug" className="text-blue-500 hover:underline">ace@idi.co.ug</a>
        </p>
      </div>
    </div>
  );
}

export default PrivacyPolicy;
