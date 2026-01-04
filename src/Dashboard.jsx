import supabase from './supbase-client.js'
import {useState, useEffect } from "react";
import { Chart } from 'react-charts'  // Fixed import - removed lowercase 'chart'

function Dashboard() {

    const [metrics, setMetrics] = useState([]);
    const [errors, setErrors] = useState(null);
    const [loading, setLoading] = useState(false);

    async function fetchMetrics() {
        try {
            const { data, error } = await supabase
                .from('sale_deals')
                .select(`name,value.sum()`,
                )
            if (error){
                throw error
            }
            setMetrics(data)
        }
        catch (error) {
            console.error("Error fetching metrics:", error)
            setErrors(error.message)
            return(
                <div>
                    <button onClick={fetchMetrics}>
                        Reload Metrics
                    </button>
                </div>
            );
        }
        finally {
            setLoading(false);
        }

    }

    useEffect(() => {
        fetchMetrics();

        const channel = supabase
            .channel('deal-changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'sale_deals',  // ← Replace with actual table name
                },
                (payload) => {

                    const { new: newRecord, old: oldRecord, eventType } = payload;

                    console.log(`Event type: ${eventType}`, payload);

                    if (eventType === 'INSERT') {
                        const { name, value } = newRecord;
                        console.log('New record inserted:', { name, value });

                        // Add to your state
                        setMetrics(prev => [newRecord, ...prev]);

                    } else if (eventType === 'UPDATE') {
                        const { name, value } = newRecord;
                        console.log('Record updated:', { name, value });
                        console.log('Old values:', oldRecord);

                        // Update in your state
                        setMetrics(prev =>
                            prev.map(item =>
                                item.id === newRecord.id ? newRecord : item
                            )
                        );

                    } else if (eventType === 'DELETE') {
                        console.log('Record deleted:', oldRecord);

                        // Remove from your state
                        setMetrics(prev =>
                            prev.filter(item => item.id !== oldRecord.id)
                        );
                    }
                }
            )
            .subscribe((status) => {
                console.log('Channel status:', status);
            });

        return () => {
            console.log('Cleaning up channel');
            supabase.removeChannel(channel);
        };
    }, []);

    const chartData = [
        {
            label: 'Sales',  // Added label which react-charts might need
            data: metrics.map((m) => ({
                primary: m.name,
                secondary: m.sum,
            })),

        }
    ]

    const primaryAxis = {
        getValue: (d) => d.primary,
        scale: 'band',
        padding: 0.2,
        position: 'bottom'
    }

    const secondaryAxes = [
        {
            getValue: (d) => d.secondary,
            scaleType: 'linear',
            min: 0,
            max: y_max(),
            padding: {
                top: 20,
                bottom: 40,
            },
        },
    ];

    function y_max() {
        if (metrics.length > 0) {
            const maxSum = Math.max(...metrics.map((m) => m.sum));
            return maxSum + 2000;
        }
        return 5000;
    }

    // Handle loading
    if (loading) return <p>Loading...</p>;

    // Handle error - THIS IS WHERE YOU RETURN JSX
    if (errors) return (
        <div>
            <p>Failed to fetch data: {errors}</p>
            <button onClick={() => window.location.reload()}>
                Reload
            </button>
        </div>
    );

    // Handle empty data
    if (!metrics || metrics.length === 0) return <p>No data found</p>;

    return (
        <div className="dashboard-wrapper">
            <div className="chart-container">
                <h2>Total Sales This Quarter ($)</h2>
                {/* Chart needs a container with defined dimensions */}
                <div style={{ width: '600px', height: '400px' }}>
                    {metrics.length > 0 ? (
                        <Chart
                            options={{
                                data: chartData,
                                primaryAxis,
                                secondaryAxes,
                                type: 'bar',
                                defaultColors: ['#58d675'],
                                tooltip: {
                                    show: false
                                }
                            }}
                        />
                    ) : (
                        <p>Loading chart data...</p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Dashboard;