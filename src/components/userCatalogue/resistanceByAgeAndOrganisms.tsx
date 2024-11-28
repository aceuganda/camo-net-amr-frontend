import React, { useEffect, useState } from 'react';
import Chart from "chart.js/auto";
import { CategoryScale, LinearScale, BarElement, Tooltip, Legend } from "chart.js";
import { Bar } from 'react-chartjs-2';
import dynamic from "next/dynamic";
import { useOrganismResistanceByAge } from "@/lib/hooks/useAMRTrends";
import { organisms } from "./constants";

const DotsLoader = dynamic(() => import("../ui/dotsLoader"), { ssr: false });

Chart.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const COLORS = [
    'rgba(255, 99, 132, 1)',  // Red
    'rgba(54, 162, 235, 1)',  // Blue
    'rgba(75, 192, 192, 1)',  // Teal
    'rgba(255, 206, 86, 1)',  // Yellow
    'rgba(153, 102, 255, 1)', // Purple
    'rgba(255, 159, 64, 1)',  // Orange
    'rgba(99, 255, 132, 1)',  // Green
    'rgba(199, 99, 255, 1)'   // Violet
];

const ResistanceBarChart: React.FC = () => {
    const [chartData, setChartData] = useState<any>({ labels: [], datasets: [] });
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');
    const [selectedOrganism, setSelectedOrganism] = useState('ecoli'); 
    const { data, isLoading, error, isSuccess, refetch } = useOrganismResistanceByAge(selectedOrganism, startDate, endDate);

    useEffect(() => {
        if (isSuccess && data) {
            const labels = generateDateLabels(data.data.data);  // Generate age groups for X-axis
            const datasets = createDatasets(data.data.data);   // Create datasets for each antibiotic

            setChartData({ labels, datasets });
        }
    }, [isSuccess, data]);

    const handleOrganismChange = (e: any) => {
        setSelectedOrganism(e.target.value);
    };

    const handleFilterChange = () => {
        refetch();
    };

    const generateDateLabels = (dataArray: any) => {
        const ageGroupMapping: { [key: string]: number } = {
            "0-0": 0,
            "1-4": 1,
            "5-14": 5,
            "15-24": 15,
            "25-34": 25,
            "35-44": 35,
            "45-54": 45,
            "55-64": 55,
            "65-80": 65,
            ">=80": 80 
        };

        const uniqueDates = new Set<string>();   
        dataArray.forEach((antibiotic: any) =>
            antibiotic.data.forEach((entry: any) => {
                const dateLabel = entry.age_group;
                uniqueDates.add(dateLabel);
            })
        );
        return Array.from(uniqueDates).sort((a, b) => {
            return ageGroupMapping[a] - ageGroupMapping[b];
        });
    };

    const createDatasets = (dataArray: any) => {
        return dataArray?.map((antibiotic: any, index: number) => ({
            label: antibiotic.antibiotic,
            data: generateDataPoints(antibiotic.data),
            backgroundColor: COLORS[index % COLORS.length], // Bar color
        }));
    };

    const generateDataPoints = (entries: any) => {
        return entries.map((entry: { age_group: string, percentage_resistance: number }) => entry.percentage_resistance);
    };

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'start' | 'end') => {
        if (type === 'start') {
            setStartDate(e.target.value);
        } else {
            setEndDate(e.target.value);
        }
    };

    if (isLoading) {
        return <div className="text-center"><DotsLoader /></div>;
    }

    if (error) {
        return <div className="text-red-500 text-center">Error: {error.message}</div>;
    }

    return (
        <div className="p-4">
            <div className="mb-4 flex flex-col sm:flex-row gap-5">
                <div className="flex flex-col w-full sm:w-auto">
                    <label className="mr-2 text-sm sm:text-base">Start Date</label>
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => handleDateChange(e, 'start')}
                        className="border border-gray-300 rounded p-2 w-full sm:max-w-[15rem] text-sm sm:text-base"
                    />
                </div>
                <div className="flex flex-col w-full sm:w-auto">
                    <label className="mr-2 text-sm sm:text-base">End Date:</label>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => handleDateChange(e, 'end')}
                        className="border border-gray-300 rounded p-2 w-full sm:max-w-[15rem] text-sm sm:text-base"
                    />
                </div>
                <div className="flex flex-col w-full sm:w-auto">
                    <label className="mr-2 text-sm sm:text-base">Organism</label>
                    <select
                        value={selectedOrganism}
                        onChange={handleOrganismChange}
                        className="border border-gray-300 rounded p-2 w-full sm:max-w-[15rem] text-sm sm:text-base"
                    >
                        {organisms.map((organism) => (
                            <option key={organism.value} value={organism.value}>
                                {organism.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
            {data?.data?.data.length === 0 && (
                <div className="text-red-500 text-center text-sm sm:text-base">
                    No Data Available
                </div>
            )}
            <div className="mt-4">
                <Bar data={chartData} />
            </div>
        </div>
    );
};

export default ResistanceBarChart;