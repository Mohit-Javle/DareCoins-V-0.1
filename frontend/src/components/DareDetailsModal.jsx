import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { dareService, truthService } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DareSubmissionModal from './DareSubmissionModal';

export default function DareDetailsModal({ dare, isOpen, onClose }) {
    const [isSubmissionOpen, setIsSubmissionOpen] = useState(false);
    const [hasJoined, setHasJoined] = useState(false);
    const navigate = useNavigate();
    const { user } = useAuth();

    const [localParticipants, setLocalParticipants] = useState([]);

    // Reset state when dare changes
    useEffect(() => {
        setHasJoined(false);
        setIsSubmissionOpen(false);
        if (dare) {
            setLocalParticipants(dare.participants || []);
            // Fetch fresh data to get latest participants/proofs
            dareService.getById(dare.id).then(freshDare => {
                if (freshDare && freshDare.participants) {
                    setLocalParticipants(freshDare.participants);
                }
            }).catch(err => console.error("Failed to refresh dare details:", err));
        }
    }, [dare]);

    if (!dare || !isOpen || typeof document === 'undefined') return null;

    const isCreator = user?.username === dare.user;
    const isTruth = dare.type === 'truth';

    const handleAcceptDare = async () => {
        if (isTruth) {
            setHasJoined(true);
            return;
        }

        try {
            await dareService.joinDare(dare.id);
            alert("Accepted! Good luck.");
            setHasJoined(true);
        } catch (error) {
            if (error.response?.data?.message?.includes('Already joined')) {
                setHasJoined(true);
            } else {
                alert(error.response?.data?.message || "Failed to join");
            }
        }
    };

    const handleIgnoreDare = async () => {
        if (!confirm("Decline this challenge? It will be removed from your view.")) return;

        try {
            await dareService.ignoreDare(dare.id);
            alert("Declined.");
            onClose();
            window.location.reload();
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || "Failed to ignore");
        }
    };

    const handleProofSubmit = async (data) => {
        try {
            if (isTruth) {
                await truthService.answerTruth(dare.id, { answer: data.answer });
                alert("Answer submitted successfully!");
            } else {
                await dareService.submitProof(dare.id, {
                    proof: data,
                    description: "Proof submitted via DareCoin App"
                });
                alert("Proof submitted successfully!");
            }
            setIsSubmissionOpen(false);
            onClose();
        } catch (error) {
            alert(error.response?.data?.message || "Failed to submit");
        }
    };

    const handleReviewProof = async (participantId, approved) => {
        try {
            await dareService.verifyProof(dare.id, { participantId, approved });
            alert(approved ? "Approved! Completed." : "Rejected.");
            window.location.reload();
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || "Verification Failed");
        }
    };

    return createPortal(
        <>
            <div
                onClick={onClose}
                style={{
                    position: 'fixed',
                    top: 0, left: 0,
                    right: 0,
                    bottom: 0,
                    width: '100vw',
                    height: '100vh',
                    background: 'rgba(5, 10, 20, 0.85)',
                    backdropFilter: 'blur(10px)',
                    zIndex: 20000,
                    opacity: isOpen ? 1 : 0,
                    transition: 'opacity 0.3s ease'
                }}
            />
            <div
                style={{
                    position: 'fixed',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '90%',
                    maxWidth: '500px',
                    maxHeight: '90vh',
                    overflowY: 'auto',
                    background: '#1a1d26',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '24px',
                    padding: '0',
                    zIndex: 20001,
                    color: 'white',
                    boxShadow: '0 25px 50px rgba(0,0,0,0.5)'
                }}
            >
                {/* Cover Image */}
                <div style={{ height: '200px', width: '100%', position: 'relative' }}>
                    <img src={dare.coverImage} alt="Cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div style={{
                        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                        background: 'linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(26, 29, 38, 1))'
                    }} />
                    <button onClick={onClose} style={{ position: 'absolute', top: '15px', right: '15px', background: 'rgba(0,0,0,0.5)', border: 'none', color: 'white', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <i className="ri-close-line" style={{ fontSize: '20px' }}></i>
                    </button>
                </div>

                {/* Content */}
                <div style={{ padding: '0 24px 24px', marginTop: '-40px', position: 'relative' }}>
                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', marginBottom: '16px' }}>
                        <div>
                            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                                {dare.tags.map((tag, i) => (
                                    <span key={i} style={{ fontSize: '11px', background: 'rgba(255,255,255,0.1)', padding: '4px 8px', borderRadius: '6px' }}>{tag}</span>
                                ))}
                            </div>
                            <h2 style={{ fontFamily: 'MiSans-Bold', fontSize: '24px', margin: 0 }}>{dare.fullTitle}</h2>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px', opacity: 0.7 }}>
                                <img src={dare.avatar} alt="User" style={{ width: '24px', height: '24px', borderRadius: '50%' }} />
                                <span style={{ fontSize: '14px' }}>{dare.user}</span>
                            </div>
                        </div>
                    </div>

                    {/* Stats */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
                        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '12px' }}>
                            <div style={{ fontSize: '12px', opacity: 0.5, marginBottom: '4px' }}>STAKE</div>
                            <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#00d2ff' }}>{dare.stake} DC</div>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '12px' }}>
                            <div style={{ fontSize: '12px', opacity: 0.5, marginBottom: '4px' }}>TIME</div>
                            <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{dare.timeLimit}m</div>
                        </div>
                    </div>

                    {/* Conditions */}
                    <div style={{ marginBottom: '24px' }}>
                        <h3 style={{ fontSize: '16px', marginBottom: '8px', opacity: 0.9 }}>
                            {isTruth ? 'Question' : 'Instructions'}
                        </h3>
                        <p style={{ fontSize: '15px', lineHeight: '1.6', opacity: 0.8, background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '12px' }}>
                            {dare.conditions}
                        </p>
                    </div>

                    {/* Actions */}
                    {!hasJoined && (
                        <div style={{ display: 'flex', gap: '12px' }}>
                            {!isCreator && !dare.isSystem && (
                                <button onClick={handleIgnoreDare} style={{ flex: 1, padding: '16px', borderRadius: '16px', background: 'rgba(255,50,50,0.1)', color: '#ff4d4d', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>
                                    Decline
                                </button>
                            )}
                            <button
                                onClick={handleAcceptDare}
                                disabled={isCreator}
                                style={{
                                    flex: 2,
                                    padding: '16px',
                                    borderRadius: '16px',
                                    background: isCreator ? '#333' : 'linear-gradient(135deg, #00d2ff, #3a7bd5)',
                                    color: isCreator ? '#666' : 'white',
                                    border: 'none',
                                    fontWeight: 'bold',
                                    cursor: isCreator ? 'not-allowed' : 'pointer'
                                }}
                            >
                                {isCreator ? 'Your Challenge' : (isTruth ? 'Answer Truth' : 'Accept Dare')}
                            </button>
                        </div>
                    )}

                    {hasJoined && (
                        <button
                            onClick={() => setIsSubmissionOpen(true)}
                            style={{ width: '100%', padding: '16px', borderRadius: '16px', background: '#00cc66', color: '#000', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}
                        >
                            {isTruth ? 'Submit Answer' : 'Submit Proof'}
                        </button>
                    )}

                    {/* Creator Review Logic */}
                    {isCreator && localParticipants && localParticipants.some(p => p.proofUrl) && (
                        <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                            <h4 style={{ marginBottom: '12px' }}>Submissions</h4>
                            {localParticipants.filter(p => p.proofUrl).map((p, i) => (
                                <div key={i} style={{ background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '12px', marginBottom: '8px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            {p.user?.avatar && <img src={p.user.avatar} alt="" style={{ width: '24px', height: '24px', borderRadius: '50%' }} />}
                                            <span>{p.user?.username || 'User'}</span>
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                            <span style={{
                                                fontSize: '11px',
                                                padding: '2px 8px',
                                                borderRadius: '4px',
                                                background: p.status === 'completed' ? 'rgba(0, 204, 102, 0.2)' : p.status === 'rejected' ? 'rgba(255, 77, 77, 0.2)' : 'rgba(255, 204, 0, 0.2)',
                                                color: p.status === 'completed' ? '#00cc66' : p.status === 'rejected' ? '#ff4d4d' : '#ffcc00'
                                            }}>
                                                {p.status === 'completed' ? 'Approved' : p.status === 'rejected' ? 'Rejected' : 'Pending'}
                                            </span>
                                            <a href={p.proofUrl} target="_blank" style={{ color: '#00d2ff', fontSize: '13px' }}>View Proof</a>
                                        </div>
                                    </div>
                                    {p.status === 'pending_review' && (
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button onClick={() => handleReviewProof(p.user?._id || p.user, true)} style={{ flex: 1, padding: '8px', background: '#00cc66', border: 'none', borderRadius: '6px', cursor: 'pointer', color: '#000', fontWeight: 'bold' }}>Approve</button>
                                            <button onClick={() => handleReviewProof(p.user?._id || p.user, false)} style={{ flex: 1, padding: '8px', background: 'rgba(255, 77, 77, 0.1)', border: '1px solid #ff4d4d', color: '#ff4d4d', borderRadius: '6px', cursor: 'pointer' }}>Reject</button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                </div>
            </div>

            <DareSubmissionModal
                isOpen={isSubmissionOpen}
                onClose={() => setIsSubmissionOpen(false)}
                dare={dare}
                onSubmit={handleProofSubmit}
            />
        </>,
        document.body
    );
}
