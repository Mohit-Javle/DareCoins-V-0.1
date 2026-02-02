import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';

export default function FeedReels({ items, initialIndex = 0, onClose }) {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const containerRef = useRef(null);

    // Handle Keyboard Navigation
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'ArrowUp') prevVideo();
            if (e.key === 'ArrowDown') nextVideo();
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [currentIndex]);

    const nextVideo = () => {
        if (currentIndex < items.length - 1) {
            const nextIdx = currentIndex + 1;
            setCurrentIndex(nextIdx);
            scrollToIndex(nextIdx);
        }
    };

    const prevVideo = () => {
        if (currentIndex > 0) {
            const prevIdx = currentIndex - 1;
            setCurrentIndex(prevIdx);
            scrollToIndex(prevIdx);
        }
    };

    const scrollToIndex = (index) => {
        if (containerRef.current) {
            const itemHeight = containerRef.current.clientHeight;
            containerRef.current.scrollTo({
                top: index * itemHeight,
                behavior: 'smooth'
            });
        }
    };

    // Initial scroll
    useEffect(() => {
        if (containerRef.current) {
            // Instant scroll on mount
            const itemHeight = containerRef.current.clientHeight;
            containerRef.current.scrollTop = initialIndex * itemHeight;
        }
    }, [initialIndex]);

    if (typeof document === 'undefined') return null;

    return createPortal(
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                background: '#000',
                zIndex: 2147483647, // Max Z-Index
                display: 'flex',
                flexDirection: 'column'
            }}
        >
            {/* Top Bar (Close) */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                padding: '20px',
                zIndex: 1000,
                background: 'linear-gradient(to bottom, rgba(0,0,0,0.6), transparent)',
                display: 'flex',
                alignItems: 'center'
            }}>
                <button
                    onClick={onClose}
                    style={{
                        background: 'rgba(255,255,255,0.15)',
                        border: 'none',
                        borderRadius: '50%',
                        width: '44px',
                        height: '44px',
                        color: '#fff',
                        cursor: 'pointer',
                        backdropFilter: 'blur(10px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
                >
                    <i className="ri-arrow-left-line" style={{ fontSize: '24px' }}></i>
                </button>
                <div style={{ marginLeft: '16px', fontWeight: 'bold', fontSize: '18px', textShadow: '0 2px 4px rgba(0,0,0,0.5)', color: '#fff' }}>
                    Reels
                </div>
            </div>

            {/* Main Scroll Container */}
            <div
                className="no-scrollbar"
                style={{
                    width: '100%',
                    height: '100%',
                    overflowY: 'scroll',
                    scrollSnapType: 'y mandatory',
                    scrollBehavior: 'smooth'
                }}
                ref={containerRef}
            >
                {items.map((item, index) => (
                    <ReelItem
                        key={item.id}
                        item={item}
                        isActive={index === currentIndex}
                        onInView={() => setCurrentIndex(index)}
                    />
                ))}
            </div>
        </motion.div>,
        document.body
    );
}

