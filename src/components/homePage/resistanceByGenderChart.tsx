// src/components/ResistanceLineChart.tsx
import React, { useEffect, useState } from 'react';
import Chart from "chart.js/auto";
import { CategoryScale } from "chart.js";
import { Line } from 'react-chartjs-2';

import { useOverAllResistanceByGender } from "@/lib/hooks/useAMRTrends";
import dynamic from "next/dynamic";
const DotsLoader = dynamic(() => import("../ui/dotsLoader"), { ssr: false });

Chart.register(CategoryScale);
const ResistanceByGenderLineChart: React.FC = () => {
    const [chartData, setChartData] = useState<any>({ labels: [], datasets: [] });
    const { data, isLoading, error, isSuccess } = useOverAllResistanceByGender();

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
                        borderColor: 'rgba(255, 99, 132, 1)',
                        backgroundColor: 'rgba(255, 99, 132, 0.2)',
                        fill: false,
                    },
                    {
                        label: 'Female Resistance Cases',
                        data: femaleResistantCases,
                        borderColor: 'rgba(153, 102, 255, 1)',
                        backgroundColor: 'rgba(153, 102, 255, 0.2)',
                        fill: false,
                    }
                ]
            });
        }
    }, [isSuccess, data]);

    if (isLoading) {
        return <div className="text-center"><DotsLoader/></div>; 
    }

    if (error) {
        return <div className="text-red-500 text-center">Error: {error.message}</div>; 
    }

    return (
        <div className='w-full'>
            <Line data={chartData} />
        </div>
    );
};

export default ResistanceByGenderLineChart;