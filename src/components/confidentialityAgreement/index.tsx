"use client";

import React, { useState } from "react";

const ConfidentialityAgreement = ({handleAgreedCallBack}:any) => {
  const currentDate = new Date();
  const day = currentDate.getDate();
  const month = currentDate.toLocaleString('default', { month: 'long' });
  const year = currentDate.getFullYear();

  const [isChecked, setIsChecked] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const bottom = e.currentTarget.scrollHeight - e.currentTarget.scrollTop === e.currentTarget.clientHeight;
    setIsScrolled(bottom);
  };

  const handleChange = () => {
    if (isScrolled){ 
        handleAgreedCallBack(true)
        setIsChecked(!isChecked)
    };
  };

  return (
    <div className="flex flex-col justify-center items-center h-[40rem] bg-gray-100 p-6">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-3xl w-full h-[80vh] overflow-y-auto" onScroll={handleScroll}>
        <h1 className="text-2xl font-bold mb-6">Confidentiality and Non-Disclosure Agreement</h1>
        
        <p className="mb-4">
          This Agreement is entered into on  {`${day} ${month}, ${year}`} by and between the Infectious Diseases Institute (IDI), a company registered under the Personal Data Protection and Privacy Act 2019 and having its registered office at Makerere University, IDI-McKinnell Knowledge Centre P.O. Box 22418 (hereinafter referred to as “IDI”, which term, unless repugnant to the context, would include its successors in interest) of the First Part, and the person agreeing to this Agreement of the Second Part.
        </p>
        
        <p className="mb-4">
          WHEREAS, IDI represents that it now has, or may in the future obtain, certain ideas, concepts, data, or other information from their clients (Study subjects) which in whole or in part is or will be considered proprietary, in particular, but not limited to, information on the following subject(s): pre-clinical data, patient data, medical data, Laboratory data, pharmacy data, clinical trial data, clinical trial material/device/dug information (hereinafter agreed to as &ldquo;Confidential Information&ldquo;).
        </p>
        
        <p className="mb-4">
          WHEREAS, for the person agreeing to this Agreement to review the data or research information of IDI, IDI must disclose the above-mentioned Confidential Information. The information mentioned shall be inclusive and not exclusive in nature. 
        </p>
        
        <p className="mb-4">
          NOW, THEREFORE, IT IS HEREBY AGREED as follows: - 
        </p>

        <p className="mb-4">
          1. The person agreeing to this Agreement shall use Information only for the reason stated in the data request form, shall hold Information in confidence using the same degree of care as they normally exercise to protect their own proprietary information, but not less than reasonable care, taking into account the nature of the Information, and shall grant access to Information only to those who need to know the progress, but only to the extent necessary to carry out the business purpose. The person shall comply with the provisions of this Agreement, shall reproduce Information only to the extent essential to fulfilling the Purpose, and shall prevent disclosure of Information to third parties. 
        </p>
        
        <div className="mb-4">
          2. The person agrees to retain in strict confidence and not disclose to any third party the Confidential Information, which will be provided by IDI and will have access to in the course of carrying out their duties. The person will hold in strict confidence any and all Confidential Information, except:
          <ul className="list-disc list-inside ml-4">
            <li>Information which at the time of disclosure is publicly known or available;</li>
            <li>Information and data which, after disclosure, is publicly known or available by publication or otherwise, except by breach of the terms of this Agreement; </li>
            <li>Information and data which the person receives from a third party, provided, however, that such information and data were not obtained by such third party by breach of a confidentiality covenant entered into, with IDI. </li>
          </ul>
        </div>
        
        <p className="mb-4">
          3. The person undertakes not to pass on the Confidential Information or a part thereof to third parties even under a corresponding secrecy agreement and agrees to take such steps as may reasonably be necessary to prevent the disclosure of the Confidential Information in whole or in part to any third party.
        </p>
        
        <p className="mb-4">
          4. The person guarantees that any employee or representative of IDI who is given access to the Confidential Information by IDI through the person, shall also comply with the obligations that the person undertakes under this Agreement.
        </p>
        
        <p className="mb-4">
          5. The person agrees and acknowledges that any disclosure of the Confidential Information in breach of this Agreement may cause IDI irreparable harm and that any breach or threatened breach of this obligation by the person will entitle IDI to injunctive relief including liquidated damages, in addition to any other legal or equitable remedies available to it, in any court of competent jurisdiction. The person agrees to indemnify IDI against any loss, costs, damages, or expenses that may be suffered by IDI by reason of non-observance of the obligations foregoing on the part of the person. 
        </p>
        
        <p className="mb-4">
         6. Neither this Agreement nor the disclosure of the Confidential Information by IDI shall be deemed, by implication or otherwise, to vest in the person any license or other ownership rights to or under any patents, copyright, know-how, or trade secrets, it being agreed and declared that the Confidential Information and all intellectual property rights emanating therefrom shall be the sole property of IDI. 
        </p>
        
        <p className="mb-4">
          7. This Agreement constitutes the entire agreement of the parties with respect to the Parties&#39; respective obligations in connection with Information disclosed hereunder and supersedes all prior oral and written agreements and discussions with respect thereto.
        </p>
        
        <p className="mb-4">
          8. This Agreement will remain in effect for any time-period the person will be in possession of the IDI data or Confidential Information. 
        </p>
        
        <p className="mb-4">
          9. No rights or obligations other than those expressly recited herein are to be implied from this Agreement. 
        </p>
        
        <p className="mb-4">
          10. Any dispute or difference arising out of or in connection with this Agreement shall be settled by the parties hereto by mutual negotiation. Any unsettled dispute or difference shall be referred to Arbitration in accordance with the Uganda Data Protection and Privacy Act, 2019. The venue of arbitration proceedings shall be at any competent court with jurisdiction to hear this dispute. This clause does not waive IDI&#39;s right to approach the appropriate court of law having competent jurisdiction to settle/claim any dispute or claim between the parties.
        </p>
        
        <p className="mb-4">
          11. This Agreement shall be governed and construed in accordance with the laws of Uganda.
        </p>
      </div>
      
      <div className="mt-6 flex items-center justify-center">
        <input
          type="checkbox"
          id="agree"
          className="mr-2"
          disabled={!isScrolled}
          checked={isChecked}
          onChange={handleChange}
        />
        <label htmlFor="agree" className={`text-lg ${!isScrolled ? 'text-gray-400' : 'text-gray-800'}`}>
          I agree to the terms and conditions
        </label>
      </div>
    </div>
  );
};

export default ConfidentialityAgreement;
