import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, useScroll, useTransform } from 'framer-motion';
import '../App.css';

export default function Landing() {
    const { scrollY } = useScroll();
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const floatingCardsOpacity = useTransform(scrollY, [0, 150], [0, 1]);
    const floatingCardsY = useTransform(scrollY, [0, 150], [150, 0]);

    // Force logout when visiting Landing page (Requested by User)
    React.useEffect(() => {
        if (user) {
            logout();
        }
    }, [user, logout]);

    const fadeInUp = {
        hidden: { opacity: 0, y: 60 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.8, ease: "easeOut" }
        }
    };

    const staggerContainer = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2
            }
        }
    };

    const cardHover = {
        hover: { y: -10, transition: { duration: 0.3 } }
    };

    return (
        <div style={{ paddingBottom: '100px', overflowX: 'hidden' }}>

            {/* Hero Section */}
            <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={staggerContainer}
                className="hero-section"
                style={{
                    minHeight: '90vh',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    gap: '32px',
                    position: 'relative',
                    overflow: 'hidden' // Ensure image doesn't spill out
                }}
            >
                {/* Advanced Cinematic Background */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    zIndex: -2,
                    overflow: 'hidden'
                }}>
                    {/* 1. Base Dark Blue Background (Depth) */}
                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        background: '#050B14'
                    }}></div>

                    {/* 2. The Skydiver Image - Blue Duotone Grade */}
                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        backgroundImage: 'url("/skydive-hero.jpg")',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        opacity: 0.6,
                        filter: 'grayscale(100%) sepia(100%) hue-rotate(190deg) saturate(3.5) brightness(0.6) contrast(1.2)',
                        mixBlendMode: 'luminosity'
                    }}></div>

                    {/* 3. Cyber Grid Overlay (Tech Feel) */}
                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        backgroundImage: `
                            linear-gradient(rgba(74, 127, 167, 0.08) 1px, transparent 1px), 
                            linear-gradient(90deg, rgba(74, 127, 167, 0.08) 1px, transparent 1px)
                        `,
                        backgroundSize: '40px 40px',
                        maskImage: 'linear-gradient(to bottom, black 40%, transparent 100%)' // Fade grid heavily at bottom
                    }}></div>

                    {/* 4. Vignette for Focus */}
                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'radial-gradient(circle at center, transparent 0%, #0A1931 90%)',
                        opacity: 0.8
                    }}></div>

                    {/* 5. Bottom smooth fade into content */}
                    <div style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        width: '100%',
                        height: '250px',
                        background: 'linear-gradient(to top, var(--dark-blue), transparent)'
                    }}></div>
                </div>

                {/* Central Glow Orb (Enhanced) */}
                <div style={{
                    position: 'absolute',
                    top: '40%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '800px',
                    height: '800px',
                    background: 'radial-gradient(circle, rgba(74, 127, 167, 0.2) 0%, transparent 70%)',
                    filter: 'blur(80px)',
                    zIndex: -1,
                    mixBlendMode: 'screen' // Makes it glow nicely over the dark image
                }}></div>

                <motion.div variants={fadeInUp} style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    padding: '8px 24px',
                    borderRadius: '100px',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    color: 'var(--light-blue)',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    letterSpacing: '2px',
                    textTransform: 'uppercase',
                    backdropFilter: 'blur(10px)'
                }}>
                    Adrenaline Pays Off
                </motion.div>

                <motion.h1 variants={fadeInUp} style={{
                    fontFamily: 'MiSans-Bold',
                    fontSize: '96px',
                    lineHeight: '1.1',
                    letterSpacing: '-2px',
                    background: 'linear-gradient(135deg, #fff 0%, #B3CFE5 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    textShadow: '0 10px 30px rgba(0,0,0,0.2)'
                }}>
                    LIVE ON THE EDGE.<br />EARN REWARDS.
                </motion.h1>

                <motion.p variants={fadeInUp} style={{
                    fontSize: '22px',
                    color: 'rgba(255,255,255,0.7)',
                    maxWidth: '650px',
                    lineHeight: '1.6',
                    textShadow: '0 2px 4px rgba(0,0,0,0.5)'
                }}>
                    Turn your fears into fortune. Upload your extreme moments,Do wild dares, upload proof, earn coins, and flex your bravery.
                </motion.p>

                <motion.div variants={fadeInUp} style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate(user ? '/dashboard' : '/login')}
                        className="accept-btn"
                        style={{ width: 'auto', padding: '18px 48px', minWidth: '220px', borderRadius: '100px' }}
                    >
                        Explore Dares
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.1)' }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate('/login')}
                        style={{
                            padding: '18px 48px',
                            background: 'transparent',
                            border: '1px solid rgba(255,255,255,0.2)',
                            borderRadius: '100px',
                            color: 'white',
                            fontSize: '18px',
                            fontFamily: 'MiSans-Bold',
                            cursor: 'pointer'
                        }}
                    >
                        Login
                    </motion.button>
                </motion.div>

                {/* Floating "Live Dares" Cards - Scroll Triggered Entrance */}
                <motion.div style={{
                    position: 'absolute',
                    inset: 0,
                    opacity: floatingCardsOpacity,
                    y: floatingCardsY,
                    pointerEvents: 'none', // Allow clicking through to text/buttons when hidden
                    zIndex: 1
                }}>
                    {/* Card 1: Left Flank (Boat Dive) */}
                    <motion.div
                        animate={{ y: [0, -20, 0] }}
                        transition={{
                            duration: 6, repeat: Infinity, ease: "easeInOut"
                        }}
                        style={{
                            position: 'absolute',
                            left: '5%',
                            top: '20%',
                            width: '240px',
                            background: 'rgba(255,255,255,0.1)',
                            backdropFilter: 'blur(10px)',
                            padding: '10px',
                            borderRadius: '20px',
                            border: '1px solid rgba(255,255,255,0.2)',
                            transform: 'rotate(-5deg)',
                            boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                            pointerEvents: 'auto'
                        }}
                    >
                        <img src="/hero-card-1.jpg" alt="Dive" style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '15px' }} />
                        <div style={{ padding: '10px 5px 5px' }}>
                            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginBottom: '4px' }}>@alex_jumps</div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '14px', fontWeight: 'bold' }}>Cliff Dive 30m</span>
                                <span style={{ fontSize: '14px', color: '#FFD700', fontWeight: 'bold' }}>500 DRC</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Card 2: Right Flank (Skydiving) */}
                    <motion.div
                        animate={{ y: [0, -30, 0] }}
                        transition={{
                            y: { duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }
                        }}
                        style={{
                            position: 'absolute',
                            right: '5%',
                            top: '15%',
                            width: '260px',
                            background: 'rgba(255,255,255,0.1)',
                            backdropFilter: 'blur(10px)',
                            padding: '10px',
                            borderRadius: '20px',
                            border: '1px solid rgba(255,255,255,0.2)',
                            transform: 'rotate(8deg)',
                            boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                            pointerEvents: 'auto'
                        }}
                    >
                        <img src="/hero-card-2.jpg" alt="Skydiving" style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '15px' }} />
                        <div style={{ padding: '10px 5px 5px' }}>
                            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginBottom: '4px' }}>@sarah_sky</div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '14px', fontWeight: 'bold' }}>HALO Jump</span>
                                <span style={{ fontSize: '14px', color: '#FFD700', fontWeight: 'bold' }}>2500 DRC</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Card 3: Bottom Right (Funny/Cows) */}
                    <motion.div
                        animate={{ rotate: [5, 10, 5] }} // Subtle rotation waggle
                        transition={{
                            rotate: { duration: 5, repeat: Infinity, ease: "easeInOut" }
                        }}
                        style={{
                            position: 'absolute',
                            right: '15%',
                            bottom: '10%',
                            width: '200px',
                            background: 'rgba(255,255,255,0.1)',
                            backdropFilter: 'blur(10px)',
                            padding: '10px',
                            borderRadius: '20px',
                            border: '1px solid rgba(255,255,255,0.2)',
                            transform: 'rotate(5deg)',
                            boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                            zIndex: 10, // Bring this one front
                            pointerEvents: 'auto'
                        }}
                    >
                        <img src="/hero-card-3.jpg" alt="Cows" style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: '15px' }} />
                        <div style={{ padding: '10px 5px 5px' }}>
                            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginBottom: '4px' }}>@gang_cows</div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '14px', fontWeight: 'bold' }}>Cool Fit Check</span>
                                <span style={{ fontSize: '14px', color: '#FFD700', fontWeight: 'bold' }}>100 DRC</span>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            </motion.div>
            <br></br>
            {/* How It Works */}
            <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={staggerContainer}
                style={{ maxWidth: '1400px', margin: '0 auto', textAlign: 'center', padding: '0 40px' }}
            >
                <motion.h2 variants={fadeInUp} style={{ fontFamily: 'MiSans-Bold', fontSize: '48px', marginBottom: '60px' }}>How It Works</motion.h2>

                <div className="landing-grid-3">
                    {[
                        { step: '01', title: 'Find a Dare', icon: 'ri-search-eye-line', desc: 'Browse trending challenges. Filter by difficulty or reward.' },
                        { step: '02', title: 'Upload Proof', icon: 'ri-camera-lens-fill', desc: 'Record yourself doing the challenge and upload video proof.' },
                        { step: '03', title: 'Get Paid', icon: 'ri-coin-fill', desc: 'Instant verification by smart contract releases funds to you.' }
                    ].map((item, i) => (
                        <motion.div
                            key={i}
                            variants={fadeInUp}
                            whileHover="hover"
                            className="glass-card"
                            style={{
                                padding: '50px 40px',
                                background: 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)',
                                borderRadius: '32px',
                                border: '1px solid rgba(255,255,255,0.05)',
                                textAlign: 'left',
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                        >
                            <motion.div variants={cardHover} style={{ width: '100%' }}>
                                <div style={{ fontSize: '14px', color: 'var(--light-blue)', marginBottom: '20px', letterSpacing: '2px', opacity: 0.8 }}>STEP {item.step}</div>
                                <div style={{ fontSize: '48px', color: 'white', marginBottom: '24px' }}>
                                    <i className={item.icon}></i>
                                </div>
                                <h3 style={{ fontSize: '32px', fontFamily: 'MiSans-Bold', marginBottom: '16px' }}>{item.title}</h3>
                                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '18px', lineHeight: '1.6' }}>{item.desc}</p>
                            </motion.div>
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            {/* Trending Truths - Redesigned Organic Flow */}
            <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={staggerContainer}
                style={{ maxWidth: '1400px', margin: '140px auto 0', padding: '0 40px', position: 'relative' }}
            >
                <motion.div variants={fadeInUp} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', marginBottom: '80px' }}>
                    <h2 style={{ fontFamily: 'MiSans-Bold', fontSize: '42px' }}>Trending Truths</h2>
                    <div
                        onClick={() => navigate(user ? '/dashboard' : '/login')}
                        style={{ color: 'var(--light-blue)', cursor: 'pointer', fontSize: '18px' }}
                    >
                        View All <i className="ri-arrow-right-line"></i>
                    </div>
                </motion.div>

                <div style={{ position: 'relative', height: '600px', width: '100%', overflow: 'hidden' }}>
                    {/* SVG Connector Line Background - Hidden on mobile via CSS ideally, or just kept as is (it's absolute) */}
                    {/* For simplicity allowing SVG to stay, it sits behind. */}
                    <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none' }}>
                        <path
                            d="M200,100 C400,100 400,300 600,300 C800,300 800,100 1000,100 C1200,100 1200,300 1300,300"
                            fill="none"
                            stroke="rgba(255,255,255,0.1)"
                            strokeWidth="2"
                            strokeDasharray="10,10"
                        />
                    </svg>

                    {[
                        {
                            id: 1,
                            top: '20px',
                            left: '50px',
                            rotate: '-5deg',
                            text: "I kept my ex's Netflix password for 3 years without them knowing.",
                            bg: 'linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%)',
                            color: '#0A1931'
                        },
                        {
                            id: 2,
                            top: '250px',
                            left: '350px',
                            rotate: '3deg',
                            text: "I told my boss I was sick so I could go to a concert. He was there too.",
                            bg: 'linear-gradient(135deg, #f0f8ff 0%, #e6f3ff 100%)',
                            color: '#0A1931'
                        },
                        {
                            id: 3,
                            top: '50px',
                            left: '700px',
                            rotate: '-3deg',
                            text: "I secretly eat my roommate's snacks and blame it on 'mice'.",
                            bg: 'linear-gradient(135deg, #fff0f5 0%, #ffe6f0 100%)',
                            color: '#0A1931'
                        },
                        {
                            id: 4,
                            top: '280px',
                            left: '1000px',
                            rotate: '5deg',
                            text: "I haven't washed my favorite lucky socks since 2022.",
                            bg: 'linear-gradient(135deg, #f5f5f5 0%, #ebebeb 100%)',
                            color: '#0A1931'
                        }
                    ].map((item, i) => (
                        <motion.div
                            key={item.id}
                            variants={fadeInUp}
                            whileHover={{ scale: 1.05, rotate: 0, zIndex: 10 }}
                            className="hero-floating-card" // Reusing this class to hide on mobile if needed, or we just rely on container overflow
                            style={{
                                position: 'absolute',
                                top: item.top,
                                left: item.left,
                                width: '280px',
                                height: '280px',
                                background: item.bg,
                                borderRadius: '30px',
                                padding: '40px 30px',
                                transform: `rotate(${item.rotate})`,
                                boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
                                color: item.color,
                                border: '1px solid rgba(255,255,255,0.5)',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                textAlign: 'center'
                            }}
                        >
                            {/* Hole Punch Effect */}
                            <div style={{
                                position: 'absolute',
                                top: '15px',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                width: '12px',
                                height: '12px',
                                background: '#0A1931', // Matches main background to look like a hole
                                borderRadius: '50%',
                                boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.5)'
                            }}></div>

                            <div style={{
                                width: '40px',
                                height: '40px',
                                background: 'rgba(0,0,0,0.05)',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: '20px',
                                marginTop: '10px'
                            }}>
                                <span style={{ fontWeight: 'bold', fontSize: '14px', fontFamily: 'MiSans-Bold' }}>0{item.id}</span>
                            </div>

                            <p style={{
                                fontSize: '18px',
                                fontFamily: 'MiSans-Medium',
                                lineHeight: '1.5',
                                flex: 1,
                                display: 'flex',
                                alignItems: 'center'
                            }}>
                                "{item.text}"
                            </p>

                            <div style={{ fontSize: '12px', opacity: 0.5, marginTop: '20px', fontWeight: 'bold' }}>READ FULL TRUTH</div>
                        </motion.div>
                    ))}
                    {/* Check if mobile? If so, show a simple list instead of absolute cards? For now hiding via overflow on container */}
                </div>
            </motion.div>

            {/* Featured Gallery */}
            <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={staggerContainer}
                style={{ maxWidth: '1400px', margin: '140px auto 0', padding: '0 40px' }}
            >
                <motion.div variants={fadeInUp} style={{ textAlign: 'center', marginBottom: '60px' }}>
                    <h2 style={{ fontFamily: 'MiSans-Bold', fontSize: '48px', marginBottom: '16px' }}>Featured Dares</h2>
                    <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.5)' }}>The most popular challenges making waves right now.</p>
                </motion.div>

                <div className="landing-grid-4">
                    {/* Big Item */}
                    <motion.div
                        variants={fadeInUp}
                        whileHover={{ scale: 1.02 }}
                        className="featured-card-wide"
                        style={{
                            gridRow: 'span 2',
                            background: 'linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.9)), url("/download.jpg")',
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            borderRadius: '32px',
                            border: '1px solid rgba(255,255,255,0.1)',
                            position: 'relative',
                            display: 'flex',
                            alignItems: 'flex-end',
                            padding: '40px',
                            cursor: 'pointer'
                        }}
                    >
                        <div style={{ textAlign: 'left', width: '100%' }}>
                            <div style={{ background: 'var(--medium-blue)', padding: '6px 16px', borderRadius: '100px', display: 'inline-block', fontSize: '12px', marginBottom: '16px', fontWeight: 'bold' }}>FEATURED</div>
                            <h3 style={{ fontSize: '42px', fontFamily: 'MiSans-Bold', marginBottom: '8px' }}>Skydiving Challenge</h3>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <p style={{ color: 'rgba(255,255,255,0.8)' }}>Jump from 10,000ft and scream "DareCoin!"</p>
                                <div style={{ fontSize: '24px', fontFamily: 'MiSans-Bold', color: '#FFD700' }}>2500 DRC</div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Small Item 2 */}
                    <motion.div
                        variants={fadeInUp}
                        whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.08)' }}
                        style={{
                            background: 'rgba(255,255,255,0.03)',
                            borderRadius: '32px',
                            border: '1px solid rgba(255,255,255,0.05)',
                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer'
                        }}
                    >
                        <i className="ri-fire-fill" style={{ fontSize: '56px', color: 'var(--medium-blue)', marginBottom: '16px' }}></i>
                        <div style={{ fontSize: '24px', fontFamily: 'MiSans-Bold' }}>Hot & New</div>
                    </motion.div>

                    {/* Small Item 3 */}
                    <motion.div
                        variants={fadeInUp}
                        whileHover={{ scale: 1.02, backgroundColor: 'rgba(74, 127, 167, 0.3)' }}
                        style={{
                            background: 'rgba(74, 127, 167, 0.2)',
                            borderRadius: '32px',
                            border: '1px solid rgba(255,255,255,0.05)',
                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer'
                        }}
                    >
                        <div style={{ fontSize: '56px', fontFamily: 'MiSans-Bold', color: 'white' }}>50+</div>
                        <div style={{ fontSize: '16px', opacity: 0.7 }}>New Dares Today</div>
                    </motion.div>

                    {/* Wide Item 4 */}
                    <motion.div
                        variants={fadeInUp}
                        whileHover={{ scale: 1.02 }}
                        className="featured-card-wide"
                        style={{
                            background: 'linear-gradient(135deg, #1A3D63 0%, #0A1931 100%)',
                            borderRadius: '32px',
                            border: '1px solid rgba(255,255,255,0.05)',
                            padding: '40px',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'flex-start',
                            position: 'relative',
                            overflow: 'hidden'
                        }}
                    >
                        <i className="ri-drop-fill" style={{ position: 'absolute', right: '-20px', bottom: '-20px', fontSize: '200px', opacity: 0.05 }}></i>
                        <h3 style={{ fontSize: '32px', fontFamily: 'MiSans-Bold', marginBottom: '12px' }}>Ice Dip 30s</h3>
                        <p style={{ opacity: 0.7, fontSize: '16px', marginBottom: '32px', maxWidth: '300px' }}>Submerge yourself in ice water for 30 seconds. Prove your resilience.</p>
                        <button style={{ padding: '12px 32px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '100px', color: 'white', cursor: 'pointer', fontFamily: 'MiSans-Bold' }}>View Details</button>
                    </motion.div>
                </div>
            </motion.div>

            {/* Visionary Section */}
            <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={staggerContainer}
                style={{
                    margin: '140px 0',
                    background: 'rgba(255,255,255,0.02)',
                    borderTop: '1px solid rgba(255,255,255,0.05)',
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                    padding: '100px 0'
                }}
            >
                <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 40px' }} className="vision-section">
                    <motion.div variants={fadeInUp} style={{ flex: 1, height: '500px', borderRadius: '32px', overflow: 'hidden', position: 'relative' }}>
                        <img src="/ChatGPT Image Jan 1, 2026, 11_12_54 AM.png" alt="Vision" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(45deg, rgba(10,25,49,0.5), transparent)' }}></div>
                    </motion.div>

                    <motion.div variants={fadeInUp} style={{ flex: 1 }}>
                        <div style={{ color: 'var(--medium-blue)', fontWeight: 'bold', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '20px' }}>Our Mission</div>
                        <h2 style={{ fontFamily: 'MiSans-Bold', fontSize: '56px', marginBottom: '32px', lineHeight: '1.1' }}>Courage Generates Value.</h2>
                        <p style={{ fontSize: '18px', lineHeight: '1.8', color: 'rgba(255,255,255,0.7)', marginBottom: '40px' }}>
                            We believe in a world where doing the impossible feels rewarding instantly.
                            DareCoin turns real-life challenges into fun wins — no waiting, no approvals, just you, the dare, and the reward.                        </p>
                        <button className="accept-btn" style={{ width: 'auto', padding: '16px 40px', fontSize: '16px' }}>
                            READ OUR VISION
                        </button>
                    </motion.div>
                </div>
            </motion.div>

            {/* Testimonials */}
            <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={staggerContainer}
                style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 40px', textAlign: 'center' }}
            >
                <motion.h2 variants={fadeInUp} style={{ fontFamily: 'MiSans-Bold', fontSize: '42px', marginBottom: '60px' }}>Player Reviews</motion.h2>

                <div className="landing-grid-2">
                    {[
                        {
                            name: 'Sem Surti Boi',
                            role: 'Pro Challenger',
                            text: "DareCoin changed how I handle weekends. I used to just hang out, now I'm climbing rocks and earning DareCoin for it. The community verification is super fast!",
                            image: "/WhatsApp Image 2026-01-01 at 10.54.33 AM.jpeg"
                        },
                        {
                            name: 'Nanu Vasava',
                            role: 'Dare Enthusiast',
                            text: "I love the transparency. The smart contract executes immediately after the community votes. It's the most fun way to stack coins I've found yet.",
                            image: "/WhatsApp Image 2026-01-01 at 10.58.31 AM.jpeg"
                        }
                    ].map((item, i) => (
                        <motion.div
                            key={i}
                            variants={fadeInUp}
                            whileHover={{ y: -5 }}
                            style={{
                                padding: '50px',
                                background: 'rgba(255,255,255,0.9)',
                                borderRadius: '32px',
                                textAlign: 'left',
                                color: '#0A1931'
                            }}
                        >
                            <div style={{ display: 'flex', gap: '20px', marginBottom: '30px', alignItems: 'center' }}>
                                <div style={{ width: '60px', height: '60px', borderRadius: '50%', overflow: 'hidden', border: '2px solid #e0e0e0' }}>
                                    <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </div>
                                <div>
                                    <div style={{ fontWeight: 'bold', fontSize: '18px' }}>{item.name}</div>
                                    <div style={{ fontSize: '14px', opacity: 0.6, textTransform: 'uppercase', marginTop: '4px' }}>{item.role}</div>
                                </div>
                            </div>
                            <p style={{ lineHeight: '1.6', fontSize: '18px', fontStyle: 'italic', opacity: 0.9 }}>"{item.text}"</p>
                        </motion.div>
                    ))}
                </div>
            </motion.div>

        </div>
    );
}
