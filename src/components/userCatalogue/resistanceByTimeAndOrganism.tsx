import React, { useEffect, useState } from 'react';
import Chart from "chart.js/auto";
import { CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend } from "chart.js";
import { Line } from 'react-chartjs-2';
import dynamic from "next/dynamic";
import { useOrganismResistance } from "@/lib/hooks/useAMRTrends";
import { antibiotics } from "./constants";

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

const ResistanceByAgeLineChart: React.FC = () => {
    const [chartData, setChartData] = useState<any>({ labels: [], datasets: [] });
    const [selectedAntibiotic, setSelectedAntibiotic] = useState('');
    const [othersExamples, setOthersExamples] = useState<string[]>([]);

    const { data, isLoading, error, isSuccess } = useOrganismResistance(selectedAntibiotic || null, null, null);

    const createDatasets = React.useCallback((dataArray: any) => {
        return dataArray?.map((organism: any, index: number) => ({
            label: organism.organism,
            data: generateDataPoints(organism.data),
            borderColor: COLORS[index % COLORS.length],
            backgroundColor: `${COLORS[index % COLORS.length].replace('1)', '0.2)')}`,
            fill: false,
            tension: 0.3,
            organismData: organism.data, // Store original data for tooltip
        }));
    }, []);

    useEffect(() => {
        if (isSuccess && data) {
            const labels = generateYearLabels(data.data.data);
            const datasets = createDatasets(data.data.data);

            setChartData({ labels, datasets });

            // Extract examples for "Others" organism
            const othersData = data.data.data.find((item: any) => item.organism === 'Others');
            if (othersData && othersData.examples) {
                setOthersExamples(othersData.examples);
            } else {
                setOthersExamples([]);
            }
        }
    }, [isSuccess, data, createDatasets]);

    const handleAntibioticChange = (e:any) => {
        setSelectedAntibiotic(e.target.value);
    };

    const generateDataPoints = (entries: any) => {
        return entries.map((entry: { year: number, resistant_count: number }) => ({
            x: entry.year.toString(),
            y: entry.resistant_count,
        }));
    };

    const generateYearLabels = (dataArray: any) => {
        const uniqueYears = new Set<string>();
        dataArray.forEach((organism: any) =>
            organism.data.forEach((entry: any) => {
                uniqueYears.add(entry.year.toString());
            })
        );

        return Array.from(uniqueYears).sort((a, b) => parseInt(a) - parseInt(b));
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
                <div className='flex flex-col w-full sm:w-auto'>
                    <label className="mr-2 text-sm sm:text-base">Antibiotic</label>
                    <select
                        value={selectedAntibiotic}
                        onChange={handleAntibioticChange}
                        className="border border-gray-300 rounded p-2 w-full sm:max-w-[15rem] text-sm sm:text-base"
                    >
                        <option value="">Overall (All Antibiotics)</option>
                        {antibiotics.map((antibiotic) => (
                            <option key={antibiotic.value} value={antibiotic.value}>
                                {antibiotic.name}
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
            {othersExamples.length > 0 && (
                <div className="mb-3 p-2 bg-gray-50 border border-gray-200 rounded">
                    <p className="text-[10px] sm:text-xs text-gray-600 italic">
                        <span className="font-semibold">Note:</span> "Others" includes: {othersExamples.join(', ')}
                    </p>
                </div>
            )}
            <div className="mt-4 ">
                <Line
                    data={chartData}
                    options={{
                        plugins: {
                            tooltip: {
                                callbacks: {
                                    afterLabel: function(context: any) {
                                        const datasetIndex = context.datasetIndex;
                                        const dataIndex = context.dataIndex;
                                        const dataset = context.chart.data.datasets[datasetIndex];

                                        if (dataset.organismData && dataset.organismData[dataIndex]) {
                                            const totalTests = dataset.organismData[dataIndex].total_tests;
                                            const percentageResistant = dataset.organismData[dataIndex].percentage_resistant;
                                            return [
                                                `Total tests: ${totalTests}`,
                                                `Percentage resistant: ${percentageResistant}%`
                                            ];
                                        }
                                        return '';
                                    }
                                }
                            }
                        }
                    }}
                />
            </div>
            <p className="text-xs text-gray-500 mt-2">CLSI. Performance Standards for Antimicrobial Susceptibility Testing. 34th ed. CLSI supplement M100. Clinical and Laboratory Standards Institute; 2024.</p>
        </div>
    );
};

export default ResistanceByAgeLineChart;
