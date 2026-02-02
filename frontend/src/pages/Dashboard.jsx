import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { dareService, notificationService, truthService } from '../services/api';
import ProofReviewModal from '../components/ProofReviewModal';
import { AnimatePresence, motion } from 'framer-motion';

export default function Dashboard() {
    const navigate = useNavigate();
    const { user, refreshUser } = useAuth();
    const { showToast } = useToast();

    // Notification State
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const notifRef = useRef(null);

    // Existing State
    const [activeDares, setActiveDares] = useState([]);
    const [myCreatedDares, setMyCreatedDares] = useState([]);
    const [isReviewOpen, setIsReviewOpen] = useState(false);
    const [selectedReviewDare, setSelectedReviewDare] = useState(null);
    const [loading, setLoading] = useState(true);

    const badges = [
        { id: 1, icon: 'ri-fire-fill', name: 'Streak Master', level: 3 },
        { id: 2, icon: 'ri-vip-crown-fill', name: 'Dare King', level: 1 },
        { id: 3, icon: 'ri-camera-lens-fill', name: 'Director', level: 2 },
        { id: 4, icon: 'ri-wallet-3-fill', name: 'High Roller', level: 1 },
    ];

    const quickActions = [
        { icon: 'ri-add-circle-fill', label: 'New Dare', action: () => document.querySelector('.create-btn')?.click() },
        { icon: 'ri-wallet-3-fill', label: 'Top Up', action: () => navigate('/wallet') },
        { icon: 'ri-user-add-fill', label: 'Invite', action: () => showToast('Invite link copied!', 'success') },
        { icon: 'ri-settings-4-fill', label: 'Settings', action: () => navigate('/profile') },
    ];

    // Fetch Notifications
    const fetchNotifications = async () => {
        if (user) {
            try {
                const data = await notificationService.getNotifications();
                setNotifications(data);
            } catch (error) {
                console.error("Failed to fetch notifications", error);
            }
        }
    };

    useEffect(() => {
        if (user) {
            console.log('Dashboard User:', user);
            fetchDashboardData();
            fetchNotifications();
            // Poll notifications
            const interval = setInterval(fetchNotifications, 30000);
            return () => clearInterval(interval);
        }
    }, [user]);

    // Handle outside click for notification
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notifRef.current && !notifRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const handleNotificationClick = async (notif) => {
        if (!notif.isRead) {
            try {
                await notificationService.markRead(notif._id);
                setNotifications(prev => prev.map(n => n._id === notif._id ? { ...n, isRead: true } : n));
            } catch (err) {
                console.error("Failed to mark read", err);
            }
        }
        setShowNotifications(false);
        if (notif.type === 'dare_challenge' && notif.dare) {
            console.log("Navigating to dare:", notif.dare);
            navigate(`/explore?id=${notif.dare._id || notif.dare}`);
        }
    };

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            // 1. Fetch Active Dares (that user acts on) - For now just all active dares
            // TODO: Filter by "joined by me"
            const dares = await dareService.getAllDares({ status: 'active' });
            setActiveDares(dares.slice(0, 5)); // Just show top 5

            // 2. Fetch My Created Dares and Truths
            const myDares = await dareService.getAllDares({ creator: user._id || user.id, status: 'all' });
            const myTruths = await truthService.getAllTruths({ creator: user._id || user.id });

            // Add type identifier
            const daresWithType = myDares.map(d => ({ ...d, type: 'dare' }));
            const truthsWithType = myTruths.map(t => ({ ...t, type: 'truth', title: t.question })); // Map question to title for uniform display

            // Sort by createdAt desc
            const combinedContent = [...daresWithType, ...truthsWithType].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

            setMyCreatedDares(combinedContent);
        } catch (error) {
            console.error("Failed to load dashboard data", error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenReview = (dare) => {
        setSelectedReviewDare(dare);
        setIsReviewOpen(true);
    };

    const handleVerifyProof = async (participantId, approved) => {
        try {
            if (!selectedReviewDare) return;

            if (selectedReviewDare.type === 'truth') {
                await truthService.verifyTruth(selectedReviewDare._id, {
                    participantId,
                    approved
                });
            } else {
                await dareService.verifyProof(selectedReviewDare._id, {
                    participantId,
                    approved
                });
            }
            showToast(`Submission ${approved ? 'Approved' : 'Rejected'}!`, approved ? 'success' : 'info');

            // Refresh data
            await fetchDashboardData();

            // Re-fetch the updated dare/truth from the fresh state to update the modal
            // We need to wait for state update or use the returned data from api directly if we refactor fetchDashboardData,
            // but since fetchDashboardData updates state, we can't easily grab it synchronously here unless we return it.
            // BETTER APPROACH: Manually update local state or re-find it.
            // For now, let's re-find it in the next render? No, we need it now.
            // Let's modify fetchDashboardData to return the data.

            // Temporarily, let's just close it. 
            // The user said "reject click karne ke baad vaha se hatt jana chaiye" (it should disappear from there).
            // If we close the modal, it "disappears".
            // If the user wants to keep reviewing, the modal should stay open but the item should go.

            // To support "modal stays open, item disappears":
            // We need to update selectedReviewDare with the new participants list.

            // Let's manually filter the participant in the current selectedReviewDare to update UI immediately
            setSelectedReviewDare(prev => {
                if (!prev) return null;
                return {
                    ...prev,
                    participants: prev.participants.map(p =>
                        (p.user === participantId || p.user?._id === participantId)
                            ? { ...p, status: approved ? 'completed' : 'rejected' }
                            : p
                    )
                };
            });

            if (approved) await refreshUser(); // Update balance if needed (though creator pays on creation)
        } catch (error) {
            console.error("Verification failed", error);
            showToast("Verification failed: " + (error.response?.data?.message || error.message), 'error');
        }
    };

    // Helper to count pending proofs
    const countPending = (dare) => {
        return dare.participants?.filter(p => p.status === 'pending_review').length || 0;
    };

    return (
        <div className="content-area" style={{ flexDirection: 'column', height: 'auto' }}>

            <ProofReviewModal
                isOpen={isReviewOpen}
                onClose={() => setIsReviewOpen(false)}
                dare={selectedReviewDare}
                onVerify={handleVerifyProof}
            />

            {/* Welcome Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <div>
                    <div style={{ color: 'var(--light-blue)', fontSize: '16px' }}>Welcome back,</div>
                    <div style={{ fontFamily: 'MiSans-Bold', fontSize: '32px', color: 'var(--off-white)' }}>
                        {user?.username || 'Guest'} 👋
                    </div>
                </div>

                {/* Dynamic Notification Bell */}
                <div style={{ position: 'relative' }} ref={notifRef}>
                    <div
                        onClick={() => setShowNotifications(!showNotifications)}
                        style={{
                            width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.1)',
                            position: 'relative', cursor: 'pointer', transition: 'all 0.2s',
                            backgroundColor: showNotifications ? 'rgba(74, 127, 167, 0.3)' : 'rgba(255,255,255,0.05)'
                        }}
                    >
                        <i className="ri-notification-3-fill" style={{ fontSize: '24px', color: 'var(--off-white)' }}></i>
                        {unreadCount > 0 && (
                            <div style={{ position: 'absolute', top: '10px', right: '12px', width: '10px', height: '10px', background: '#ff4757', borderRadius: '50%', border: '1px solid rgba(16, 20, 30, 0.8)' }}></div>
                        )}
                    </div>

                    <AnimatePresence>
                        {showNotifications && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                transition={{ duration: 0.2 }}
                                style={{
                                    position: 'absolute',
                                    top: '60px', /* Pushed down slightly */
                                    right: '0',
                                    width: '340px',
                                    maxHeight: '450px',
                                    background: 'rgba(11, 23, 43, 0.95)', /* Darker opaque background */
                                    border: '1px solid var(--glass-border)',
                                    borderRadius: '20px',
                                    boxShadow: '0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05)',
                                    backdropFilter: 'blur(20px)',
                                    overflow: 'hidden',
                                    zIndex: 9999, /* High z-index to prevent overlap */
                                    display: 'flex',
                                    flexDirection: 'column'
                                }}
                            >
                                {/* Triangle Arrow */}
                                <div style={{
                                    position: 'absolute',
                                    top: '-6px',
                                    right: '18px',
                                    width: '12px',
                                    height: '12px',
                                    background: 'rgba(11, 23, 43, 0.95)',
                                    borderTop: '1px solid var(--glass-border)',
                                    borderLeft: '1px solid var(--glass-border)',
                                    transform: 'rotate(45deg)',
                                    zIndex: 1
                                }}></div>

                                <div style={{
                                    padding: '16px 20px',
                                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    background: 'rgba(255,255,255,0.02)',
                                    zIndex: 2
                                }}>
                                    <h4 style={{ margin: 0, color: 'var(--off-white)', fontSize: '15px', fontFamily: 'MiSans-Medium' }}>
                                        Notifications
                                        {unreadCount > 0 && <span style={{ marginLeft: '8px', fontSize: '12px', color: 'rgba(255,255,255,0.5)', background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '10px' }}>{unreadCount} New</span>}
                                    </h4>
                                    <span
                                        onClick={async (e) => {
                                            e.stopPropagation();
                                            await notificationService.markAllRead();
                                            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
                                        }}
                                        style={{ fontSize: '12px', color: 'var(--light-blue)', cursor: 'pointer', opacity: 0.8 }}
                                        onMouseEnter={e => e.target.style.opacity = '1'}
                                        onMouseLeave={e => e.target.style.opacity = '0.8'}
                                    >
                                        Mark all read
                                    </span>
                                </div>

                                <div style={{ overflowY: 'auto', maxHeight: '380px', zIndex: 2 }} className="custom-scrollbar">
                                    {notifications.length === 0 ? (
                                        <div style={{ padding: '40px 20px', textAlign: 'center', color: 'rgba(255,255,255,0.4)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                                            <i className="ri-notification-off-line" style={{ fontSize: '24px', opacity: 0.5 }}></i>
                                            <span style={{ fontSize: '14px' }}>No notifications yet</span>
                                        </div>
                                    ) : (
                                        notifications.map(notif => (
                                            <div
                                                key={notif._id}
                                                onClick={() => handleNotificationClick(notif)}
                                                style={{
                                                    padding: '16px 20px',
                                                    borderBottom: '1px solid rgba(255,255,255,0.03)',
                                                    background: notif.isRead ? 'transparent' : 'linear-gradient(90deg, rgba(74, 127, 167, 0.15), transparent)',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    gap: '14px',
                                                    transition: 'all 0.2s',
                                                    alignItems: 'flex-start'
                                                }}
                                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                                                onMouseLeave={e => e.currentTarget.style.background = notif.isRead ? 'transparent' : 'linear-gradient(90deg, rgba(74, 127, 167, 0.15), transparent)'}
                                            >
                                                <div style={{
                                                    width: '40px', height: '40px', borderRadius: '50%',
                                                    background: 'rgba(74, 127, 167, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    flexShrink: 0,
                                                    border: '1px solid rgba(74, 127, 167, 0.2)'
                                                }}>
                                                    <i className={notif.type === 'system' ? "ri-information-fill" : "ri-flashlight-fill"} style={{ color: notif.type === 'system' ? '#4da6ff' : '#00ff80', fontSize: '18px' }}></i>
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <p style={{ margin: '0 0 6px', color: 'var(--off-white)', fontSize: '14px', lineHeight: '1.4' }}>
                                                        {notif.message}
                                                    </p>
                                                    <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', display: 'block' }}>
                                                        {new Date(notif.createdAt).toLocaleString()}
                                                    </span>
                                                </div>
                                                {!notif.isRead && (
                                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#00ff80', marginTop: '8px', boxShadow: '0 0 10px #00ff80' }}></div>
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            <div className="dashboard-grid">

                {/* Left Column (Main) */}
                <div className="dashboard-main">

                    {/* Balance Card */}
                    <div style={{
                        background: 'linear-gradient(135deg, var(--medium-blue), var(--dark-blue))',
                        borderRadius: '24px',
                        padding: '30px',
                        border: '1px solid var(--glass-border)',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                        marginBottom: '30px',
                        position: 'relative',
                        overflow: 'hidden',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <div style={{ position: 'relative', zIndex: 1 }}>
                            <div style={{ fontSize: '16px', color: 'rgba(255,255,255,0.7)', marginBottom: '8px' }}>Total Balance</div>
                            <div style={{ fontSize: '48px', fontFamily: 'MiSans-Bold', color: '#fff', marginBottom: '8px' }}>
                                {user?.walletBalance !== undefined ? user.walletBalance.toLocaleString() : '0'} <span style={{ fontSize: '20px' }}>DRC</span>
                            </div>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <div style={{ fontSize: '14px', color: '#00ff80', background: 'rgba(0,255,128,0.1)', padding: '4px 12px', borderRadius: '20px' }}>To The Moon 🚀</div>
                                <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)' }}>Ready to play?</div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '16px', zIndex: 1 }}>
                            <button
                                onClick={() => navigate('/wallet')}
                                style={{
                                    background: 'rgba(255,255,255,0.15)', border: 'none', padding: '12px 24px', borderRadius: '12px',
                                    color: '#fff', cursor: 'pointer', fontFamily: 'MiSans-Medium', backdropFilter: 'blur(4px)'
                                }}>
                                Wallet
                            </button>
                            <button style={{
                                background: '#fff', border: 'none', padding: '12px 24px', borderRadius: '12px',
                                color: 'var(--dark-blue)', cursor: 'pointer', fontFamily: 'MiSans-Bold'
                            }}>
                                Top Up
                            </button>
                        </div>
                        <i className="ri-wallet-3-fill" style={{
                            position: 'absolute', right: '-20px', bottom: '-40px', fontSize: '200px', opacity: '0.05', color: '#fff'
                        }}></i>
                    </div>

                    {/* Manage My Dares (NEW) */}
                    <div style={{ marginBottom: '30px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <h3 className="dare-title-sm">Manage My Content</h3>
                            <span style={{ color: 'var(--light-blue)', fontSize: '14px', cursor: 'pointer' }}>View All</span>
                        </div>

                        {myCreatedDares.length === 0 ? (
                            <div style={{ padding: '30px', background: 'rgba(255,255,255,0.02)', borderRadius: '20px', textAlign: 'center', color: 'rgba(255,255,255,0.3)', border: '1px dashed rgba(255,255,255,0.1)' }}>
                                You haven't created any dares yet. Start creating!
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {myCreatedDares.map(dare => (
                                    <div key={dare._id} style={{
                                        background: 'rgba(26, 61, 99, 0.3)',
                                        borderRadius: '16px',
                                        padding: '16px',
                                        border: '1px solid rgba(255,255,255,0.05)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                            <img src="https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&q=80&w=100" alt="" style={{ width: '50px', height: '50px', borderRadius: '10px', objectFit: 'cover' }} />
                                            <div>
                                                <div style={{ color: '#fff', fontFamily: 'MiSans-Medium' }}>{dare.title}</div>
                                                <div style={{ color: 'var(--light-blue)', fontSize: '12px' }}>
                                                    {countPending(dare)} Submissions Pending • {dare.participants?.length || 0} Joined
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleOpenReview(dare)}
                                            style={{
                                                background: countPending(dare) > 0 ? '#00ff80' : 'rgba(255,255,255,0.1)',
                                                color: countPending(dare) > 0 ? '#000' : 'rgba(255,255,255,0.5)',
                                                border: 'none',
                                                padding: '8px 16px',
                                                borderRadius: '8px',
                                                cursor: 'pointer',
                                                fontWeight: 'bold',
                                                fontSize: '12px'
                                            }}
                                        >
                                            {countPending(dare) > 0 ? 'Review Proofs' : 'Manage'}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Active Challenges */}
                    <div style={{ marginBottom: '30px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <h3 className="dare-title-sm">Active Challenges</h3>
                            <span style={{ color: 'var(--light-blue)', fontSize: '14px', cursor: 'pointer' }}>View All</span>
                        </div>

                        <div style={{ display: 'flex', gap: '20px', overflowX: 'auto', paddingBottom: '10px' }} className="no-scrollbar">
                            {activeDares.map(dare => (
                                <div key={dare._id} style={{
                                    minWidth: '280px',
                                    background: 'rgba(26, 61, 99, 0.3)',
                                    borderRadius: '20px',
                                    padding: '16px',
                                    border: '1px solid rgba(255,255,255,0.05)',
                                    cursor: 'pointer'
                                }}>
                                    <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                                        <img src="https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&q=80&w=1000" alt="" style={{ width: '60px', height: '60px', borderRadius: '12px', objectFit: 'cover' }} />
                                        <div>
                                            <div style={{ color: '#fff', fontFamily: 'MiSans-Medium', marginBottom: '4px' }}>{dare.title}</div>
                                            <div style={{ color: 'var(--light-blue)', fontSize: '12px' }}>Ends in {dare.timeframe || '24h'}</div>
                                        </div>
                                    </div>
                                    <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>
                                        <span>Progress</span>
                                        <span>0%</span>
                                    </div>
                                    <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                                        <div style={{ width: `0%`, height: '100%', background: '#00ff80', borderRadius: '3px' }}></div>
                                    </div>
                                </div>
                            ))}

                            {/* Add New Placeholder */}
                            <div style={{
                                minWidth: '100px',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '2px dashed rgba(255,255,255,0.1)',
                                borderRadius: '20px',
                                cursor: 'pointer',
                                color: 'rgba(255,255,255,0.3)'
                            }} onClick={() => document.querySelector('.create-btn')?.click()}>
                                <i className="ri-add-circle-line" style={{ fontSize: '32px', marginBottom: '8px' }}></i>
                                <div style={{ fontSize: '12px' }}>Find New</div>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Right Column (Side) */}
                <div className="dashboard-sidebar">

                    {/* Quick Stats Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '30px' }}>
                        <div className="stat-card" style={{ padding: '20px', background: 'rgba(10, 25, 49, 0.6)' }}>
                            <i className="ri-vip-crown-2-fill" style={{ fontSize: '24px', color: '#ffd700', marginBottom: '8px' }}></i>
                            <div className="stat-value" style={{ fontSize: '20px' }}>{user?.rank ? `#${user.rank}` : '--'}</div>
                            <div className="stat-label" style={{ fontSize: '12px' }}>Global Rank</div>
                        </div>
                        <div className="stat-card" style={{ padding: '20px', background: 'rgba(10, 25, 49, 0.6)' }}>
                            <i className="ri-fire-fill" style={{ fontSize: '24px', color: '#ff4757', marginBottom: '8px' }}></i>
                            <div className="stat-value" style={{ fontSize: '20px' }}>12</div>
                            <div className="stat-label" style={{ fontSize: '12px' }}>Day Streak</div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div style={{ marginBottom: '30px' }}>
                        <h3 className="dare-title-sm" style={{ marginBottom: '16px' }}>Quick Actions</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            {quickActions.map((action, idx) => (
                                <div key={idx}
                                    onClick={action.action}
                                    style={{
                                        background: 'rgba(255,255,255,0.05)', borderRadius: '16px', padding: '16px',
                                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
                                        cursor: 'pointer', transition: 'all 0.2s', border: '1px solid transparent'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = 'rgba(74, 127, 167, 0.2)';
                                        e.currentTarget.style.border = '1px solid rgba(74, 127, 167, 0.3)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                                        e.currentTarget.style.border = '1px solid transparent';
                                    }}
                                >
                                    <i className={action.icon} style={{ fontSize: '24px', color: 'var(--light-blue)' }}></i>
                                    <span style={{ fontSize: '13px', color: 'var(--off-white)' }}>{action.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Recent Badges */}
                    <div>
                        <h3 className="dare-title-sm" style={{ marginBottom: '16px' }}>Recent Badges</h3>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                            {badges.map(badge => (
                                <div key={badge.id} style={{
                                    width: '48px', height: '48px', borderRadius: '12px',
                                    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    position: 'relative'
                                }} title={badge.name}>
                                    <i className={badge.icon} style={{ color: '#00ff80', fontSize: '20px' }}></i>
                                    <div style={{
                                        position: 'absolute', bottom: '-4px', right: '-4px',
                                        background: 'var(--medium-blue)', fontSize: '9px', padding: '2px 5px',
                                        borderRadius: '8px', color: '#fff'
                                    }}>Lvl {badge.level}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>

            </div>

        </div>
    );
}
