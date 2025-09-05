import React from 'react';
import { Doughnut } from 'react-chartjs-2';

const SpendingChart = ({ data: chartData }) => {
    const data = {
        labels: chartData.map(item => item[0]),
        datasets: [{
            label: 'Spending',
            data: chartData.map(item => item[1]),
            backgroundColor: ['#22c55e', '#ef4444', '#3b82f6', '#eab308', '#8b5cf6', '#f97316', '#14b8a6'],
            borderColor: '#18181b',
            borderWidth: 4,
        }]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        plugins: {
            legend: {
                position: 'right',
                labels: {
                    color: '#a1a1aa',
                    font: { size: 14 },
                    boxWidth: 20,
                }
            },
            tooltip: {
                callbacks: {
                    label: function (context) {
                        let label = context.label || '';
                        if (label) { label += ': '; }
                        if (context.parsed !== null) {
                            label += new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(context.parsed);
                        }
                        return label;
                    }
                }
            }
        }
    };

    return (
        <div className="chart-container">
            {chartData.length > 0 ? <Doughnut data={data} options={options} /> : <p className="no-data">No spending data for a chart yet.</p>}
        </div>
    );
};

export default SpendingChart;
