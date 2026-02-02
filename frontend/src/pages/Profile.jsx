import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService, dareService } from '../services/api';
import Stack from '../components/Stack';
import EditProfileModal from '../components/EditProfileModal';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import HighlightsModal from '../components/HighlightsModal';

export default function Profile() {
    const { user: authUser, refreshUser } = useAuth();
    const [activeTab, setActiveTab] = useState('completed');
    const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

    // Highlights Modal State
    const [isHighlightsModalOpen, setIsHighlightsModalOpen] = useState(false);

    const navigate = useNavigate();

    // Data States
    const [createdDares, setCreatedDares] = useState([]);
    const [joinedDares, setJoinedDares] = useState([]);
    const [loading, setLoading] = useState(true);

    // Dynamic Video Stack based on user highlights
    const [highlightStack, setHighlightStack] = useState([]);

    // Use auth data or fallbacks
    const [user, setUser] = useState({
        name: authUser?.name || authUser?.username || 'User',
        handle: authUser?.username || '@user',
        bio: authUser?.bio || 'Ready to dare.',
        followers: '0',
        following: '0',
        banner: authUser?.banner || 'https://picsum.photos/seed/banner/1200/400',
        avatar: authUser?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=User',
        favVideo: '',
        highlights: authUser?.highlights || []
    });

    useEffect(() => {
        const initProfile = async () => {
            if (refreshUser) await refreshUser();
            fetchUserData();
        };
        initProfile();
    }, []);

    const fetchUserData = async () => {
        if (!authUser) return;
        try {
            setLoading(true);
            const created = await dareService.getAllDares({ creator: authUser._id || authUser.id, status: 'all' });
            setCreatedDares(created);

            const joined = await dareService.getAllDares({ participant: authUser._id || authUser.id, status: 'all' });
            setJoinedDares(joined);
        } catch (error) {
            console.error("Failed to fetch profile dares", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (authUser) {
            setUser(prev => ({
                ...prev,
                name: authUser.name || authUser.username,
                handle: authUser.username,
                bio: authUser.bio || prev.bio,
                avatar: authUser.avatar || prev.avatar,
                banner: authUser.banner || prev.banner,
                highlights: authUser.highlights || []
            }));

            // Map highlights to stack format
            if (authUser.highlights && authUser.highlights.length > 0) {
                const stack = authUser.highlights.map((h, index) => {
                    // h is either an ID (if not populated) or populated object
                    // Assuming populated from authController update
                    // We need to find the proof URL from participants if it's a Dare object
                    // But authUser.highlights might not have participants deep populated with proof logic handled there?
                    // Actually checking authController: it just does await user.populate('highlights'). 
                    // Dare model has participants array. We need to find the current user's proof.

                    const myParticipantEntry = h.participants?.find(p => p.user === authUser._id || p.user === authUser.id);
                    const proofUrl = myParticipantEntry?.proofUrl || h.image || "https://images.unsplash.com/photo-1480074568708-e7b720bb3f09?q=80&w=500";

                    // Use Dare's cover image as thumbnail if the proof is a video
                    const thumbnail = proofUrl.includes('.mp4') ? (h.image || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=500") : proofUrl;

                    return {
                        id: h._id || index + 1,
                        thumbnail: thumbnail,
                        video: proofUrl.includes('.mp4') ? proofUrl : null,
                        image: !proofUrl.includes('.mp4') ? proofUrl : null,
                        title: h.title,
                        description: h.description,
                        likes: Math.floor(Math.random() * 500) + 50, // Mock likes for variety
                        views: Math.floor(Math.random() * 2000) + 500
                    };
                });
                setHighlightStack(stack);
                setActiveVideoIndex(stack.length - 1);
            } else {
                setHighlightStack([]);
            }
            fetchUserData();
        }
    }, [authUser]);

    const handleToggleHighlight = async (dareId, action) => {
        try {
            await authService.updateHighlights({ dareId, action });
            if (refreshUser) await refreshUser();
        } catch (error) {
            console.error("Failed to toggle highlight", error);
        }
    };

    // Helper to get COMPLETED dares for the modal
    const getCompletedForHighlights = () => {
        return joinedDares.filter(d => {
            const myP = d.participants.find(p => p.user._id === authUser?.id || p.user === authUser?.id);
            return myP?.status === 'completed' && myP?.proofUrl;
        }).map(d => ({
            _id: d._id,
            title: d.title,
            proofUrl: d.participants.find(p => p.user._id === authUser?.id || p.user === authUser?.id).proofUrl
        }));
    };

    const handleSaveProfile = async (data) => {
        let updatedUser;
        try {
            if (data instanceof FormData) {
                updatedUser = await authService.updateProfile(data);
            } else {
                const payload = {
                    ...data,
                    name: data.name,
                    username: data.handle
                };
                updatedUser = await authService.updateProfile(payload);
            }

            if (refreshUser) await refreshUser();

            // Update local state with returned data (essential for file upload URLs)
            setUser(prev => ({
                ...prev,
                name: updatedUser.name,
                handle: updatedUser.username,
                bio: updatedUser.bio,
                avatar: updatedUser.avatar,
                banner: updatedUser.banner,
                favVideo: updatedUser.favVideo,
                highlights: updatedUser.highlights
            }));
        } catch (error) {
            console.error("Failed to update profile", error);
            throw error; // Propagate to modal to show error
        }
    };
    const [activeVideoIndex, setActiveVideoIndex] = useState(0); // State for active video

    const pinnedItems = [
        { type: 'truth', question: 'What is your biggest fear?', answer: 'Running out of coffee ☕', id: 1 },
        { type: 'truth', question: 'Last lie you told?', answer: 'I have read the terms and conditions.', id: 2 }
    ];

    // Memoize cards to prevent Stack component from resetting on every render
    const stackCards = React.useMemo(() => highlightStack.map((item, i) => (
        <div key={item.id} style={{ width: '100%', height: '100%', position: 'relative' }}>
            {item.image ? (
                <img
                    src={item.image}
                    alt={item.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
            ) : (
                <img
                    src={item.thumbnail}
                    alt={item.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
            )}

            <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '60px',
                height: '60px',
                background: 'rgba(0,0,0,0.4)',
                backdropFilter: 'blur(5px)',
                borderRadius: '50%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                border: '1px solid rgba(255,255,255,0.3)',
                zIndex: 2
            }}>
                <i className="ri-play-fill" style={{ fontSize: '30px', color: '#fff', marginLeft: '3px' }}></i>
            </div>
        </div>
    )), [highlightStack]);

    // ... (badges code remains same) ...

    const badges = [
        { id: 1, icon: 'ri-trophy-line', label: 'Top Earner', color: '#FFD700' },
        { id: 2, icon: 'ri-fire-fill', label: '10 Day Streak', color: '#ff6b6b' },
        { id: 3, icon: 'ri-user-star-line', label: 'Verified', color: '#00ff80' },
        { id: 4, icon: 'ri-camera-lens-fill', label: 'Pro Creator', color: '#4AF0FF' }
    ];

    const getActiveDares = () => {
        // ... (existing logic) ...
        const mapDare = (d) => ({
            id: d._id,
            title: d.title,
            status: d.status,
            likes: 0,
            image: d.participants?.find(p => p.status === 'completed' && p.proofUrl)?.proofUrl || "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&q=80&w=500"
        });

        switch (activeTab) {
            case 'created':
                return createdDares.map(mapDare);
            case 'liked':
                return [];
            default: // completed
                return joinedDares.filter(d => {
                    const myParticipation = d.participants.find(p => p.user._id === authUser?.id || p.user === authUser?.id);
                    return myParticipation?.status === 'completed' || d.status === 'completed';
                }).map(mapDare);
        }
    };

    const currentDares = getActiveDares();

    return (
        <div className="content-area" style={{ flexDirection: 'column', height: 'auto', position: 'relative' }}>
            {/* ... (Header/Icon code) ... */}
            <div style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 10 }}>
                <button
                    onClick={() => navigate('/settings')}
                    style={{
                        background: 'rgba(0,0,0,0.4)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '50%',
                        width: '44px',
                        height: '44px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        color: 'white',
                        transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = 'rotate(90deg)'; e.currentTarget.style.background = 'rgba(0,0,0,0.7)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = 'rotate(0deg)'; e.currentTarget.style.background = 'rgba(0,0,0,0.4)'; }}
                >
                    <i className="ri-settings-3-line" style={{ fontSize: '24px' }}></i>
                </button>
            </div>

            <EditProfileModal
                isOpen={isEditProfileOpen}
                onClose={() => setIsEditProfileOpen(false)}
                user={user}
                onSave={handleSaveProfile}
            />

            {/* Banner */}
            <div style={{
                width: '100%',
                height: '250px',
                borderRadius: '24px',
                background: user.banner.includes('http') ? `url('${user.banner}') center/cover no-repeat` : '#1a2c4e',
                position: 'relative',
                overflow: 'hidden',
                border: '1px solid var(--glass-border)',
                boxShadow: 'var(--glass-shadow)',
                marginBottom: '20px'
            }}>
                <div className="video-overlay" style={{ background: 'rgba(0,0,0,0.2)' }}></div>
            </div>

            {/* Main Profile Card */}
            <div className="profile-main-card">
                <div style={{
                    width: '160px',
                    height: '160px',
                    borderRadius: '20px',
                    overflow: 'hidden',
                    border: '2px solid var(--medium-blue)',
                    flexShrink: 0,
                    background: '#000'
                }}>
                    <img src={user.avatar} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div className="profile-header-flex">
                        <div>
                            <h2 className="dare-title-sm" style={{ fontSize: '32px', marginBottom: '4px' }}>{user.name}</h2>
                            <div style={{ color: 'var(--light-blue)', fontSize: '16px' }}>{user.handle}</div>
                        </div>
                        <div className="profile-stats-group">
                            <div>
                                <div style={{ fontFamily: 'MiSans-Bold', fontSize: '22px', color: 'var(--off-white)' }}>{user.followers}</div>
                                <div style={{ fontSize: '14px', color: 'var(--light-blue)' }}>Followers</div>
                            </div>
                            <div>
                                <div style={{ fontFamily: 'MiSans-Bold', fontSize: '22px', color: 'var(--off-white)' }}>{user.following}</div>
                                <div style={{ fontSize: '14px', color: 'var(--light-blue)' }}>Following</div>
                            </div>
                            <button
                                className="accept-btn"
                                onClick={() => setIsEditProfileOpen(true)}
                                style={{
                                    width: 'auto',
                                    padding: '8px 20px',
                                    fontSize: '14px',
                                    marginTop: 0,
                                    background: 'rgba(255, 255, 255, 0.1)',
                                    border: '1px solid #00ff80',
                                    color: '#00ff80',
                                    borderRadius: '12px',
                                    fontWeight: 'bold',
                                    boxShadow: '0 0 10px rgba(0, 255, 128, 0.1)',
                                    height: 'fit-content'
                                }}
                            >
                                Edit Profile
                            </button>
                        </div>
                    </div>

                    <div style={{
                        background: 'rgba(0,0,0,0.2)',
                        padding: '16px',
                        borderRadius: '12px',
                        color: 'var(--off-white)',
                        fontSize: '15px',
                        lineHeight: '1.5',
                        border: '1px solid rgba(255,255,255,0.05)'
                    }}>
                        {user.bio}
                    </div>

                    {/* Badges Section */}
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                        {badges.map(badge => (
                            <div key={badge.id} style={{
                                display: 'flex', alignItems: 'center', gap: '8px',
                                padding: '6px 12px',
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '20px',
                                fontSize: '13px',
                                color: 'var(--off-white)'
                            }}>
                                <i className={badge.icon} style={{ color: badge.color, fontSize: '16px' }}></i>
                                <span>{badge.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Pinned Truths */}
            <h3 className="dare-title-sm" style={{ marginBottom: '16px' }}>Pinned Truths</h3>
            <div className="pinned-grid">
                {pinnedItems.map(item => (
                    <div key={item.id} style={{
                        background: 'rgba(26, 61, 99, 0.25)',
                        border: '1px solid rgba(179, 207, 229, 0.1)',
                        borderRadius: '20px',
                        padding: '24px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px'
                    }}>
                        <div style={{
                            background: 'rgba(10, 25, 49, 0.5)',
                            padding: '12px',
                            borderRadius: '12px',
                            color: 'var(--light-blue)',
                            fontSize: '14px',
                            fontStyle: 'italic'
                        }}>
                            " {item.question} "
                        </div>
                        <div style={{
                            color: 'var(--off-white)',
                            fontFamily: 'MiSans-Medium',
                            fontSize: '18px',
                            paddingLeft: '8px'
                        }}>
                            {item.answer}
                        </div>
                    </div>
                ))}
            </div>

            <HighlightsModal
                isOpen={isHighlightsModalOpen}
                onClose={() => setIsHighlightsModalOpen(false)}
                completedDares={getCompletedForHighlights()}
                currentHighlights={user.highlights}
                onToggleHighlight={handleToggleHighlight}
            />

            {/* Featured Video / Highlights Stack */}
            <h3 className="dare-title-sm" style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                Highlights
                <button
                    onClick={() => setIsHighlightsModalOpen(true)}
                    style={{
                        background: 'rgba(0, 255, 128, 0.1)', border: '1px solid #00ff80', color: '#00ff80',
                        width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer'
                    }}
                >
                    <i className="ri-add-line"></i>
                </button>
            </h3>

            <div style={{
                display: 'flex',
                gap: '30px',
                height: '400px',
                marginBottom: '40px'
            }}>
                {/* Left: Stack of Cards */}
                <div style={{ flex: '1', position: 'relative', minWidth: '300px' }}>
                    {highlightStack.length > 0 ? (
                        <>
                            <Stack
                                randomRotation={true}
                                sensitivity={180}
                                sendToBackOnClick={true}
                                onActiveChange={(index) => {
                                    // Stack uses raw index from 0 to length-1.
                                    // Our stack IDs are arbitrary, so index mapping is direct.
                                    console.log('Profile: onActiveChange', index);
                                    setActiveVideoIndex(index);
                                }}
                                cards={stackCards}
                            />
                            <div style={{
                                marginTop: '20px',
                                textAlign: 'center',
                                color: 'var(--light-blue)',
                                fontSize: '14px'
                            }}>
                                Tap card to cycle highlights <i className="ri-arrow-right-s-line" style={{ verticalAlign: 'middle' }}></i>
                            </div>
                        </>
                    ) : (
                        <div style={{
                            width: '100%', height: '100%',
                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                            background: 'rgba(255,255,255,0.05)', borderRadius: '24px',
                            border: '1px dashed rgba(255,255,255,0.2)', color: 'var(--light-blue)'
                        }}>
                            <div style={{ marginBottom: '16px', fontSize: '14px' }}>No highlights yet</div>
                            <button
                                onClick={() => setIsHighlightsModalOpen(true)}
                                style={{
                                    padding: '8px 16px', background: '#00ff80', color: '#000',
                                    borderRadius: '12px', border: 'none', fontWeight: 'bold', cursor: 'pointer'
                                }}
                            >
                                Add Highlights
                            </button>
                        </div>
                    )}
                </div>

                {/* Right: Dynamic Video Player & Details */}
                <div style={{
                    flex: '1.5',
                    background: 'rgba(10, 25, 49, 0.6)',
                    backdropFilter: 'blur(16px)',
                    borderRadius: '24px',
                    padding: '0',
                    border: '1px solid var(--glass-border)',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    position: 'relative'
                }}>
                    {/* Video Player Area */}
                    <div style={{ height: '240px', background: '#000', position: 'relative' }}>
                        {highlightStack.length > 0 && highlightStack[activeVideoIndex]?.video ? (
                            <video
                                src={highlightStack[activeVideoIndex].video}
                                controls
                                loop
                                key={activeVideoIndex} // Key forces re-render/reset on change
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                        ) : highlightStack.length > 0 && highlightStack[activeVideoIndex]?.image ? (
                            <img
                                src={highlightStack[activeVideoIndex].image}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                        ) : (
                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666' }}>
                                {highlightStack.length > 0 ? 'No Media' : 'Select highlights to display'}
                            </div>
                        )}

                        {/* Overlay Tag */}
                        {highlightStack.length > 0 && (
                            <div style={{
                                position: 'absolute',
                                top: '15px',
                                left: '15px',
                                padding: '4px 10px',
                                background: 'rgba(0,0,0,0.6)',
                                backdropFilter: 'blur(4px)',
                                borderRadius: '8px',
                                fontSize: '12px',
                                color: '#00ff80',
                                fontWeight: 'bold',
                                border: '1px solid rgba(0, 255, 128, 0.3)'
                            }}>
                                Playing Now
                            </div>
                        )}
                    </div>

                    {/* Details Area */}
                    <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <div>
                            <h3 style={{ fontFamily: 'MiSans-Bold', fontSize: '24px', color: 'var(--off-white)', marginBottom: '8px' }}>
                                {highlightStack.length > 0 ? highlightStack[activeVideoIndex]?.title : 'Your Highlights'}
                            </h3>
                            <p style={{ color: 'var(--light-blue)', fontSize: '14px', lineHeight: '1.5' }}>
                                {highlightStack.length > 0 ? highlightStack[activeVideoIndex]?.description : 'Add completed dares to your highlights to showcase them here.'}
                            </p>
                        </div>

                        {/* Stats */}
                        {highlightStack.length > 0 && (
                            <div style={{ display: 'flex', gap: '20px', marginTop: '15px', paddingTop: '15px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--off-white)' }}>
                                    <i className="ri-heart-3-fill" style={{ color: '#ff6b6b' }}></i>
                                    <span>{highlightStack[activeVideoIndex]?.likes}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--off-white)' }}>
                                    <i className="ri-eye-fill" style={{ color: '#4AF0FF' }}></i>
                                    <span>{highlightStack[activeVideoIndex]?.views}</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* NEW: Content Tabs */}
            <div style={{ marginTop: '40px' }}>
                <div style={{ display: 'flex', gap: '30px', marginBottom: '24px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '10px' }}>
                    {['completed', 'created', 'liked'].map(tab => (
                        <div
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            style={{
                                cursor: 'pointer',
                                paddingBottom: '10px',
                                color: activeTab === tab ? '#00ff80' : 'rgba(255,255,255,0.4)',
                                borderBottom: activeTab === tab ? '2px solid #00ff80' : '2px solid transparent',
                                fontSize: '18px',
                                textTransform: 'capitalize',
                                fontWeight: activeTab === tab ? 'bold' : 'normal',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            {tab} <span style={{ fontSize: '14px', opacity: 0.7 }}>
                                {tab === 'completed' ? currentDares.length : tab === 'created' ? createdDares.length : '0'}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Dynamic Grid */}
                <motion.div
                    layout
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(4, 1fr)',
                        gap: '24px'
                    }}
                >
                    <AnimatePresence mode='popLayout'>
                        {currentDares.map(dare => (
                            <motion.div
                                key={dare.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.2 }}
                                className="dare-item"
                                style={{
                                    flexDirection: 'column',
                                    padding: '0',
                                    overflow: 'hidden',
                                    alignItems: 'stretch',
                                    gap: '0',
                                    background: 'rgba(255, 255, 255, 0.03)',
                                    border: '1px solid rgba(255, 255, 255, 0.05)',
                                    transition: 'all 0.3s ease',
                                    cursor: 'pointer'
                                }}
                            >
                                <div style={{ height: '150px', overflow: 'hidden', position: 'relative' }}>
                                    {dare.image.includes('.mp4') || dare.image.includes('.mov') ? (
                                        <video src={dare.image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <img src={dare.image} alt="Dare" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    )}
                                    <div style={{
                                        position: 'absolute',
                                        top: '10px',
                                        right: '10px',
                                        background: 'rgba(0,0,0,0.6)',
                                        borderRadius: '8px',
                                        padding: '4px 8px',
                                        fontSize: '12px',
                                        color: '#00ff80'
                                    }}>
                                        {activeTab === 'completed' ? 'Completed' : activeTab === 'created' ? 'Owner' : 'Liked'}
                                    </div>
                                </div>
                                <div style={{ padding: '16px' }}>
                                    <div style={{ color: 'var(--off-white)', fontSize: '18px', marginBottom: '8px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{dare.title}</div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--light-blue)', fontSize: '14px' }}>
                                        <span><i className="ri-heart-fill"></i> {dare.likes}</span>
                                        <span>View <i className="ri-arrow-right-line"></i></span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </motion.div>
            </div>

        </div>
    );
}
