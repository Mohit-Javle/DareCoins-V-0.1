import { useState } from 'react';
import DareSubmissionModal from './DareSubmissionModal';
import { dareService } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function DareDetails({ dare }) {
    const [isSubmissionOpen, setIsSubmissionOpen] = useState(false);
    const [hasJoined, setHasJoined] = useState(false);
    const navigate = useNavigate();
    const { user } = useAuth();

    if (!dare) return <div className="right-panel">Select a dare to see details</div>;

    const isCreator = user?.username === dare.user;

    const handleAcceptDare = async () => {
        try {
            await dareService.joinDare(dare.id);
            alert("Dare accepted! Good luck.");
            setHasJoined(true);
        } catch (error) {
            if (error.response?.data?.message?.includes('Already joined')) {
                setHasJoined(true);
            } else {
                alert(error.response?.data?.message || "Failed to join dare");
            }
        }
    };

    const handleIgnoreDare = async () => {
        if (!confirm("Are you sure you want to decline this dare? doing so will remove it from your feed.")) return;

        try {
            await dareService.ignoreDare(dare.id);
            alert("Dare declined. It has been removed.");
            // Redirect to generic explore page to clear the current view
            navigate('/explore');
            // Optionally trigger a feed refresh if possible, but navigation works.
            window.location.reload(); // Hard refresh to ensure feed updates (simple fix)
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || "Failed to ignore dare");
        }
    };

    const handleProofSubmit = async (file) => {
        console.log("Proof submitted:", file);
        try {
            // SIMULATION: Since we don't have a real file server yet, 
            // we'll send a dummy URL. 
            // In production, upload 'file' to AWS S3/Cloudinary first.
            await dareService.submitProof(dare.id, {
                proof: file,
                description: "Proof submitted via DareCoin App"
            });
            alert("Proof submitted successfully! Waiting for creator approval.");
            setIsSubmissionOpen(false);
        } catch (error) {
            alert(error.response?.data?.message || "Failed to submit proof");
        }
    };

    const handleReviewProof = async (participantId, approved) => {
        try {
            await dareService.verifyProof(dare.id, { participantId, approved });
            alert(approved ? "Proof Approved! Dare Completed." : "Proof Rejected.");
            if (approved) {
                // Dare is now completed. Remove from view implicitly via reload.
                navigate('/explore');
                window.location.reload();
            } else {
                // If rejected, just refresh to update UI state
                window.location.reload();
            }
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || "Verification Failed");
        }
    };

    return (
        <div className="right-panel">
            <div className="dare-cover">
                <img src={dare.coverImage} alt="Challenge Preview" />
                <div className="video-overlay">
                    <div className="user-tag">
                        <div className="user-avatar-small">
                            <img src={dare.avatar} style={{ objectFit: 'cover', objectPosition: 'center' }} alt="User" />
                        </div>
                        <div className="user-name">{dare.user}</div>
                    </div>
                </div>
                <img className="palette-decoration" src={dare.avatar} alt="" />
            </div>

            <div className="detail-content">
                <div className="detail-header">
                    <div>
                        <h1 className="dare-main-title">{dare.fullTitle}</h1>
                        <div className="dare-tags">
                            {dare.tags.map((tag, index) => (
                                <span key={index} className="tag">{tag}</span>
                            ))}
                        </div>
                    </div>
                    <i className="ri-share-forward-fill" style={{ fontSize: '24px', color: 'var(--light-blue)', cursor: 'pointer' }}></i>
                </div>

                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-label">Time Limit</div>
                        <div className="stat-value">{dare.timeLimit} <span style={{ fontSize: '14px', fontWeight: 'normal' }}>mins</span></div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-label">Stake</div>
                        <div className="stat-value">{dare.stake} <span style={{ fontSize: '14px', fontWeight: 'normal' }}>DC</span></div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-label">Reward</div>
                        <div className="stat-value reward">{dare.reward.toLocaleString()} <span style={{ fontSize: '14px', fontWeight: 'normal' }}>DC</span></div>
                    </div>
                </div>

                <div className="conditions-box">
                    <div style={{ fontFamily: "'MiSans-Bold'", marginBottom: '8px', color: 'var(--light-blue)' }}>Conditions / Rules:</div>
                    {dare.conditions}
                </div>

                {!hasJoined ? (
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                            className="accept-btn"
                            onClick={handleAcceptDare}
                            style={{
                                flex: 1,
                                opacity: isCreator ? 0.5 : 1,
                                cursor: isCreator ? 'not-allowed' : 'pointer',
                                background: isCreator ? '#555' : 'linear-gradient(90deg, #00ff80, #00cc66)'
                            }}
                            disabled={isCreator}
                        >
                            <span>{isCreator ? 'Your Dare' : 'Accept Dare'}</span>
                            <i className="ri-flashlight-fill"></i>
                        </button>
                        {!isCreator && (
                            <button
                                className="accept-btn"
                                onClick={handleIgnoreDare}
                                style={{
                                    flex: 1,
                                    background: 'rgba(255, 77, 77, 0.1)',
                                    border: '1px solid rgba(255, 77, 77, 0.3)',
                                    color: '#ff4d4d'
                                }}
                            >
                                <span>Ignore</span>
                                <i className="ri-close-circle-line"></i>
                            </button>
                        )}
                    </div>
                ) : (
                    <button
                        className="accept-btn"
                        onClick={() => setIsSubmissionOpen(true)}
                        style={{ background: 'linear-gradient(90deg, #00ff80, #00cc66)', color: 'black' }}
                    >
                        <span>Submit Proof</span>
                        <i className="ri-upload-cloud-fill"></i>
                    </button>
                )}

                {/* CREATOR REVIEW SECTION */}
                {isCreator && dare.participants && dare.participants.some(p => p.status === 'pending_review') && (
                    <div className="review-section" style={{ marginTop: '20px', padding: '15px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                        <h3 style={{ color: 'var(--light-blue)', marginBottom: '10px' }}>Pending Approvals</h3>
                        {dare.participants.filter(p => p.status === 'pending_review').map((participant, idx) => (
                            <div key={idx} style={{ marginBottom: '10px', padding: '10px', background: '#222', borderRadius: '8px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                                    <img src={participant.user?.avatar || 'https://via.placeholder.com/30'} alt="User" style={{ width: 30, height: 30, borderRadius: '50%' }} />
                                    <span style={{ color: 'white' }}>{participant.user?.username || 'User'}</span>
                                </div>
                                <div style={{ marginBottom: '8px' }}>
                                    <a href={participant.proofUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#00ff80', textDecoration: 'underline' }}>View Proof</a>
                                </div>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button
                                        onClick={() => handleReviewProof(participant.user?._id || participant.user, true)}
                                        style={{ flex: 1, background: '#00ff80', color: 'black', border: 'none', padding: '8px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                                    >Approve</button>
                                    <button
                                        onClick={() => handleReviewProof(participant.user?._id || participant.user, false)}
                                        style={{ flex: 1, background: '#ff4d4d', color: 'white', border: 'none', padding: '8px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                                    >Reject</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <DareSubmissionModal
                isOpen={isSubmissionOpen}
                onClose={() => setIsSubmissionOpen(false)}
                dare={dare}
                onSubmit={handleProofSubmit}
            />
        </div>
    );
}
