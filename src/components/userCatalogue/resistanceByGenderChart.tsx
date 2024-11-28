// src/components/ResistanceBarChart.tsx
import React, { useEffect, useState } from 'react';
import Chart from "chart.js/auto";
import { CategoryScale } from "chart.js";
import { Bar } from 'react-chartjs-2'; // Import Bar instead of Line

import { useOverAllResistanceByGender } from "@/lib/hooks/useAMRTrends";
import dynamic from "next/dynamic";
const DotsLoader = dynamic(() => import("../ui/dotsLoader"), { ssr: false });
import { organisms } from "./constants";

Chart.register(CategoryScale);

const ResistanceByGenderBarChart: React.FC = () => {
    const [chartData, setChartData] = useState<any>({ labels: [], datasets: [] });
    const [selectedOrganism, setSelectedOrganism] = useState('ecoli'); 
    const { data, isLoading, error, isSuccess } = useOverAllResistanceByGender(selectedOrganism);

    const handleOrganismChange = (e: any) => {
        setSelectedOrganism(e.target.value);
    };

    useEffect(() => {
        if (isSuccess && data) {
            const years = data?.data?.data?.map((item: { year: number }) => item.year);
            const femaleResistantCases = data?.data?.data.map((item: { female_resistance: number }) => item.female_resistance);
            const maleResistantCases = data?.data?.data.map((item: { male_resistance: number }) => item.male_resistance);

            setChartData({
                labels: years,
                datasets: [
                    {
                        label: 'Male Resistance Cases',
                        data: maleResistantCases,
                        backgroundColor: 'rgba(255, 99, 132, 0.6)', 
                    },
                    {
                        label: 'Female Resistance Cases',
                        data: femaleResistantCases,
                        backgroundColor: 'rgba(153, 102, 255, 0.6)', 
                    }
                ]
            });
        }
    }, [isSuccess, data]);

    if (isLoading) {
        return <div className="text-center"><DotsLoader /></div>;
    }

    if (error) {
        return <div className="text-red-500 text-center">Error: {error.message}</div>;
    }

    return (
        <div className='w-full'>
             <div className="mb-4 flex flex-row gap-5">
                <div className='flex flex-col max-sm:text-[10px] '>
                    <label className="ml-4 mr-2 ">Organism</label>
                    <select
                        value={selectedOrganism}
                        onChange={handleOrganismChange}
                        className="border border-gray-300 rounded p-1 max-w-[15rem]"
                    >
                        {organisms.map((organism) => (
                            <option key={organism.value} value={organism.value}>
                                {organism.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
            {data?.data?.data.length === 0 && <div className="text-red-500 text-center">No Data Available</div>}
            <Bar data={chartData} /> 
        </div>
    );
};

export default ResistanceByGenderBarChart;
