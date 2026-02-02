import React, { useState, useEffect } from 'react';
import { adminService } from '../services/api';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
    const [stats, setStats] = useState({ totalUsers: 0, activeDares: 0, totalVolume: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await adminService.getStats();
                setStats(data);
            } catch (error) {
                console.error("Failed to fetch admin stats", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return <div style={{ color: 'white', padding: '20px' }}>Loading Stats...</div>;

    const cards = [
        { label: 'Total Users', value: stats.totalUsers, icon: 'ri-user-3-fill', color: '#4AF0FF' },
        { label: 'Active Dares', value: stats.activeDares, icon: 'ri-fire-fill', color: '#ff4757' },
        { label: 'Platform Volume', value: `${stats.totalVolume} DRC`, icon: 'ri-wallet-3-fill', color: '#00ff80' },
    ];

    return (
        <div style={{ padding: '20px' }}>
            <h2 className="dare-title-sm" style={{ marginBottom: '20px' }}>Admin Dashboard</h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                {cards.map((card, i) => (
                    <div key={i} style={{
                        background: 'rgba(10, 25, 49, 0.6)',
                        padding: '24px',
                        borderRadius: '16px',
                        border: '1px solid var(--glass-border)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px'
                    }}>
                        <div style={{
                            width: '48px', height: '48px', borderRadius: '12px',
                            background: `${card.color}20`, color: card.color,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '24px'
                        }}>
                            <i className={card.icon}></i>
                        </div>
                        <div>
                            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>{card.label}</div>
                            <div style={{ color: 'white', fontFamily: 'MiSans-Bold', fontSize: '24px' }}>{card.value}</div>
                        </div>
                    </div>
                ))}
            </div>

            <h3 className="dare-title-sm" style={{ marginBottom: '16px' }}>Quick Management</h3>
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                <Link to="/admin/users" style={{
                    padding: '20px', background: 'rgba(255,255,255,0.05)', borderRadius: '16px',
                    color: 'white', textDecoration: 'none', border: '1px solid rgba(255,255,255,0.1)',
                    display: 'flex', flexDirection: 'column', gap: '10px', width: '150px'
                }}>
                    <i className="ri-group-fill" style={{ fontSize: '32px', color: '#4AF0FF' }}></i>
                    <span>Manage Users</span>
                </Link>
                <Link to="/admin/content" style={{
                    padding: '20px', background: 'rgba(255,255,255,0.05)', borderRadius: '16px',
                    color: 'white', textDecoration: 'none', border: '1px solid rgba(255,255,255,0.1)',
                    display: 'flex', flexDirection: 'column', gap: '10px', width: '150px'
                }}>
                    <i className="ri-file-add-fill" style={{ fontSize: '32px', color: '#8b5cf6' }}></i>
                    <span>Add Content</span>
                </Link>
                <Link to="/admin/analytics" style={{
                    padding: '20px', background: 'rgba(255,255,255,0.05)', borderRadius: '16px',
                    color: 'white', textDecoration: 'none', border: '1px solid rgba(255,255,255,0.1)',
                    display: 'flex', flexDirection: 'column', gap: '10px', width: '150px'
                }}>
                    <i className="ri-pie-chart-2-line" style={{ fontSize: '32px', color: '#f59e0b' }}></i>
                    <span>Analytics</span>
                </Link>
                <div style={{
                    padding: '20px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px',
                    color: 'rgba(255,255,255,0.3)', border: '1px dashed rgba(255,255,255,0.1)',
                    display: 'flex', flexDirection: 'column', gap: '10px', width: '150px'
                }}>
                    <i className="ri-settings-4-line" style={{ fontSize: '32px' }}></i>
                    <span>Global Settings (Coming Soon)</span>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
