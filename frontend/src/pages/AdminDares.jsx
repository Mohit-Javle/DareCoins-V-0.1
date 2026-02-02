import React, { useState, useEffect } from 'react';
import { adminService } from '../services/api';

const AdminDares = () => {
    const [activeTab, setActiveTab] = useState('dares');
    const [dares, setDares] = useState([]);
    const [truths, setTruths] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [daresData, truthsData] = await Promise.all([
                adminService.getAllDares(),
                adminService.getAllTruths()
            ]);
            setDares(daresData);
            setTruths(truthsData);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id, type) => {
        if (!window.confirm(`Are you sure you want to delete this ${type}? This cannot be undone.`)) return;
        try {
            if (type === 'dare') {
                await adminService.deleteDare(id);
                setDares(dares.filter(d => d._id !== id));
            } else {
                await adminService.deleteTruth(id);
                setTruths(truths.filter(t => t._id !== id));
            }
            alert(`${type.charAt(0).toUpperCase() + type.slice(1)} deleted successfully`);
        } catch (error) {
            alert(`Failed to delete ${type}`);
        }
    };

    if (loading) return <div style={{ color: 'white', padding: '20px' }}>Loading...</div>;
    if (error) return <div style={{ color: 'red', padding: '20px' }}>Error: {error}</div>;

    const filteredDares = dares.filter(d => d.creator?.role !== 'admin');
    const filteredTruths = truths.filter(t => t.creator?.role !== 'admin');

    return (
        <div style={{ padding: '20px' }}>
            <h2 className="dare-title-sm" style={{ marginBottom: '20px' }}>Moderation</h2>

            <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
                <button
                    onClick={() => setActiveTab('dares')}
                    style={{
                        padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                        background: activeTab === 'dares' ? 'var(--primary)' : 'rgba(255,255,255,0.1)',
                        color: 'white'
                    }}
                >
                    Player Dares
                </button>
                <button
                    onClick={() => setActiveTab('truths')}
                    style={{
                        padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                        background: activeTab === 'truths' ? 'var(--primary)' : 'rgba(255,255,255,0.1)',
                        color: 'white'
                    }}
                >
                    Player Truths
                </button>
            </div>

            <div style={{ overflowX: 'auto', background: 'rgba(10, 25, 49, 0.6)', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', color: 'var(--off-white)' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'left' }}>
                            <th style={{ padding: '16px' }}>{activeTab === 'dares' ? 'Title' : 'Question'}</th>
                            <th style={{ padding: '16px' }}>Creator</th>
                            {activeTab === 'dares' && <th style={{ padding: '16px' }}>Status</th>}
                            <th style={{ padding: '16px' }}>{activeTab === 'dares' ? 'Reward' : 'Category'}</th>
                            <th style={{ padding: '16px' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {activeTab === 'dares' ? (
                            filteredDares.map(dare => (
                                <tr key={dare._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <td style={{ padding: '16px' }}>
                                        <div style={{ fontWeight: 'bold' }}>{dare.title}</div>
                                        <div style={{ fontSize: '12px', opacity: 0.7 }}>{dare.category}</div>
                                    </td>
                                    <td style={{ padding: '16px' }}>{dare.creator?.username || 'Unknown'}</td>
                                    <td style={{ padding: '16px' }}>
                                        <span style={{
                                            padding: '4px 8px', borderRadius: '4px', fontSize: '12px',
                                            background: dare.status === 'active' ? 'rgba(74, 240, 255, 0.1)' : 'rgba(255,255,255,0.1)',
                                            color: dare.status === 'active' ? '#4AF0FF' : 'white'
                                        }}>
                                            {dare.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: '16px' }}>{dare.reward} DRC</td>
                                    <td style={{ padding: '16px' }}>
                                        <button
                                            onClick={() => handleDelete(dare._id, 'dare')}
                                            style={{ background: '#ef4444', border: 'none', color: 'white', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
                                        >
                                            <i className="ri-delete-bin-line"></i> Delete
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            filteredTruths.map(truth => (
                                <tr key={truth._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <td style={{ padding: '16px' }}>
                                        <div style={{ fontWeight: 'bold', maxWidth: '300px' }}>{truth.question}</div>
                                        <div style={{ fontSize: '12px', opacity: 0.7 }}>{truth.difficulty}</div>
                                    </td>
                                    <td style={{ padding: '16px' }}>{truth.creator?.username || 'Unknown'}</td>
                                    <td style={{ padding: '16px' }}>{truth.category}</td>
                                    <td style={{ padding: '16px' }}>
                                        <button
                                            onClick={() => handleDelete(truth._id, 'truth')}
                                            style={{ background: '#ef4444', border: 'none', color: 'white', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
                                        >
                                            <i className="ri-delete-bin-line"></i> Delete
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminDares;
