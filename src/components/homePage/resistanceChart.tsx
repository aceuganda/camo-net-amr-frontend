// src/components/ResistanceLineChart.tsx
import React, { useEffect, useState } from 'react';
import Chart from "chart.js/auto";
import { CategoryScale } from "chart.js";
import { Line } from 'react-chartjs-2';

import { useOverAllResistance } from "@/lib/hooks/useAMRTrends";
import dynamic from "next/dynamic";
const DotsLoader = dynamic(() => import("../ui/dotsLoader"), { ssr: false });

Chart.register(CategoryScale);
const ResistanceLineChart: React.FC = () => {
    const [chartData, setChartData] = useState<any>({ labels: [], datasets: [] });
    const { data, isLoading, error, isSuccess } = useOverAllResistance();

    useEffect(() => {
        if (isSuccess && data) {
            const years = data?.data?.data?.map((item: { year: number }) => item.year);
            const resistantCases = data?.data?.data.map((item: { resistant_cases: number }) => item.resistant_cases);

            setChartData({
                labels: years,
                datasets: [
                    {
                        label: 'Resistance Cases',
                        data: resistantCases,
                        borderColor: 'rgba(255, 99, 132, 1)',
                        backgroundColor: 'rgba(255, 99, 132, 0.2)',
                        fill: true,
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
        <div>
            <h2 className="text-2xl font-semibold mb-4">Resistance Over the Years</h2>
            <Line data={chartData} />
        </div>
    );
};

export default ResistanceLineChart;