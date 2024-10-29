import { useState } from "react";
import { ChevronRightIcon, ChevronDownIcon, Cross1Icon, LayersIcon } from "@radix-ui/react-icons";

type SidebarMenuProps = {
  isMenuOpen: boolean;
  setIsMenuOpen: (open: boolean) => void;
  selectedCategories: string[];
  setSelectedCategories: any;
  selectedStatuses: string[];
  setSelectedStatuses: any;
};

const categories = [
  { name: "Economic burden" },
  { name: "Use" },
  { name: "Consumption" },
  { name: "Resistance" },
];

const status = [
  { name: "Active"},
  { name: "Closed" },
  { name: "On Hold" },
];

export default function SidebarMenu({
  isMenuOpen,
  setIsMenuOpen,
  selectedCategories,
  setSelectedCategories,
  selectedStatuses,
  setSelectedStatuses,
}: SidebarMenuProps) {
  const [isCategoryOpen, setIsCategoryOpen] = useState(true);
  const [isStatusOpen, setIsStatusOpen] = useState(true);

  const handleCategoryChange = (category: string) => {
    setSelectedCategories((prev:any) =>
      prev.includes(category)
        ? prev.filter((t:any) => t !== category)
        : [...prev, category]
    );
  };

  const handleTypeChange = (type: string) => {
    setSelectedStatuses((prev:any) =>
      prev.includes(type)
        ? prev.filter((t:any) => t !== type)
        : [...prev, type]
    );
  };

  return (
    <div className={`transition-all h-[70vh] duration-300 ${isMenuOpen ? "w-[30rem] px-[3rem]" : "w-16"} bg-[#F7F7F7] shadow-lg flex flex-col p-4 rounded-b-[10px] max-sm:hidden`}>
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
              <ul className="pl-[0.2rem] text-[12px]">
                {categories.map((category, index) => (
                  <li key={index} className="flex py-1 items-center">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(category.name)}
                      onChange={() => handleCategoryChange(category.name)}
                      className="mr-2"
                    />
                    <span>{category.name}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="mb-4">
            <h3
              className="font-[600] text-[15px] mb-[1.5rem] flex items-center text-[#24408E] cursor-pointer"
              onClick={() => setIsStatusOpen(!isStatusOpen)}
            >
              {isStatusOpen ? (
                <ChevronDownIcon className="w-6 h-6 text-[#00B9F1] mr-2" />
              ) : (
                <ChevronRightIcon className="w-6 h-6 text-[#00B9F1] mr-2" />
              )}
              STATUS
            </h3>
            {isStatusOpen && (
              <ul className="pl-[0.2rem] text-[12px]">
                {status.map((status, index) => (
                  <li key={index} className="flex py-1 items-center">
                    <input
                      type="checkbox"
                      checked={selectedStatuses.includes(status.name)}
                      onChange={() => handleTypeChange(status.name)}
                      className="mr-2"
                    />
                    <span>{status.name}</span>
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
