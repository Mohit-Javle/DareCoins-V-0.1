import { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { truthService } from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function CreateTruthModal({ onClose }) {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        question: '',
        targetUser: '', // Username (optional)
        category: 'Personal',
        difficulty: 'Level 1',
        reward: 50 // Default reward
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const categories = ['Personal', 'Funny', 'Deep', 'Dirty', 'Random', 'Crypto'];
    const difficulties = ['Level 1', 'Level 2', 'Level 3'];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const numericReward = parseInt(formData.reward) || 0;

        if (numericReward > 500) {
            setError('Maximum reward for Truths is 500 DRC');
            setLoading(false);
            return;
        }

        try {
            const payload = { ...formData, reward: numericReward };

            // Handle optional targetUser
            if (payload.targetUser && !payload.targetUser.match(/^[0-9a-fA-F]{24}$/)) {
                console.warn("Target user ID lookup not implemented yet. Sending without targetUser ID.");
                delete payload.targetUser;
            }

            await truthService.createTruth(payload);
            onClose();
            // navigate('/explore'); // Optional: stay on page or move
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Failed to create truth');
        } finally {
            setLoading(false);
        }
    };

    if (typeof document === 'undefined') return null;

    return createPortal(
        <AnimatePresence>
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    width: '100vw',
                    height: '100vh',
                    background: 'rgba(5, 10, 20, 0.85)',
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                    zIndex: 19999
                }}
            />

            {/* Modal Content */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: '-40%', x: '-50%' }}
                animate={{ opacity: 1, scale: 1, y: '-50%', x: '-50%' }}
                exit={{ opacity: 0, scale: 0.95, y: '-40%', x: '-50%' }}
                transition={{ type: "spring", bounce: 0, duration: 0.3 }}
                style={{
                    position: 'fixed',
                    top: '50%',
                    left: '50%',
                    width: '90%',
                    maxWidth: '600px',
                    background: 'var(--dark-blue)',
                    backgroundImage: 'linear-gradient(145deg, rgba(26, 61, 99, 0.4) 0%, rgba(10, 25, 49, 0.8) 100%)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: '24px',
                    padding: '0',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.05) inset',
                    zIndex: 20000,
                    display: 'flex',
                    flexDirection: 'column'
                }}
                onClick={e => e.stopPropagation()}
            >
                {/* Compact Header */}
                <div style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: '16px', borderBottom: '1px solid var(--glass-border)' }}>
                    <div style={{
                        width: '48px', height: '48px', borderRadius: '16px',
                        background: 'linear-gradient(135deg, rgba(0, 210, 255, 0.2), rgba(0, 210, 255, 0.05))',
                        border: '1px solid rgba(0, 210, 255, 0.3)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#00d2ff', fontSize: '24px',
                        boxShadow: '0 4px 16px rgba(0, 210, 255, 0.1)'
                    }}>
                        <i className="ri-question-answer-fill"></i>
                    </div>
                    <div>
                        <h2 style={{ fontFamily: 'MiSans-Bold', fontSize: '20px', color: 'var(--off-white)', margin: 0, letterSpacing: '-0.3px' }}>
                            Ask a Truth
                        </h2>
                        <p style={{ color: 'var(--light-blue)', fontSize: '13px', margin: '2px 0 0 0', opacity: 0.8 }}>
                            Get honest answers from the world
                        </p>
                    </div>
                    <button onClick={onClose} style={{ marginLeft: 'auto', background: 'transparent', border: 'none', color: 'var(--light-blue)', fontSize: '24px', cursor: 'pointer' }}>
                        <i className="ri-close-line"></i>
                    </button>
                </div>

                {error && (
                    <div style={{
                        margin: '20px 24px 0',
                        background: 'rgba(255, 50, 50, 0.1)', border: '1px solid rgba(255, 50, 50, 0.3)',
                        color: '#ff6b6b', padding: '12px', borderRadius: '12px', fontSize: '14px', textAlign: 'center'
                    }}>
                        {error}
                    </div>
                )}

                {/* Compact Form Area */}
                <div style={{ padding: '24px' }}>
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                        {/* Question Input */}
                        <div>
                            <label style={{ display: 'block', color: 'var(--light-blue)', fontSize: '11px', marginBottom: '6px', fontWeight: 'bold', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Your Question</label>
                            <textarea
                                value={formData.question}
                                onChange={e => setFormData({ ...formData, question: e.target.value })}
                                placeholder="What is the one thing you've never told anyone?"
                                required
                                rows="3"
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    background: 'rgba(255,255,255,0.03)',
                                    border: '1px solid var(--glass-border)',
                                    borderRadius: '12px',
                                    color: 'var(--off-white)',
                                    fontSize: '15px',
                                    outline: 'none',
                                    fontFamily: 'MiSans-Medium',
                                    resize: 'none',
                                    lineHeight: '1.5'
                                }}
                                onFocus={e => e.target.style.borderColor = '#00d2ff'}
                                onBlur={e => e.target.style.borderColor = 'var(--glass-border)'}
                            />
                        </div>

                        {/* Row 2: Category & Difficulty */}
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <div style={{ flex: 1 }}>
                                <label style={{ display: 'block', color: 'var(--light-blue)', fontSize: '11px', marginBottom: '6px', fontWeight: 'bold', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Category</label>
                                <div style={{ position: 'relative' }}>
                                    <select
                                        value={formData.category}
                                        onChange={e => setFormData({ ...formData, category: e.target.value })}
                                        style={{
                                            width: '100%',
                                            padding: '12px 16px',
                                            background: 'rgba(255,255,255,0.03)',
                                            border: '1px solid var(--glass-border)',
                                            borderRadius: '12px',
                                            color: 'var(--off-white)',
                                            fontSize: '14px',
                                            fontWeight: '500',
                                            outline: 'none',
                                            appearance: 'none',
                                            cursor: 'pointer',
                                            fontFamily: 'MiSans-Medium'
                                        }}
                                    >
                                        {categories.map(cat => <option key={cat} value={cat} style={{ background: '#0a1931' }}>{cat}</option>)}
                                    </select>
                                    <i className="ri-arrow-down-s-line" style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.5)', pointerEvents: 'none' }}></i>
                                </div>
                            </div>
                            <div style={{ flex: 1 }}>
                                <label style={{ display: 'block', color: 'var(--light-blue)', fontSize: '11px', marginBottom: '6px', fontWeight: 'bold', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Intensity</label>
                                <div style={{ position: 'relative' }}>
                                    <select
                                        value={formData.difficulty}
                                        onChange={e => setFormData({ ...formData, difficulty: e.target.value })}
                                        style={{
                                            width: '100%',
                                            padding: '12px 16px',
                                            background: 'rgba(255,255,255,0.03)',
                                            border: '1px solid var(--glass-border)',
                                            borderRadius: '12px',
                                            color: 'var(--off-white)',
                                            fontSize: '14px',
                                            fontWeight: '500',
                                            outline: 'none',
                                            appearance: 'none',
                                            cursor: 'pointer',
                                            fontFamily: 'MiSans-Medium'
                                        }}
                                    >
                                        {difficulties.map(lvl => <option key={lvl} value={lvl} style={{ background: '#0a1931' }}>{lvl}</option>)}
                                    </select>
                                    <i className="ri-arrow-down-s-line" style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.5)', pointerEvents: 'none' }}></i>
                                </div>
                            </div>
                        </div>

                        {/* Target User */}
                        <div>
                            <label style={{ display: 'block', color: 'var(--light-blue)', fontSize: '11px', marginBottom: '6px', fontWeight: 'bold', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Target User <span style={{ opacity: 0.5, fontWeight: 'normal', textTransform: 'none' }}>(Optional - Leave empty for public)</span></label>
                            <div style={{ position: 'relative' }}>
                                <i className="ri-at-line" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--light-blue)', fontSize: '14px', opacity: 0.7 }}></i>
                                <input
                                    type="text"
                                    value={formData.targetUser}
                                    onChange={e => setFormData({ ...formData, targetUser: e.target.value })}
                                    placeholder="Username"
                                    style={{
                                        width: '100%',
                                        padding: '12px 16px 12px 34px',
                                        background: 'rgba(255,255,255,0.03)',
                                        border: '1px solid var(--glass-border)',
                                        borderRadius: '12px',
                                        color: 'var(--off-white)',
                                        fontSize: '14px',
                                        outline: 'none',
                                        fontFamily: 'MiSans-Medium'
                                    }}
                                    onFocus={e => e.target.style.borderColor = '#00d2ff'}
                                    onBlur={e => e.target.style.borderColor = 'var(--glass-border)'}
                                />
                            </div>
                        </div>

                        {/* Reward Input */}
                        <div>
                            <label style={{ display: 'block', color: 'var(--light-blue)', fontSize: '11px', marginBottom: '6px', fontWeight: 'bold', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Reward (DRC) <span style={{ color: '#00ff80', fontSize: '10px' }}>Max 500</span></label>
                            <div style={{ position: 'relative' }}>
                                <i className="ri-coin-fill" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#ffd700', fontSize: '16px' }}></i>
                                <input
                                    type="number"
                                    min="0"
                                    max="500"
                                    value={formData.reward}
                                    onChange={e => {
                                        const val = e.target.value;
                                        // Allow empty string or numbers
                                        if (val === '' || /^\d+$/.test(val)) {
                                            setFormData({ ...formData, reward: val });
                                        }
                                    }}
                                    style={{
                                        width: '100%',
                                        padding: '12px 16px 12px 34px',
                                        background: 'rgba(255,255,255,0.03)',
                                        border: '1px solid var(--glass-border)',
                                        borderRadius: '12px',
                                        color: '#ffd700',
                                        fontSize: '16px',
                                        fontWeight: 'bold',
                                        outline: 'none',
                                        fontFamily: 'MiSans-Bold'
                                    }}
                                    onFocus={e => e.target.style.borderColor = '#ffd700'}
                                    onBlur={e => e.target.style.borderColor = 'var(--glass-border)'}
                                />
                            </div>
                        </div>

                        {/* Buttons */}
                        <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                            <button
                                type="button"
                                onClick={onClose}
                                style={{
                                    flex: 1,
                                    padding: '14px',
                                    borderRadius: '12px',
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid transparent',
                                    color: 'var(--light-blue)',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    fontFamily: 'MiSans-Medium'
                                }}
                                onMouseEnter={e => { e.target.style.background = 'rgba(255,255,255,0.1)'; e.target.style.color = 'var(--off-white)'; }}
                                onMouseLeave={e => { e.target.style.background = 'rgba(255,255,255,0.05)'; e.target.style.color = 'var(--light-blue)'; }}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                style={{
                                    flex: 2,
                                    padding: '14px',
                                    borderRadius: '12px',
                                    background: 'linear-gradient(135deg, #00d2ff, #3a7bd5)',
                                    border: 'none',
                                    color: '#fff',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    fontWeight: 'bold',
                                    fontFamily: 'MiSans-Bold',
                                    boxShadow: '0 8px 16px rgba(0, 210, 255, 0.25)',
                                    opacity: loading ? 0.7 : 1
                                }}
                                onMouseEnter={e => !loading && (e.target.style.transform = 'translateY(-1px)')}
                                onMouseLeave={e => !loading && (e.target.style.transform = 'translateY(0)')}
                            >
                                {loading ? 'Posting...' : 'Ask the World'}
                            </button>
                        </div>

                    </form>
                </div>
            </motion.div>
        </AnimatePresence>,
        document.body
    );
}
