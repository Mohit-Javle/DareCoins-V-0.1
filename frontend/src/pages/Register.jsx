import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import '../App.css';

export default function Register() {
    const navigate = useNavigate();
    const { register } = useAuth();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const [isMobile, setIsMobile] = useState(window.innerWidth < 1000);
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 1000);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await register({ username: name, email, password });
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            position: 'relative',
            width: '100vw',
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
        }}>

            {/* Back Button */}
            <motion.button
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={() => navigate('/')}
                style={{
                    position: 'absolute',
                    top: '40px',
                    left: '40px',
                    zIndex: 20,
                    width: '45px',
                    height: '45px',
                    borderRadius: '12px',
                    background: 'var(--glass-bg)',
                    border: '1px solid var(--glass-border)',
                    color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer',
                    backdropFilter: 'blur(10px)'
                }}
                whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.1)' }}
                whileTap={{ scale: 0.95 }}
            >
                <i className="ri-arrow-left-line" style={{ fontSize: '20px' }}></i>
            </motion.button>

            {/* Main Card */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                style={{
                    width: '90%',
                    maxWidth: '1100px',
                    height: '650px',
                    borderRadius: '30px',
                    display: 'flex',
                    flexDirection: isMobile ? 'column-reverse' : 'row',
                    overflow: 'hidden',
                    background: 'var(--glass-bg)',
                    border: '1px solid var(--glass-border)',
                    boxShadow: 'var(--glass-shadow)',
                    backdropFilter: 'blur(40px)',
                    WebkitBackdropFilter: 'blur(40px)'
                }}
            >
                {/* Left Side - Register Form */}
                <div style={{
                    flex: '1',
                    background: 'rgba(0,0,0,0.15)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    padding: isMobile ? '40px' : '60px',
                    borderRight: '1px solid var(--glass-border)'
                }}>
                    <div style={{ width: '100%', maxWidth: '400px', margin: '0 auto' }}>
                        <div style={{ marginBottom: '40px' }}>
                            <h2 style={{ fontSize: '32px', fontWeight: 'bold', color: '#fff', marginBottom: '8px' }}>Create Account</h2>
                            <p style={{ color: 'var(--light-blue)', fontSize: '15px' }}>Start your journey to become a legend.</p>
                        </div>

                        {error && (
                            <div style={{
                                background: 'rgba(255,71,87,0.1)', border: '1px solid rgba(255,71,87,0.3)',
                                color: '#ff4757', padding: '12px', borderRadius: '12px', marginBottom: '25px',
                                display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px'
                            }}>
                                <i className="ri-error-warning-fill"></i> {error}
                            </div>
                        )}

                        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            {/* Username */}
                            <div>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--light-blue)', marginBottom: '8px', marginLeft: '4px' }}>USERNAME</label>
                                <div style={{ position: 'relative' }}>
                                    <i className="ri-user-smile-line" style={{
                                        position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)',
                                        color: 'rgba(255,255,255,0.3)', fontSize: '18px'
                                    }}></i>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={e => setName(e.target.value)}
                                        placeholder="Choose a username"
                                        required
                                        style={{
                                            width: '100%', padding: '16px 16px 16px 48px',
                                            background: 'rgba(0, 0, 0, 0.2)',
                                            border: '1px solid var(--glass-border)',
                                            borderRadius: '12px',
                                            color: '#fff', fontSize: '16px', outline: 'none',
                                            transition: 'all 0.3s ease'
                                        }}
                                        onFocus={e => {
                                            e.target.style.borderColor = '#00f2fe';
                                            e.target.style.background = 'rgba(0, 0, 0, 0.3)';
                                        }}
                                        onBlur={e => {
                                            e.target.style.borderColor = 'var(--glass-border)';
                                            e.target.style.background = 'rgba(0, 0, 0, 0.2)';
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Email */}
                            <div>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--light-blue)', marginBottom: '8px', marginLeft: '4px' }}>EMAIL</label>
                                <div style={{ position: 'relative' }}>
                                    <i className="ri-mail-line" style={{
                                        position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)',
                                        color: 'rgba(255,255,255,0.3)', fontSize: '18px'
                                    }}></i>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        placeholder="user@example.com"
                                        required
                                        style={{
                                            width: '100%', padding: '16px 16px 16px 48px',
                                            background: 'rgba(0, 0, 0, 0.2)',
                                            border: '1px solid var(--glass-border)',
                                            borderRadius: '12px',
                                            color: '#fff', fontSize: '16px', outline: 'none',
                                            transition: 'all 0.3s ease'
                                        }}
                                        onFocus={e => {
                                            e.target.style.borderColor = '#00f2fe';
                                            e.target.style.background = 'rgba(0, 0, 0, 0.3)';
                                        }}
                                        onBlur={e => {
                                            e.target.style.borderColor = 'var(--glass-border)';
                                            e.target.style.background = 'rgba(0, 0, 0, 0.2)';
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--light-blue)', marginBottom: '8px', marginLeft: '4px' }}>PASSWORD</label>
                                <div style={{ position: 'relative' }}>
                                    <i className="ri-lock-line" style={{
                                        position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)',
                                        color: 'rgba(255,255,255,0.3)', fontSize: '18px'
                                    }}></i>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        required
                                        style={{
                                            width: '100%', padding: '16px 16px 16px 48px',
                                            background: 'rgba(0, 0, 0, 0.2)',
                                            border: '1px solid var(--glass-border)',
                                            borderRadius: '12px',
                                            color: '#fff', fontSize: '16px', outline: 'none',
                                            transition: 'all 0.3s ease'
                                        }}
                                        onFocus={e => {
                                            e.target.style.borderColor = '#00f2fe';
                                            e.target.style.background = 'rgba(0, 0, 0, 0.3)';
                                        }}
                                        onBlur={e => {
                                            e.target.style.borderColor = 'var(--glass-border)';
                                            e.target.style.background = 'rgba(0, 0, 0, 0.2)';
                                        }}
                                    />
                                </div>
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                disabled={loading}
                                type="submit"
                                style={{
                                    marginTop: '20px',
                                    width: '100%',
                                    padding: '18px',
                                    borderRadius: '12px',
                                    background: '#00f2fe',
                                    border: 'none',
                                    color: '#0A1931',
                                    fontSize: '16px',
                                    fontWeight: 'bold',
                                    letterSpacing: '0.5px',
                                    cursor: loading ? 'wait' : 'pointer',
                                    boxShadow: '0 4px 15px rgba(0, 242, 254, 0.3)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'
                                }}
                            >
                                {loading ? 'CREATING...' : 'LAUNCH LEGACY'}
                                {!loading && <i className="ri-rocket-fill"></i>}
                            </motion.button>
                        </form>

                        <div style={{ marginTop: '30px', textAlign: 'center', fontSize: '14px', color: 'var(--light-blue)' }}>
                            Already have an account? <Link to="/login" style={{ color: '#00f2fe', fontWeight: 'bold', textDecoration: 'none' }}>Log In</Link>
                        </div>
                    </div>
                </div>

                {/* Right Side - Visual */}
                <div style={{
                    flex: '1',
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    padding: '60px',
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.03), transparent)'
                }}>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}
                    >
                        <div style={{
                            width: '60px', height: '60px', borderRadius: '16px',
                            background: 'rgba(0, 242, 254, 0.1)',
                            border: '1px solid rgba(0, 242, 254, 0.2)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 0 30px rgba(0,242,254,0.1)',
                            marginBottom: '30px'
                        }}>
                            <i className="ri-rocket-fill" style={{ fontSize: '32px', color: '#00f2fe' }}></i>
                        </div>

                        <h1 style={{
                            fontSize: isMobile ? '36px' : '56px',
                            lineHeight: '1.1',
                            fontWeight: '800',
                            marginBottom: '24px',
                            color: '#fff'
                        }}>
                            Launch <br />
                            Your <span style={{ color: '#00f2fe' }}>Legacy.</span>
                        </h1>

                        <p style={{ fontSize: '18px', color: 'var(--light-blue)', lineHeight: '1.6', maxWidth: '400px', opacity: 0.9 }}>
                            "The greatest glory in living lies not in never falling, but in rising every time we fall."
                        </p>
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
}
