import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { userService } from '../services/api';

const Leaderboard = () => {
    const [activeCategory, setActiveCategory] = useState('Global');
    const [leaderboardData, setLeaderboardData] = useState([]);
    const [loading, setLoading] = useState(true);

    const getCategoryParam = (cat) => {
        switch (cat) {
            case 'Global': return 'coins';
            case 'Friends': return 'completed'; // Mapping "Friends" UI tab to "Most Completed"
            case 'Activity': return 'creator';  // Mapping "Activity" UI tab to "Top Creators"
            case 'Info': return 'truth';        // Mapping "Info" UI tab to "Top Truths"
            default: return 'coins';
        }
    };

    const getCategoryTitle = (cat) => {
        switch (cat) {
            case 'Global': return 'Richest Players';
            case 'Friends': return 'Dare Devils';
            case 'Activity': return 'Masterminds';
            case 'Info': return 'Truth Seekers';
            default: return 'Leaderboard';
        }
    };

    useEffect(() => {
        const fetchLeaderboard = async () => {
            setLoading(true);
            try {
                const param = getCategoryParam(activeCategory);
                const data = await userService.getLeaderboard(param);

                const mappedData = data.map((user, index) => ({
                    id: user._id,
                    rank: index + 1,
                    name: user.name || user.username,
                    handle: user.username.startsWith('@') ? user.username : `@${user.username}`,
                    score: user.score,
                    metric: user.metric, // New field from backend
                    avatar: user.avatar,
                    change: 0
                }));
                setLeaderboardData(mappedData);
            } catch (error) {
                console.error("Failed to fetch leaderboard", error);
            } finally {
                setLoading(false);
            }
        };
        fetchLeaderboard();
    }, [activeCategory]);


    return (
        /* Main Glass Dashboard Container - DIRECTLY ROOT */
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass-panel"
            style={{
                width: '100%',
                height: 'calc(100vh - 220px)', // Adjust for container padding + header
                display: 'flex',
                flexDirection: 'row',
                overflow: 'hidden',
                position: 'relative',
                marginTop: '20px',
                borderRadius: '24px',
                background: 'var(--glass-bg)',
                border: '1px solid var(--glass-border)',
                backdropFilter: 'blur(16px)'
            }}
        >
            {/* ... (Left Sidebar code remains same, skipping lines for brevity) ... */}
            {/* Reuse existing sidebar code by not replacing it, but I replaced the whole Top Section so I must include it */}
            <div style={{
                width: '80px',
                borderRight: '1px solid var(--glass-border)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '40px 0',
                gap: '40px',
                zIndex: 2,
                background: 'rgba(0,0,0,0.2)'
            }}>
                {/* Active Indicator Line */}
                <div style={{
                    position: 'absolute',
                    left: 0,
                    width: '3px',
                    height: '30px',
                    background: 'var(--medium-blue)',
                    borderRadius: '0 4px 4px 0',
                    boxShadow: '0 0 10px rgba(74, 127, 167, 0.4)',
                    transform: activeCategory === 'Global' ? 'translateY(0)' :
                        activeCategory === 'Friends' ? 'translateY(70px)' :
                            activeCategory === 'Activity' ? 'translateY(140px)' : 'translateY(210px)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }}></div>

                <NavIcon icon="ri-trophy-fill" active={activeCategory === 'Global'} onClick={() => setActiveCategory('Global')} glowColor="#FFD700" />
                <NavIcon icon="ri-group-fill" active={activeCategory === 'Friends'} onClick={() => setActiveCategory('Friends')} />
                <NavIcon icon="ri-fire-fill" active={activeCategory === 'Activity'} onClick={() => setActiveCategory('Activity')} />
                <NavIcon icon="ri-information-fill" active={activeCategory === 'Info'} onClick={() => setActiveCategory('Info')} />
            </div>

            {/* Main Content Area */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '0', zIndex: 1 }}>

                {/* Header */}
                <div style={{
                    padding: '30px 40px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <div>
                        <h2 style={{ fontFamily: 'MiSans-Bold', fontSize: '28px', color: 'var(--off-white)', letterSpacing: '-0.5px' }}>
                            {getCategoryTitle(activeCategory)}
                        </h2>
                        <p style={{ color: 'var(--light-blue)', opacity: 0.6, fontSize: '14px', marginTop: '4px' }}>Top players this week</p>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <IconButton icon="ri-grid-fill" />
                        <IconButton icon="ri-notification-3-fill" />
                    </div>
                </div>

                {/* Table Header */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '80px 1fr 100px',
                    padding: '0 40px 10px',
                    color: 'var(--light-blue)',
                    opacity: 0.5,
                    fontSize: '13px',
                    fontWeight: '600',
                    fontFamily: 'MiSans-Normal',
                    textTransform: 'uppercase',
                    letterSpacing: '1px'
                }}>
                    <div>Rank</div>
                    <div>Player</div>
                    <div style={{ textAlign: 'right' }}>Score</div>
                </div>

                {/* Scrollable List */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px 20px' }} className="custom-scrollbar">
                    {loading ? (
                        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--light-blue)' }}>Loading rankings...</div>
                    ) : leaderboardData.length === 0 ? (
                        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--light-blue)', opacity: 0.7 }}>
                            <i className="ri-ghost-smile-line" style={{ fontSize: '48px', marginBottom: '16px', display: 'block' }}></i>
                            No players found in this category yet.
                        </div>
                    ) : (
                        <AnimatePresence mode='wait'>
                            {leaderboardData.map((user, index) => (
                                <motion.div
                                    key={user.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    whileHover={{ scale: 1.01, backgroundColor: 'rgba(255,255,255,0.03)' }}
                                    style={{
                                        display: 'grid',
                                        gridTemplateColumns: '60px 1fr 100px',
                                        alignItems: 'center',
                                        padding: '16px 20px',
                                        borderRadius: '16px',
                                        marginBottom: '8px',
                                        background: index === 0 ? 'linear-gradient(90deg, rgba(255, 215, 0, 0.1), rgba(255, 215, 0, 0.02))' : 'transparent',
                                        border: index === 0 ? '1px solid rgba(255, 215, 0, 0.2)' : '1px solid transparent',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {/* Rank */}
                                    <div style={{
                                        fontWeight: 'bold',
                                        fontSize: '16px',
                                        color: index < 3 ? 'var(--off-white)' : 'rgba(255,255,255,0.3)',
                                        width: '30px',
                                        textAlign: 'center',
                                        fontFamily: 'MiSans-Bold'
                                    }}>
                                        {user.rank}
                                    </div>

                                    {/* Player */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                        <img src={user.avatar} style={{ width: '40px', height: '40px', borderRadius: '50%', border: '1px solid var(--glass-border)' }} />
                                        <div>
                                            <div style={{ color: 'var(--off-white)', fontWeight: '600', fontFamily: 'MiSans-Medium' }}>{user.name}</div>
                                            <div style={{ color: 'var(--light-blue)', opacity: 0.5, fontSize: '12px' }}>{user.handle}</div>
                                        </div>
                                    </div>

                                    {/* Score */}
                                    <div style={{ textAlign: 'right', fontWeight: '700', fontSize: '16px', color: 'var(--light-blue)', fontFamily: 'MiSans-Bold' }}>
                                        {(user.score || 0).toLocaleString()}
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    )}
                </div>
            </div>

            {/* Mobile Nav Fix (CSS injected via style tag for simplicity in this component) */}
            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(74, 127, 167, 0.3); borderRadius: 10px; }
                @media (max-width: 768px) {
                    .glass-panel { flexDirection: column !important; height: calc(100vh - 100px) !important; marginTop: 0 !important; borderRadius: 0 !important; }
                    .glass-panel > div:first-child { 
                        width: 100% !important; 
                        height: 60px; 
                        flexDirection: row !important; 
                        borderRight: none !important;
                        borderBottom: 1px solid var(--glass-border);
                        padding: 0 20px !important;
                        justifyContent: space-around;
                    }
                }
            `}</style>
        </motion.div>
    );
}

const NavIcon = ({ icon, active, onClick, glowColor }) => (
    <div
        onClick={onClick}
        style={{
            fontSize: '24px',
            color: active ? 'var(--off-white)' : 'rgba(255,255,255,0.2)',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            filter: active && glowColor ? `drop-shadow(0 0 10px ${glowColor})` : 'none',
            position: 'relative'
        }}
    >
        <i className={icon}></i>
    </div>
);

const IconButton = ({ icon }) => (
    <div style={{
        width: '40px', height: '40px',
        borderRadius: '12px',
        background: 'rgba(255,255,255,0.05)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--light-blue)', fontSize: '18px', cursor: 'pointer',
        border: '1px solid transparent',
        transition: 'all 0.2s'
    }}
        onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(74, 127, 167, 0.2)';
            e.currentTarget.style.border = '1px solid var(--medium-blue)';
            e.currentTarget.style.color = 'var(--off-white)';
        }}
        onMouseLeave={e => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
            e.currentTarget.style.border = '1px solid transparent';
            e.currentTarget.style.color = 'var(--light-blue)';
        }}
    >
        <i className={icon}></i>
    </div>
);

export default Leaderboard;
