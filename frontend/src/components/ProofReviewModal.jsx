import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';

export default function ProofReviewModal({ isOpen, onClose, dare, onVerify }) {
    const [selectedParticipant, setSelectedParticipant] = useState(null);

    // Filter participants who have submitted proof and are pending
    const pendingParticipants = dare?.participants?.filter(p => p.status === 'pending_review' && (p.proofUrl || (dare?.type === 'truth' && p.answer))) || [];

    // Auto-select first item if selection is cleared or invalid
    useEffect(() => {
        if (selectedParticipant) {
            const isStillPending = pendingParticipants.find(p =>
                (p.user?._id || p.user) === (selectedParticipant.user?._id || selectedParticipant.user)
            );
            if (!isStillPending) {
                // Current selection is no longer pending (approved/rejected), switch to next or null
                setSelectedParticipant(pendingParticipants.length > 0 ? pendingParticipants[0] : null);
            }
        } else if (pendingParticipants.length > 0 && !selectedParticipant) {
            // Optional: Auto-select first if nothing selected? Let's leave it to manual click or above logic
        }
    }, [pendingParticipants, selectedParticipant]);

    if (typeof document === 'undefined') return null;

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100vw',
                    height: '100vh',
                    zIndex: 2147483647, // Max Z-Index
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    {/* Dark Blurry Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            background: 'rgba(5, 10, 20, 0.85)',
                            backdropFilter: 'blur(16px)',
                            zIndex: 1
                        }}
                    />

                    {/* Premium Glass Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 30 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 30 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            position: 'relative',
                            width: '90%',
                            maxWidth: '900px',
                            height: '80vh',
                            maxHeight: '700px',
                            background: 'rgba(20, 30, 50, 0.6)',
                            backgroundImage: 'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.01))',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '32px',
                            zIndex: 2,
                            boxShadow: '0 50px 100px -20px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255,255,255,0.05)',
                            display: 'flex',
                            overflow: 'hidden'
                        }}
                    >
                        {/* Glow Effect */}
                        <div style={{
                            position: 'absolute',
                            top: '-50%',
                            right: '-50%',
                            width: '200%',
                            height: '200%',
                            background: 'radial-gradient(circle at center, rgba(74, 127, 167, 0.05), transparent 70%)',
                            pointerEvents: 'none',
                            zIndex: 0
                        }}></div>

                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            style={{
                                position: 'absolute',
                                top: '20px',
                                right: '20px',
                                background: 'rgba(255,255,255,0.05)',
                                border: 'none',
                                width: '36px',
                                height: '36px',
                                borderRadius: '50%',
                                color: 'rgba(255,255,255,0.5)',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.2s',
                                zIndex: 10
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                                e.currentTarget.style.color = '#fff';
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                                e.currentTarget.style.color = 'rgba(255,255,255,0.5)';
                            }}
                        >
                            <i className="ri-close-line" style={{ fontSize: '20px' }}></i>
                        </button>

                        {/* Left sidebar - List */}
                        <div className="custom-scrollbar" style={{
                            width: '320px',
                            borderRight: '1px solid rgba(255,255,255,0.05)',
                            background: 'rgba(0,0,0,0.2)',
                            zIndex: 1,
                            display: 'flex',
                            flexDirection: 'column'
                        }}>
                            <div style={{ padding: '24px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <h3 style={{ fontFamily: 'MiSans-Bold', fontSize: '18px', color: '#fff', marginBottom: '4px' }}>Review Proofs</h3>
                                <div style={{ color: 'var(--light-blue)', fontSize: '13px' }}>
                                    {dare?.title || 'Unknown Dare'}
                                </div>
                            </div>

                            <div style={{ flex: 1, overflowY: 'auto' }}>
                                {pendingParticipants.length === 0 ? (
                                    <div style={{ padding: '40px 20px', textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>
                                        <i className="ri-inbox-line" style={{ fontSize: '32px', marginBottom: '8px', display: 'block' }}></i>
                                        No pending submissions
                                    </div>
                                ) : (
                                    pendingParticipants.map((p, idx) => (
                                        <div key={idx}
                                            onClick={() => setSelectedParticipant(p)}
                                            style={{
                                                padding: '16px 24px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '12px',
                                                cursor: 'pointer',
                                                background: selectedParticipant === p ? 'rgba(255,255,255,0.05)' : 'transparent',
                                                borderLeft: selectedParticipant === p ? '3px solid #00ff80' : '3px solid transparent',
                                                transition: 'all 0.2s'
                                            }}
                                            onMouseEnter={e => { if (selectedParticipant !== p) e.currentTarget.style.background = 'rgba(255,255,255,0.02)' }}
                                            onMouseLeave={e => { if (selectedParticipant !== p) e.currentTarget.style.background = 'transparent' }}
                                        >
                                            <div style={{
                                                width: '40px', height: '40px', borderRadius: '50%',
                                                background: '#333', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)'
                                            }}>
                                                <img
                                                    src={p.user?.avatar || 'https://i.pravatar.cc/150'}
                                                    alt=""
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                    onError={(e) => { e.target.src = 'https://i.pravatar.cc/150'; }}
                                                />
                                            </div>
                                            <div style={{ overflow: 'hidden' }}>
                                                <div style={{ color: '#fff', fontSize: '14px', fontFamily: 'MiSans-Medium' }}>
                                                    {p.user?.username || 'User'}
                                                </div>
                                                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>
                                                    Tap to review
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Right Content - Preview */}
                        <div style={{ flex: 1, padding: '30px', display: 'flex', flexDirection: 'column', zIndex: 1, overflowY: 'auto' }}>
                            {selectedParticipant ? (
                                <motion.div
                                    key={selectedParticipant.user?._id}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.3 }}
                                    style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
                                >
                                    {/* Media Viewer */}
                                    <div style={{
                                        flex: 1,
                                        background: '#000',
                                        borderRadius: '20px',
                                        overflow: 'hidden',
                                        position: 'relative',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        marginBottom: '24px',
                                        minHeight: '300px',
                                        padding: '20px'
                                    }}>
                                        {dare?.type === 'truth' ? (
                                            <div style={{
                                                textAlign: 'center',
                                                color: '#fff',
                                                fontFamily: 'MiSans-Medium',
                                                fontSize: '24px',
                                                fontStyle: 'italic',
                                                maxWidth: '80%'
                                            }}>
                                                "{selectedParticipant.answer}"
                                            </div>
                                        ) : (
                                            selectedParticipant.proofUrl?.match(/\.(mp4|mov|webm)$/i) ? (
                                                <video src={selectedParticipant.proofUrl} controls autoPlay loop style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                            ) : (
                                                <img src={selectedParticipant.proofUrl} alt="Proof" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                            )
                                        )}
                                    </div>

                                    {/* Controls */}
                                    <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '20px', padding: '20px' }}>
                                        <div style={{ marginBottom: '20px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                                            <i className="ri-user-smile-line" style={{ color: 'var(--light-blue)' }}></i>
                                            <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px' }}>
                                                Notes: <span style={{ color: '#fff' }}>{selectedParticipant.description || "No notes provided."}</span>
                                            </span>
                                        </div>

                                        <div style={{ display: 'flex', gap: '16px' }}>
                                            <button
                                                onClick={() => onVerify(selectedParticipant.user?._id || selectedParticipant.user, false)}
                                                style={{
                                                    flex: 1, padding: '16px', borderRadius: '16px',
                                                    background: 'rgba(255, 71, 87, 0.1)', border: '1px solid rgba(255, 71, 87, 0.3)',
                                                    color: '#ff4757', cursor: 'pointer', fontFamily: 'MiSans-Bold',
                                                    fontSize: '15px', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                                                }}
                                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255, 71, 87, 0.2)'}
                                                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255, 71, 87, 0.1)'}
                                            >
                                                <i className="ri-close-circle-fill"></i> Reject
                                            </button>
                                            <button
                                                onClick={() => onVerify(selectedParticipant.user?._id || selectedParticipant.user, true)}
                                                style={{
                                                    flex: 1, padding: '16px', borderRadius: '16px',
                                                    background: 'linear-gradient(90deg, #00ff80, #00cc66)', border: 'none',
                                                    color: '#00331a', cursor: 'pointer', fontFamily: 'MiSans-Bold',
                                                    fontSize: '15px', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                                    boxShadow: '0 5px 15px rgba(0, 255, 128, 0.25)'
                                                }}
                                                onMouseEnter={e => {
                                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                                    e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 255, 128, 0.3)';
                                                }}
                                                onMouseLeave={e => {
                                                    e.currentTarget.style.transform = 'translateY(0)';
                                                    e.currentTarget.style.boxShadow = '0 5px 15px rgba(0, 255, 128, 0.25)';
                                                }}
                                            >
                                                <i className="ri-check-double-line"></i> Approve & Pay
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ) : (
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.2)' }}>
                                    <div style={{
                                        width: '80px', height: '80px', borderRadius: '50%',
                                        background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        marginBottom: '20px'
                                    }}>
                                        <i className="ri-shield-check-line" style={{ fontSize: '40px' }}></i>
                                    </div>
                                    <div style={{ fontSize: '16px', fontWeight: '500' }}>Review Center</div>
                                    <div style={{ fontSize: '13px', marginTop: '8px', opacity: 0.6 }}>Select a submission from the left</div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>,
        document.body
    );
}
