import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function HighlightsModal({ isOpen, onClose, completedDares, currentHighlights, onToggleHighlight }) {
    if (!isOpen) return null;

    // Helper to check if a dare is already in highlights
    // currentHighlights contains populated Dare objects
    const isHighlighted = (dareId) => {
        return currentHighlights.some(h => h._id === dareId || h.id === dareId);
    };

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 10000,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
            {/* Backdrop */}
            <div
                onClick={onClose}
                style={{
                    position: 'absolute', inset: 0,
                    background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)'
                }}
            />

            {/* Modal */}
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                style={{
                    position: 'relative', width: '90%', maxWidth: '600px',
                    background: '#0a1931',
                    border: '1px solid var(--glass-border)',
                    borderRadius: '24px',
                    padding: '30px',
                    maxHeight: '80vh',
                    display: 'flex', flexDirection: 'column',
                    boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
                }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2 style={{ fontSize: '24px', fontFamily: 'MiSans-Bold' }}>Manage Highlights</h2>
                    <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'white', fontSize: '24px', cursor: 'pointer' }}>
                        <i className="ri-close-line"></i>
                    </button>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', paddingRight: '10px' }}>
                    {completedDares.length === 0 ? (
                        <div style={{ textAlign: 'center', color: 'var(--light-blue)', padding: '40px' }}>
                            You haven't completed any dares yet. <br /> Complete dares to add them to your highlights!
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '16px' }}>
                            {completedDares.map(dare => (
                                <div
                                    key={dare._id}
                                    onClick={() => onToggleHighlight(dare._id, isHighlighted(dare._id) ? 'remove' : 'add')}
                                    style={{
                                        position: 'relative',
                                        aspectRatio: '1',
                                        borderRadius: '16px',
                                        overflow: 'hidden',
                                        border: isHighlighted(dare._id) ? '2px solid #00ff80' : '1px solid rgba(255,255,255,0.1)',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {/* Proof Image/Video Thumbnail */}
                                    {dare.proofUrl?.includes('.mp4') ? (
                                        <video src={dare.proofUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <img src={dare.proofUrl || 'https://via.placeholder.com/150'} alt={dare.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    )}

                                    {/* Overlay */}
                                    <div style={{
                                        position: 'absolute', inset: 0,
                                        background: isHighlighted(dare._id) ? 'rgba(0, 255, 128, 0.2)' : 'rgba(0,0,0,0.3)',
                                        display: 'flex', alignItems: 'flex-end', padding: '10px'
                                    }}>
                                        <div style={{ fontSize: '12px', fontWeight: 'bold' }}>{dare.title}</div>
                                    </div>

                                    {/* Checkmark */}
                                    {isHighlighted(dare._id) && (
                                        <div style={{
                                            position: 'absolute', top: '10px', right: '10px',
                                            width: '24px', height: '24px',
                                            background: '#00ff80', borderRadius: '50%',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            color: '#000', fontSize: '16px'
                                        }}>
                                            <i className="ri-check-line"></i>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
