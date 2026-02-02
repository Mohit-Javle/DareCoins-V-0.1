import React from 'react';
import { motion } from 'framer-motion';

export default function CreateSelector({ onClose, onSelectDare, onSelectTruth }) {
    return (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{
                position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)',
                display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
            }}
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                style={{
                    background: 'var(--glass-bg)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: '24px',
                    padding: '30px',
                    width: '90%',
                    maxWidth: '400px',
                    textAlign: 'center'
                }}
                onClick={e => e.stopPropagation()}
            >
                <h2 style={{ color: 'var(--off-white)', marginBottom: '30px', fontFamily: 'MiSans-Bold' }}>Create New</h2>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div
                        onClick={onSelectDare}
                        style={{
                            background: 'rgba(255, 71, 87, 0.1)',
                            border: '1px solid rgba(255, 71, 87, 0.3)',
                            borderRadius: '20px',
                            padding: '30px 20px',
                            cursor: 'pointer',
                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255, 71, 87, 0.2)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(255, 71, 87, 0.1)'}
                    >
                        <div style={{
                            width: '50px', height: '50px', borderRadius: '50%', background: '#ff4757',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            <i className="ri-fire-fill" style={{ fontSize: '24px', color: 'white' }}></i>
                        </div>
                        <span style={{ color: 'var(--off-white)', fontFamily: 'MiSans-Bold', fontSize: '18px' }}>Dare</span>
                    </div>

                    <div
                        onClick={onSelectTruth}
                        style={{
                            background: 'rgba(0, 255, 128, 0.1)',
                            border: '1px solid rgba(0, 255, 128, 0.3)',
                            borderRadius: '20px',
                            padding: '30px 20px',
                            cursor: 'pointer',
                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(0, 255, 128, 0.2)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(0, 255, 128, 0.1)'}
                    >
                        <div style={{
                            width: '50px', height: '50px', borderRadius: '50%', background: '#00ff80',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            <i className="ri-question-mark" style={{ fontSize: '24px', color: 'var(--dark-blue)' }}></i>
                        </div>
                        <span style={{ color: 'var(--off-white)', fontFamily: 'MiSans-Bold', fontSize: '18px' }}>Truth</span>
                    </div>
                </div>

                <div style={{ marginTop: '30px' }}>
                    <button onClick={onClose} style={{
                        background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer'
                    }}>Cancel</button>
                </div>
            </motion.div>
        </motion.div>
    );
}
