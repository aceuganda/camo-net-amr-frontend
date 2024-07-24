import { useState } from "react";
import { ChevronRightIcon, ChevronDownIcon, Cross1Icon, LayersIcon } from "@radix-ui/react-icons";

type SidebarMenuProps = {
  isMenuOpen: boolean;
  setIsMenuOpen: (open: boolean) => void;
};

const categories = [
    { name: "Economic Data", count: 1 },
    { name: "Demographic & Health", count: 3 },
    { name: "Genomic", count: 1 },
  ];
  
  const types = [
    { name: "Primary dataset", count: 4 },
    { name: "Secondary (Derived) dataset", count: 1 },
  ];

export default function SidebarMenu({  isMenuOpen, setIsMenuOpen }: SidebarMenuProps) {
  const [isCategoryOpen, setIsCategoryOpen] = useState(true);
  const [isTypeOpen, setIsTypeOpen] = useState(true);

  return (
    <div className={`transition-all h-[70vh]  duration-300 ${isMenuOpen ? "w-[30rem] px-[3rem]" : "w-16"} bg-[#F7F7F7] shadow-lg flex flex-col p-4 rounded-b-[10px] max-sm:hidden`}>
      <div className="flex items-center justify-between border-b pb-2 mb-2">
        {isMenuOpen && <span className="font-semibold">Filters</span>}
        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2">
          {isMenuOpen ? (
            <Cross1Icon className="w-6 h-6" />
          ) : (
            <LayersIcon className="w-6 h-6" />
          )}
        </button>
      </div>

      {isMenuOpen && (
        <>
          <div className="mb-4">
            <h3
              className="font-[600] text-[15px] mb-[1.5rem] flex items-center text-[#24408E] cursor-pointer"
              onClick={() => setIsCategoryOpen(!isCategoryOpen)}
            >
              {isCategoryOpen ? (
                <ChevronDownIcon className="w-6 h-6 text-[#00B9F1] mr-2" />
              ) : (
                <ChevronRightIcon className="w-6 h-6 text-[#00B9F1] mr-2" />
              )}
              CATEGORY
            </h3>
            {isCategoryOpen && (
              <ul className="pl-[2rem] text-[12px]">
                {categories.map((category, index) => (
                  <li key={index} className="flex justify-between py-1">
                    <span>{category.name}</span>
                    <span>{category.count}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="mb-4">
            <h3
              className="font-[600] text-[15px] mb-[1.5rem] flex items-center text-[#24408E] cursor-pointer"
              onClick={() => setIsTypeOpen(!isTypeOpen)}
            >
              {isTypeOpen ? (
                <ChevronDownIcon className="w-6 h-6 text-[#00B9F1] mr-2" />
              ) : (
                <ChevronRightIcon className="w-6 h-6 text-[#00B9F1] mr-2" />
              )}
              TYPE
            </h3>
            {isTypeOpen && (
              <ul className="pl-[2rem] text-[12px]">
                {types.map((type, index) => (
                  <li key={index} className="flex justify-between py-1">
                    <span>{type.name}</span>
                    <span>{type.count}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}

      {!isMenuOpen && (
        <button
          onClick={() => setIsMenuOpen(true)}
          className="p-2 border rounded mt-4 flex items-center justify-center"
        >
          <LayersIcon className="w-6 h-6" />
        </button>
      )}
    </div>
  );
}
