"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

function PrivacyPolicy() {
  const router = useRouter();

  return (
    <div
      style={{ backgroundImage: "url(/backgroundImageNet.webp)" }}
      className="flex justify-center items-center min-h-screen bg-gray-100 bg-no-repeat bg-cover relative bg-fixed bg-center"
    >
      <div className="bg-[#161047] absolute h-[100%] w-[30%] top-0 left-0"></div>

      <div className="w-[95%] sm:w-[70%] max-w-4xl h-auto mt-[3rem] bg-white rounded-[10px] shadow-box z-10 p-6 sm:p-12 relative">
        <button
          onClick={() => router.back()}
          className="absolute top-4 left-4 px-4 py-2 text-white bg-[#00b9f1] rounded hover:bg-[#007acc]"
        >
          Back
        </button>

        <h1 className="text-2xl font-bold mt-[3rem] mb-4">Privacy Policy</h1>

        <p className="mb-4">
          This page is used to inform users of the platform of our policies
          about the collection, use, and disclosure of Personal Information.
        </p>
        <p className="mb-4">
          If you choose to use our Service, then you agree to the collection and
          use of information in relation to this policy. The Personal
          Information that we collect is used for providing and improving the
          Service. We will not use or share your information with anyone except
          as described in this Privacy Policy.
        </p>
        <p className="mb-4">
          The terms used in this Privacy Policy have the same meaning as in our
          Terms and Conditions, which are accessible at amrdb.idi.co.ug unless
          otherwise defined in this Privacy Policy.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">
          Information Collection and Use
        </h2>
        <p className="mb-4">
          For one to create an account on this platform, we require you to
          provide us with certain personally identifiable information, including
          your name, email address and institution.
        </p>
        <p className="mb-4">
          Furthermore, for one to request for data through this platform, we
          require one to provide us with the title, institution, project title,
          project description, name and email of institutional referee,
          Institutional Ethics Approval Number, Google Scholar link or PUBMED
          bibliography link or ORCID ID or link to a profile from similar
          databases.
        </p>
        <p className="mb-4">
          You are required to review the information you provided and update it
          every two years. To improve our platform, we also collect information
          on gender, country and age category. This information will be handled
          with the highest level of confidentiality.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">Log Data</h2>
        <p className="mb-4">
          We shall collect information (through third-party applications) on
          your device called Log Data. This Log Data may include information
          such as your device Internet Protocol (IP) address, device name,
          operating system version, the configuration of the device when
          utilizing our Service, the time and date of your use of the Service,
          and other statistics.
        </p>
        <h2 className="text-xl font-semibold mt-6 mb-2">Cookies</h2>
        <p className="mb-4">
          Our website employs cookies exclusively for secure authentication when
          accessing our services. These cookies are crucial for confirming your
          identity during login and do not monitor your browsing habits or
          gather any additional personal data. By utilizing our site, you
          consent to the use of these authentication-specific cookies. While you
          have the option to modify your browser settings to reject cookies,
          this may affect your ability to sign in and use certain features.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">Security</h2>
        <p className="mb-4">
          We value your trust in providing Personal Information and we are
          striving to use commercially acceptable means of protecting it. Please
          note that no method of transmission over the internet, or method of
          electronic storage is 100% secure and reliable, so we cannot guarantee
          absolute security.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">
          Links to Other Sites
        </h2>
        <p className="mb-4">
          This site contains links to other sites. In case you click on a
          third-party link, you will be directed to that site. Note that these
          external sites are not operated by us. Therefore, we strongly advise
          you to review the Privacy Policy of these websites. We have no control
          over and assume no responsibility for the content, privacy policies,
          or practices of any third-party sites or services.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">
          Changes to this Privacy Policy
        </h2>
        <p className="mb-4">
          We may update our Privacy Policy from time to time. Thus, you are
          advised to review this page periodically for any changes. We will
          notify you of any changes by posting the new Privacy Policy on this
          page. This policy is effective as of 2024-January-08.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">Contact Us</h2>
        <p>
          If you have any questions or suggestions about this Privacy Policy,
          contact us at{" "}
          <a
            href="mailto:amrdb@idi.co.ug"
            className="text-blue-500 hover:underline"
          >
            {/* amrportaluganda@gmail.com */}
            amrdb@idi.co.ug
          </a>
        </p>
      </div>
    </div>
  );
}

export default PrivacyPolicy;
