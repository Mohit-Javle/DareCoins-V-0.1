import React, { useState, useEffect } from 'react';
import { dareService, truthService, adminService } from '../services/api';

const AdminContent = () => {
    const [activeTab, setActiveTab] = useState('dare');
    const [dareData, setDareData] = useState({ title: '', description: '', reward: 100, timeframe: '24h', category: 'Social' });
    const [dares, setDares] = useState([]);
    const [truths, setTruths] = useState([]);
    const [truthData, setTruthData] = useState({ question: '', category: 'Personal', difficulty: 'Level 1' });

    useEffect(() => {
        loadContent();
    }, []);

    useEffect(() => {
        console.log('Current Dares:', dares);
        console.log('Current Truths:', truths);
        console.log('Filtered System Truths:', truths.filter(t => t.creator?.role === 'admin'));
    }, [dares, truths]);

    const loadContent = async () => {
        try {
            const [allDares, allTruths] = await Promise.all([
                adminService.getAllDares(),
                truthService.getAllTruths()
            ]);
            setDares(allDares);
            setTruths(allTruths);
        } catch (error) {
            console.error("Failed to load content", error);
        }
    };

    const handleDareSubmit = async (e) => {
        e.preventDefault();
        try {
            await dareService.createDare(dareData);
            alert('System Dare Created Successfully!');
            setDareData({ title: '', description: '', reward: 100, timeframe: '24h', category: 'Social' });
        } catch (error) {
            alert('Failed to create dare');
            console.error(error);
        }
    };

    const handleTruthSubmit = async (e) => {
        e.preventDefault();
        try {
            await truthService.createTruth(truthData);
            alert('System Truth Created Successfully!');
            setTruthData({ question: '', category: 'Personal', difficulty: 'Level 1' });
            loadContent(); // Refresh list
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to create truth');
            console.error(error);
        }
    };

    const handleDelete = async (id, type) => {
        if (!window.confirm(`Delete this ${type}?`)) return;
        try {
            if (type === 'dare') {
                await adminService.deleteDare(id);
            } else {
                await adminService.deleteTruth(id);
            }
            loadContent(); // Refresh list
        } catch (error) {
            alert('Delete failed');
            console.error(error);
        }
    };

    const inputStyle = {
        width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white', marginBottom: '16px'
    };

    const labelStyle = { display: 'block', marginBottom: '8px', color: '#94a3b8', fontSize: '14px' };

    return (
        <div style={{ padding: '20px', display: 'grid', gridTemplateColumns: 'minmax(400px, 1fr) 1fr', gap: '30px' }}>
            {/* Left Col: Create Form */}
            <div>
                <h2 className="dare-title-sm" style={{ marginBottom: '24px' }}>Content Management</h2>

                <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
                    <button
                        onClick={() => setActiveTab('dare')}
                        style={{
                            padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                            background: activeTab === 'dare' ? '#3b82f6' : 'rgba(255,255,255,0.1)',
                            color: activeTab === 'dare' ? 'white' : '#94a3b8'
                        }}
                    >
                        Create Dare
                    </button>
                    <button
                        onClick={() => setActiveTab('truth')}
                        style={{
                            padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                            background: activeTab === 'truth' ? '#8b5cf6' : 'rgba(255,255,255,0.1)',
                            color: activeTab === 'truth' ? 'white' : '#94a3b8'
                        }}
                    >
                        Create Truth
                    </button>
                </div>

                <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '30px', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
                    {activeTab === 'dare' ? (
                        <form onSubmit={handleDareSubmit}>
                            <h3 style={{ marginBottom: '20px', color: 'white' }}>New System Dare</h3>
                            <div>
                                <label style={labelStyle}>Title</label>
                                <input type="text" style={inputStyle} value={dareData.title} onChange={e => setDareData({ ...dareData, title: e.target.value })} required />
                            </div>
                            <div>
                                <label style={labelStyle}>Description</label>
                                <textarea style={{ ...inputStyle, height: '100px' }} value={dareData.description} onChange={e => setDareData({ ...dareData, description: e.target.value })} required />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <div>
                                    <label style={labelStyle}>Reward (DRC)</label>
                                    <input type="number" style={inputStyle} value={dareData.reward} onChange={e => setDareData({ ...dareData, reward: e.target.value })} />
                                </div>
                                <div>
                                    <label style={labelStyle}>Category</label>
                                    <select style={inputStyle} value={dareData.category} onChange={e => setDareData({ ...dareData, category: e.target.value })}>
                                        <option value="Social">Social</option>
                                        <option value="Physical">Physical</option>
                                        <option value="Creative">Creative</option>
                                        <option value="Funny">Funny</option>
                                    </select>
                                </div>
                            </div>
                            <button type="submit" style={{ width: '100%', padding: '14px', background: 'linear-gradient(to right, #3b82f6, #06b6d4)', border: 'none', borderRadius: '8px', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>
                                Publish Dare
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleTruthSubmit}>
                            <h3 style={{ marginBottom: '20px', color: 'white' }}>New System Truth</h3>
                            <div>
                                <label style={labelStyle}>Question</label>
                                <textarea style={{ ...inputStyle, height: '100px' }} value={truthData.question} onChange={e => setTruthData({ ...truthData, question: e.target.value })} required />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <div>
                                    <label style={labelStyle}>Category</label>
                                    <select style={inputStyle} value={truthData.category} onChange={e => setTruthData({ ...truthData, category: e.target.value })}>
                                        <option value="Personal">Personal</option>
                                        <option value="Funny">Funny</option>
                                        <option value="Deep">Deep</option>
                                        <option value="Dirty">Dirty</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={labelStyle}>Difficulty</label>
                                    <select style={inputStyle} value={truthData.difficulty} onChange={e => setTruthData({ ...truthData, difficulty: e.target.value })}>
                                        <option value="Level 1">Level 1</option>
                                        <option value="Level 2">Level 2</option>
                                        <option value="Level 3">Level 3</option>
                                    </select>
                                </div>
                            </div>
                            <button type="submit" style={{ width: '100%', padding: '14px', background: 'linear-gradient(to right, #8b5cf6, #d946ef)', border: 'none', borderRadius: '8px', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>
                                Publish Truth
                            </button>
                        </form>
                    )}
                </div>
            </div>

            {/* Right Col: Content List */}
            <div style={{ marginTop: '90px' }}>
                <h3 style={{ marginBottom: '20px', color: 'white' }}>
                    Today's Content
                </h3>
                <div style={{ maxHeight: 'calc(100vh - 150px)', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {activeTab === 'dare' ? (
                        dares.length === 0 ? (
                            <div style={{ color: '#94a3b8', fontStyle: 'italic', textAlign: 'center', padding: '20px' }}>No Dares found.</div>
                        ) : (
                            dares.map((d, i) => (
                                <div key={d._id || i} style={{
                                    background: 'rgba(255,255,255,0.05)',
                                    padding: '20px',
                                    borderRadius: '16px',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '12px'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{
                                            fontSize: '11px', fontWeight: 'bold', letterSpacing: '0.5px',
                                            padding: '4px 8px', borderRadius: '4px',
                                            background: (d.creator?.role === 'admin' || d.creator?.username === 'admin') ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                                            color: (d.creator?.role === 'admin' || d.creator?.username === 'admin') ? '#60a5fa' : '#94a3b8'
                                        }}>
                                            {(d.creator?.role === 'admin' || d.creator?.username === 'admin') ? 'SYSTEM DARE' : 'PLAYER DARE'}
                                        </span>
                                        <span style={{ fontSize: '13px', color: '#cbd5e1' }}>{d.category}</span>
                                    </div>

                                    <div>
                                        <h4 style={{ margin: '0 0 6px 0', fontSize: '18px', color: 'white' }}>{d.title}</h4>
                                        <p style={{ margin: 0, fontSize: '14px', color: '#94a3b8', lineHeight: '1.5' }}>{d.description}</p>
                                    </div>

                                    {/* Debug Info */}
                                    {/* Removed debug info as per instructions, it was not part of the desired output */}

                                    <div style={{ display: 'flex', gap: '15px', fontSize: '13px', color: '#cbd5e1' }}>
                                        <span>💎 {d.reward} DRC</span>
                                        <span>📅 {new Date(d.createdAt).toLocaleDateString()}</span>
                                    </div>

                                    {/* The delete button is now always visible for all dares */}
                                    <button
                                        onClick={() => handleDelete(d._id, 'dare')}
                                        style={{
                                            marginTop: '8px', width: '100%', padding: '12px', borderRadius: '8px',
                                            background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)',
                                            fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                            transition: 'all 0.2s'
                                        }}
                                        onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.25)'; }}
                                        onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)'; }}
                                    >
                                        <i className="ri-delete-bin-line"></i> Delete
                                    </button>
                                </div>
                            ))
                        )
                    ) : (
                        truths.length === 0 ? (
                            <div style={{ color: '#94a3b8', fontStyle: 'italic', textAlign: 'center', padding: '20px' }}>No Truths found.</div>
                        ) : (
                            truths.map((t, i) => (
                                <div key={t._id || i} style={{
                                    background: 'linear-gradient(145deg, rgba(23, 25, 35, 0.9), rgba(17, 24, 39, 0.8))',
                                    padding: '24px',
                                    borderRadius: '20px',
                                    border: '1px solid rgba(255,255,255,0.08)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '16px',
                                    boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                                    position: 'relative'
                                }}>
                                    {/* Accent Line */}
                                    <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px', background: 'linear-gradient(to bottom, #8b5cf6, #d946ef)', borderTopLeftRadius: '20px', borderBottomLeftRadius: '20px' }} />

                                    {/* Header */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <span style={{
                                                fontSize: '11px', fontWeight: 'bold', letterSpacing: '0.5px',
                                                padding: '4px 8px', borderRadius: '4px',
                                                background: (t.creator?.role === 'admin' || t.creator?.username === 'admin') ? 'rgba(139, 92, 246, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                                                color: (t.creator?.role === 'admin' || t.creator?.username === 'admin') ? '#a78bfa' : '#94a3b8'
                                            }}>
                                                {(t.creator?.role === 'admin' || t.creator?.username === 'admin') ? 'SYSTEM TRUTH' : 'PLAYER TRUTH'}
                                            </span>
                                            <span style={{
                                                fontSize: '11px', fontWeight: '800', letterSpacing: '0.5px', textTransform: 'uppercase',
                                                padding: '4px 10px', borderRadius: '20px',
                                                background: 'rgba(139, 92, 246, 0.15)', color: '#d8b4fe', border: '1px solid rgba(139, 92, 246, 0.2)'
                                            }}>
                                                {t.category}
                                            </span>
                                        </div>
                                        <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '500' }}>
                                            {t.createdAt ? new Date(t.createdAt).toLocaleDateString() : 'Just now'}
                                        </span>
                                    </div>

                                    {/* Content */}
                                    <div>
                                        <p style={{ margin: 0, fontSize: '18px', color: '#ffffff', lineHeight: '1.6', fontWeight: '500', fontFamily: '"Plus Jakarta Sans", sans-serif' }}>
                                            "{t.question}"
                                        </p>
                                    </div>

                                    {/* Footer / Actions */}
                                    <div style={{ paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                        <button
                                            onClick={() => handleDelete(t._id, 'truth')}
                                            style={{
                                                width: '100%',
                                                padding: '12px',
                                                borderRadius: '12px',
                                                background: 'rgba(239, 68, 68, 0.1)',
                                                color: '#ef4444',
                                                border: '1px solid rgba(239, 68, 68, 0.2)',
                                                fontWeight: '600',
                                                fontSize: '14px',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '8px',
                                                transition: 'all 0.2s ease'
                                            }}
                                            onMouseOver={(e) => {
                                                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
                                                e.currentTarget.style.borderColor = '#ef4444';
                                            }}
                                            onMouseOut={(e) => {
                                                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                                                e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.2)';
                                            }}
                                        >
                                            <i className="ri-delete-bin-line"></i> Delete
                                        </button>
                                    </div>
                                </div>
                            ))
                        )
                    )}
                </div>
            </div >
        </div >
    );
};

export default AdminContent;
