import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import DareList from '../components/DareList';
import DareDetailsModal from '../components/DareDetailsModal';

export default function Explore({
    dares,
    truths,
    activeTab,
    setActiveTab
}) {
    const [selectedItem, setSelectedItem] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchParams] = useSearchParams();
    const dareIdParam = searchParams.get('id');

    const handleSelect = (id, type) => {
        const list = type === 'truth' ? truths : dares;
        const item = list.find(i => i.id === id);
        if (item) {
            setSelectedItem(item);
            setIsModalOpen(true);
        }
    };

    // Deep Link Effect
    useEffect(() => {
        if (dareIdParam && (dares.length > 0 || truths.length > 0)) {
            const allItems = [...dares, ...truths];
            const targetItem = allItems.find(i => i.id === dareIdParam);

            if (targetItem) {
                setSelectedItem(targetItem);
                setIsModalOpen(true);
            }
        }
    }, [dareIdParam, dares, truths]);

    return (
        <div className="content-area explore-container" style={{ position: 'relative', display: 'flex', flexDirection: 'column' }}>

            {/* Smooth Toggle - Centered at Top of Page Content */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px', marginTop: '10px' }}>
                <div style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    padding: '6px',
                    borderRadius: '100px',
                    display: 'flex',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    backdropFilter: 'blur(12px)'
                }}>
                    <div
                        onClick={() => setActiveTab('System')}
                        style={{
                            padding: '10px 32px',
                            borderRadius: '100px',
                            background: activeTab === 'System' ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                            color: activeTab === 'System' ? '#fff' : 'rgba(255,255,255,0.5)',
                            fontFamily: 'MiSans-Bold',
                            fontSize: '15px',
                            cursor: 'pointer',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            border: activeTab === 'System' ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid transparent',
                            boxShadow: activeTab === 'System' ? '0 4px 12px rgba(0, 0, 0, 0.1)' : 'none'
                        }}
                    >
                        System
                    </div>
                    <div
                        onClick={() => setActiveTab('Player')}
                        style={{
                            padding: '10px 32px',
                            borderRadius: '100px',
                            background: activeTab === 'Player' ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                            color: activeTab === 'Player' ? '#fff' : 'rgba(255,255,255,0.5)',
                            fontFamily: 'MiSans-Bold',
                            fontSize: '15px',
                            cursor: 'pointer',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            border: activeTab === 'Player' ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid transparent',
                            boxShadow: activeTab === 'Player' ? '0 4px 12px rgba(0, 0, 0, 0.1)' : 'none'
                        }}
                    >
                        Player
                    </div>
                </div>
            </div>
            {/* Split Layout Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '40px', height: 'calc(100vh - 200px)', width: '100%', paddingBottom: '20px' }}>

                {/* Left Column: Dares */}
                <div className="split-column-container" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <h3 style={{ fontSize: '24px', marginBottom: '20px', color: '#fff', textAlign: 'center', fontFamily: 'MiSans-Medium' }}>
                        Dare
                    </h3>
                    <div className="split-column no-scrollbar" style={{
                        flex: 1,
                        overflowY: 'auto',
                        padding: '20px',
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                        borderRadius: '24px'
                    }}>
                        <div className="dare-list" style={{ gap: '15px' }}>
                            {dares.map((dare) => (
                                <div
                                    key={dare.id}
                                    className="dare-item"
                                    onClick={() => handleSelect(dare.id, 'dare')}
                                    style={{
                                        cursor: 'pointer',
                                        borderLeft: '4px solid #ff6b6b',
                                        background: 'rgba(255,255,255,0.05)',
                                        border: 'none',
                                        borderLeft: '4px solid #ff6b6b',
                                        borderRadius: '12px',
                                        padding: '16px'
                                    }}
                                >
                                    <div className="dare-info">
                                        <div className="dare-text">
                                            <span className="dare-title-sm" style={{ fontSize: '18px' }}>{dare.title}</span>
                                            <span className="dare-sub" style={{ color: '#888', fontSize: '12px' }}>{dare.subtitle}</span>
                                        </div>
                                    </div>
                                    <i className="ri-arrow-right-s-line arrow-icon" style={{ opacity: 0.3 }}></i>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column: Truths */}
                <div className="split-column-container" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <h3 style={{ fontSize: '24px', marginBottom: '20px', color: '#fff', textAlign: 'center', fontFamily: 'MiSans-Medium' }}>
                        Truth
                    </h3>
                    <div className="split-column no-scrollbar" style={{
                        flex: 1,
                        overflowY: 'auto',
                        padding: '20px',
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                        borderRadius: '24px'
                    }}>
                        <div className="dare-list" style={{ gap: '15px' }}>
                            {truths.map((truth) => (
                                <div
                                    key={truth.id}
                                    className="dare-item"
                                    onClick={() => handleSelect(truth.id, 'truth')}
                                    style={{
                                        cursor: 'pointer',
                                        borderLeft: '4px solid #00d2ff',
                                        background: 'rgba(255,255,255,0.05)',
                                        border: 'none',
                                        borderLeft: '4px solid #00d2ff',
                                        borderRadius: '12px',
                                        padding: '16px'
                                    }}
                                >
                                    <div className="dare-info">
                                        <div className="dare-text">
                                            <span className="dare-title-sm" style={{ fontSize: '18px' }}>{truth.title}</span>
                                            <span className="dare-sub" style={{ color: '#888', fontSize: '12px' }}>{truth.subtitle}</span>
                                        </div>
                                    </div>
                                    <i className="ri-arrow-right-s-line arrow-icon" style={{ opacity: 0.3 }}></i>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            </div>

            {/* Details Modal */}
            <DareDetailsModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                dare={selectedItem}
            />
        </div>
    );
}
