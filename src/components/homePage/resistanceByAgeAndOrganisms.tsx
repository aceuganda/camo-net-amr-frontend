import React, { useEffect, useState } from 'react';
import Chart from "chart.js/auto";
import { CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend } from "chart.js";
import { Line } from 'react-chartjs-2';
import dynamic from "next/dynamic";
import { useOrganismResistanceByAge } from "@/lib/hooks/useAMRTrends";
import { organisms } from "./constants";

const DotsLoader = dynamic(() => import("../ui/dotsLoader"), { ssr: false });

Chart.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

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

const ResistanceLineChart: React.FC = () => {
    const [chartData, setChartData] = useState<any>({ labels: [], datasets: [] });
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');
    const [selectedOrganism, setSelectedOrganism] = useState('ecoli'); 
    const { data, isLoading, error, isSuccess, refetch } = useOrganismResistanceByAge(selectedOrganism, startDate, endDate);

    useEffect(() => {
        if (isSuccess && data) {
            const labels = generateDateLabels(data.data.data);  // Generate dates on X-axis
            const datasets = createDatasets(data.data.data);   // Create datasets for each antibiotic

            setChartData({ labels, datasets });
        }
    }, [isSuccess, data]);
    const handleOrganismChange = (e:any) => {
        setSelectedOrganism(e.target.value);
    };

    const handleFilterChange = () => {
        refetch()
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
            borderColor: COLORS[index % COLORS.length], // Cycle through colors
            backgroundColor: `${COLORS[index % COLORS.length].replace('1)', '0.2)')}`, // Lighter fill
            fill: false,
            tension: 0.1,  // Smooth line
        }));
    };

    const generateDataPoints = (entries: any) => {
        return entries.map((entry: { age_group: string, percentage_resistance: number }) => ({
            x: entry.age_group,
            y: entry.percentage_resistance,
        }));
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
        <div>
            <div className="mb-4 flex flex-row gap-5">
                <div className='flex flex-col'>
                <label className="mr-2">Start Date</label>
                <input
                    type="date"
                    value={startDate}
                    onChange={(e) => handleDateChange(e, 'start')}
                    className="border border-gray-300 rounded p-1 max-w-[15rem]"
                />
                </div>
                <div className='flex flex-col'>
                <label className="ml-4 mr-2">End Date:</label>
                <input
                    type="date"
                    value={endDate}
                    onChange={(e) => handleDateChange(e, 'end')}
                    className="border border-gray-300 rounded p-1 max-w-[15rem]"
                />
                </div>
                <div className='flex flex-col'>
                    <label className="ml-4 mr-2">Organism</label>
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
            {data?.data?.data.length == 0  && <div className="text-red-500 text-center">No Data Available</div>}
            <Line data={chartData} />
        </div>
    );
};

export default ResistanceLineChart;