function ReelItem({ item, isActive, onInView }) {
    const videoRef = useRef(null);
    const observerRef = useRef(null);
    const [isMuted, setIsMuted] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);

    useEffect(() => {
        if (isActive && videoRef.current) {
            videoRef.current.currentTime = 0;
            const playPromise = videoRef.current.play();
            if (playPromise !== undefined) {
                playPromise.then(() => {
                    setIsPlaying(true);
                }).catch(e => {
                    console.log("Autoplay blocked", e);
                    setIsPlaying(false);
                });
            }
        } else if (videoRef.current) {
            videoRef.current.pause();
            setIsPlaying(false);
        }
    }, [isActive]);

    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
                setIsPlaying(false);
            } else {
                videoRef.current.play();
                setIsPlaying(true);
            }
        }
    };

    const toggleMute = (e) => {
        e.stopPropagation();
        if (videoRef.current) {
            videoRef.current.muted = !videoRef.current.muted;
            setIsMuted(videoRef.current.muted);
        }
    };

    // Intersection Observer
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    onInView();
                }
            },
            { threshold: 0.6 }
        );
        if (observerRef.current) observer.observe(observerRef.current);
        return () => observer.disconnect();
    }, [onInView]);

    return (
        <div
            ref={observerRef}
            style={{
                width: '100%',
                height: '100vh',
                scrollSnapAlign: 'start',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#000',
                overflow: 'hidden'
            }}
            onClick={togglePlay}
        >
            {/* Ambient Shadow Background */}
            <div style={{
                position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                backgroundImage: `url(${item.img || item.userAvatar})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                filter: 'blur(100px) brightness(0.3)',
                zIndex: 0
            }} />

            {/* Video Player */}
            <video
                ref={videoRef}
                src={item.videoUrl || item.url}
                loop
                playsInline
                style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain', // Changed to contain for full view without crop
                    position: 'relative',
                    zIndex: 1,
                    maxWidth: '800px' // Max width for desktop comfort
                }}
            />

            {/* Play/Pause Indicator (Overlay) */}
            {!isPlaying && isActive && (
                <div style={{
                    position: 'absolute',
                    zIndex: 5,
                    background: 'rgba(0,0,0,0.4)',
                    padding: '20px',
                    borderRadius: '50%',
                    backdropFilter: 'blur(5px)',
                    pointerEvents: 'none'
                }}>
                    <i className="ri-play-fill" style={{ fontSize: '40px', color: '#fff' }}></i>
                </div>
            )}

            {/* Bottom Overlay Content */}
            <div style={{
                position: 'absolute',
                bottom: '0',
                left: '0',
                width: '100%',
                padding: '20px 20px 40px 20px',
                background: 'linear-gradient(to top, rgba(0,0,0,0.95), rgba(0,0,0,0.5), transparent)',
                color: '#fff',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                zIndex: 10
            }} onClick={e => e.stopPropagation()}>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <img src={item.userAvatar || 'https://i.pravatar.cc/150'} alt=""
                            style={{ width: '48px', height: '48px', borderRadius: '50%', border: '2px solid #00ff80' }} />
                        <div>
                            <div style={{ fontWeight: 'bold', fontSize: '16px', fontFamily: 'MiSans-Bold' }}>@{item.user}</div>
                            <button style={{
                                background: 'rgba(255,255,255,0.1)', border: 'none',
                                color: '#00ff80', fontSize: '12px', padding: '2px 8px', borderRadius: '4px', marginTop: '2px', cursor: 'pointer'
                            }}>Follow</button>
                        </div>
                    </div>
                    {/* Mute Toggle */}
                    <button onClick={toggleMute} style={{
                        background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%',
                        width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', cursor: 'pointer'
                    }}>
                        <i className={isMuted ? "ri-volume-mute-fill" : "ri-volume-up-fill"} style={{ fontSize: '20px' }}></i>
                    </button>
                </div>

                <div style={{ paddingLeft: '4px' }}>
                    <h3 style={{ margin: '0 0 6px 0', fontSize: '18px', fontWeight: 'bold', color: '#fff' }}>{item.title}</h3>
                    <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.5', opacity: 0.9, maxWidth: '90%' }}>
                        {item.description || "No description provided for this dare proof."}
                    </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', opacity: 0.7, marginTop: '4px' }}>
                    <i className="ri-music-2-fill"></i>
                    <div className="marquee" style={{ overflow: 'hidden', whiteSpace: 'nowrap', width: '150px' }}>
                        <span>Original Audio - DareCoin Official • Original Audio - DareCoin Official •</span>
                    </div>
                </div>
            </div>

            {/* Right Side Actions */}
            <div style={{
                position: 'absolute',
                bottom: '120px',
                right: '10px',
                display: 'flex',
                flexDirection: 'column',
                gap: '24px',
                alignItems: 'center',
                zIndex: 10
            }} onClick={e => e.stopPropagation()}>
                <ActionIcon icon="ri-heart-3-fill" count={item.likes || "0"} color="#ff4757" />
                <ActionIcon icon="ri-chat-3-fill" count="0" />
                <ActionIcon icon="ri-share-forward-fill" count="Share" />

                <div style={{
                    width: '50px', height: '50px',
                    borderRadius: '50%',
                    background: '#1a1a1a',
                    border: '2px solid #333',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginTop: '20px',
                    animation: isPlaying ? 'spin 4s linear infinite' : 'none'
                }}>
                    <img src="https://ui-avatars.com/api/?name=Music" style={{ width: '30px', height: '30px', borderRadius: '50%' }} alt="" />
                </div>
            </div>

            <style>{`
                @keyframes spin { 100% { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
}

function ActionIcon({ icon, count, color = "#fff" }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
            <div style={{
                width: '45px', height: '45px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(5px)',
                transition: 'transform 0.2s',
                boxShadow: '0 4px 10px rgba(0,0,0,0.3)'
            }}>
                <i className={icon} style={{ fontSize: '26px', color: color }}></i>
            </div>
            <span style={{ fontSize: '13px', color: '#fff', fontWeight: '600', textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>{count}</span>
        </div>
    );
}
