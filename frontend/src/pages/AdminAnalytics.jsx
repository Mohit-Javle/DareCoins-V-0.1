import React, { useState, useEffect } from 'react';
import { adminService } from '../services/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';

const AdminAnalytics = () => {
    const [data, setData] = useState({ userGrowth: [], transactionVolume: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const result = await adminService.getAnalyticsData();

            // Format data for Recharts (merge with dates if needed, simple mapping here)
            const formattedUserGrowth = result.userGrowth.map(item => ({
                date: item._id,
                users: item.count
            }));

            const formattedVolume = result.transactionVolume.map(item => ({
                date: item._id,
                volume: item.total
            }));

            setData({ userGrowth: formattedUserGrowth, transactionVolume: formattedVolume });
        } catch (err) {
            setError('Failed to load analytics data');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div style={{ color: 'white', padding: '20px' }}>Loading analytics...</div>;
    if (error) return <div style={{ color: 'red', padding: '20px' }}>Error: {error}</div>;

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div style={{ background: '#1e293b', border: '1px solid #334155', padding: '10px', borderRadius: '8px' }}>
                    <p style={{ color: '#94a3b8', margin: 0 }}>{label}</p>
                    <p style={{ color: payload[0].color, margin: 0, fontWeight: 'bold' }}>
                        {payload[0].name}: {payload[0].value}
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div style={{ padding: '20px' }}>
            <h2 className="dare-title-sm" style={{ marginBottom: '20px' }}>Platform Analytics (Last 7 Days)</h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '30px' }}>

                {/* User Growth Chart */}
                <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '20px', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
                    <h3 style={{ color: '#94a3b8', marginBottom: '20px', fontSize: '16px' }}>User Growth</h3>
                    <div style={{ height: '300px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={data.userGrowth}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickFormatter={(tick) => tick.slice(5)} />
                                <YAxis stroke="#94a3b8" fontSize={12} allowDecimals={false} />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend />
                                <Line type="monotone" dataKey="users" stroke="#4AF0FF" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Transaction Volume Chart */}
                <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '20px', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
                    <h3 style={{ color: '#94a3b8', marginBottom: '20px', fontSize: '16px' }}>Transaction Volume (DRC)</h3>
                    <div style={{ height: '300px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.transactionVolume}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickFormatter={(tick) => tick.slice(5)} />
                                <YAxis stroke="#94a3b8" fontSize={12} />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend />
                                <Bar dataKey="volume" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {data.userGrowth.length === 0 && data.transactionVolume.length === 0 && (
                <div style={{ textAlign: 'center', marginTop: '40px', color: '#64748b' }}>
                    No data available for the last 7 days. Try adding more users or transactions!
                </div>
            )}
        </div>
    );
};

export default AdminAnalytics;
