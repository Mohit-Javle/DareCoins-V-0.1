import { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';

export default function CreateDareModal({ isOpen, onClose, onSave }) {
    const [formData, setFormData] = useState({
        title: '',
        targetUser: '', // Username (optional)
        category: 'Social',
        timeLimit: 30,
        stake: '',
        reward: '', // Synced with stake
        conditions: '',
        media: null
    });
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef(null);

    const categories = ['Social', 'Fitness', 'Funny', 'Extreme', 'Crypto'];

    // Handle drag events
    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setFormData({ ...formData, media: e.dataTransfer.files[0] });
        }
    };

    const handleChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFormData({ ...formData, media: e.target.files[0] });
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({
            ...formData,
            // Backend will likely need to lookup userId from username if provided
            // For now passing it as is, App.jsx or controller needs to handle it.
            // Assuming simplified flow where text is passed.
            fullTitle: formData.title,
            tags: ['#New', '#Dare', formData.targetUser ? `#Target:${formData.targetUser}` : '#Public', `#${formData.category}`],
            subtitle: `${formData.stake} DC Stake • ${formData.targetUser ? 'Targeted' : 'Public'}`,
            user: '@You',
            avatar: 'https://a.lovart.ai/artifacts/user/rCONejiGD7B9jUBD.jpg',
            coverImage: formData.media ? URL.createObjectURL(formData.media) : 'https://picsum.photos/seed/new/600/400'
        }, formData.targetUser); // Pass targetUser separately to App handler
        onClose();
    };

    if (typeof document === 'undefined') return null;

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <>
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
                            maxWidth: '600px', // Slightly wider for side-by-side inputs
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
                    >
                        {/* Compact Header */}
                        <div style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: '16px', borderBottom: '1px solid var(--glass-border)' }}>
                            <div style={{
                                width: '48px', height: '48px', borderRadius: '16px',
                                background: 'linear-gradient(135deg, rgba(74, 127, 167, 0.2), rgba(74, 127, 167, 0.05))',
                                border: '1px solid rgba(74, 127, 167, 0.3)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: '#4da6ff', fontSize: '24px',
                                boxShadow: '0 4px 16px rgba(74, 127, 167, 0.1)'
                            }}>
                                <i className="ri-flashlight-fill"></i>
                            </div>
                            <div>
                                <h2 style={{ fontFamily: 'MiSans-Bold', fontSize: '20px', color: 'var(--off-white)', margin: 0, letterSpacing: '-0.3px' }}>
                                    Create a Dare
                                </h2>
                                <p style={{ color: 'var(--light-blue)', fontSize: '13px', margin: '2px 0 0 0', opacity: 0.8 }}>
                                    Set the stakes high!
                                </p>
                            </div>
                            <button onClick={onClose} style={{ marginLeft: 'auto', background: 'transparent', border: 'none', color: 'var(--light-blue)', fontSize: '24px', cursor: 'pointer' }}>
                                <i className="ri-close-line"></i>
                            </button>
                        </div>

                        {/* Compact Form Area */}
                        <div style={{ padding: '24px' }}>
                            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                                {/* Row 1: Title (Grow) & Stake (Fixed) */}
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <div style={{ flex: 2 }}>
                                        <label style={{ display: 'block', color: 'var(--light-blue)', fontSize: '11px', marginBottom: '6px', fontWeight: 'bold', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Dare Title</label>
                                        <input
                                            type="text"
                                            value={formData.title}
                                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                                            placeholder="E.g., 50 Pushups"
                                            required
                                            style={{
                                                width: '100%',
                                                padding: '12px 16px',
                                                background: 'rgba(255,255,255,0.03)',
                                                border: '1px solid var(--glass-border)',
                                                borderRadius: '12px',
                                                color: 'var(--off-white)',
                                                fontSize: '14px',
                                                outline: 'none',
                                                fontFamily: 'MiSans-Medium'
                                            }}
                                            onFocus={e => e.target.style.borderColor = '#4da6ff'}
                                            onBlur={e => e.target.style.borderColor = 'var(--glass-border)'}
                                        />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <label style={{ display: 'block', color: 'var(--light-blue)', fontSize: '11px', marginBottom: '6px', fontWeight: 'bold', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Stake (DC)</label>
                                        <input
                                            type="number"
                                            value={formData.stake}
                                            onChange={e => {
                                                const val = e.target.value;
                                                setFormData({ ...formData, stake: val, reward: val });
                                            }}
                                            placeholder="500"
                                            required
                                            min="1"
                                            style={{
                                                width: '100%',
                                                padding: '12px 16px',
                                                background: 'rgba(255,255,255,0.03)',
                                                border: '1px solid var(--glass-border)',
                                                borderRadius: '12px',
                                                color: '#4da6ff',
                                                fontSize: '14px',
                                                fontWeight: 'bold',
                                                outline: 'none',
                                                fontFamily: 'MiSans-Bold'
                                            }}
                                            onFocus={e => e.target.style.borderColor = '#4da6ff'}
                                            onBlur={e => e.target.style.borderColor = 'var(--glass-border)'}
                                        />
                                    </div>
                                </div>

                                {/* Row 2: Target User & Time */}
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <div style={{ flex: 2 }}>
                                        <label style={{ display: 'block', color: 'var(--light-blue)', fontSize: '11px', marginBottom: '6px', fontWeight: 'bold', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Target User <span style={{ opacity: 0.5, fontWeight: 'normal', textTransform: 'none' }}>(Optional)</span></label>
                                        <div style={{ position: 'relative' }}>
                                            <i className="ri-at-line" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--light-blue)', fontSize: '14px', opacity: 0.7 }}></i>
                                            <input
                                                type="text"
                                                value={formData.targetUser}
                                                onChange={e => setFormData({ ...formData, targetUser: e.target.value })}
                                                placeholder="Public"
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
                                                onFocus={e => e.target.style.borderColor = '#4da6ff'}
                                                onBlur={e => e.target.style.borderColor = 'var(--glass-border)'}
                                            />
                                        </div>
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <label style={{ display: 'block', color: 'var(--light-blue)', fontSize: '11px', marginBottom: '6px', fontWeight: 'bold', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Time (Min)</label>
                                        <input
                                            type="number"
                                            value={formData.timeLimit}
                                            onChange={e => setFormData({ ...formData, timeLimit: Number(e.target.value) })}
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
                                                fontFamily: 'MiSans-Medium'
                                            }}
                                            onFocus={e => e.target.style.borderColor = '#4da6ff'}
                                            onBlur={e => e.target.style.borderColor = 'var(--glass-border)'}
                                        />
                                    </div>
                                </div>

                                {/* Row 3: Compact Media Upload */}
                                <div>
                                    <label style={{ display: 'block', color: 'var(--light-blue)', fontSize: '11px', marginBottom: '6px', fontWeight: 'bold', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Cover Media</label>
                                    <div
                                        onDragEnter={handleDrag}
                                        onDragLeave={handleDrag}
                                        onDragOver={handleDrag}
                                        onDrop={handleDrop}
                                        onClick={() => fileInputRef.current.click()}
                                        style={{
                                            border: `1px dashed ${dragActive ? '#4da6ff' : 'var(--glass-border)'}`,
                                            borderRadius: '12px',
                                            padding: '12px 16px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '10px',
                                            cursor: 'pointer',
                                            background: dragActive ? 'rgba(77, 166, 255, 0.05)' : 'rgba(255,255,255,0.02)',
                                            transition: 'all 0.2s ease'
                                        }}
                                    >
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            onChange={handleChange}
                                            style={{ display: 'none' }}
                                            accept="image/*,video/*"
                                        />
                                        {formData.media ? (
                                            <>
                                                <i className="ri-check-line" style={{ color: '#4da6ff', fontSize: '18px' }}></i>
                                                <span style={{ color: '#4da6ff', fontSize: '13px', fontWeight: '600', textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>{formData.media.name}</span>
                                            </>
                                        ) : (
                                            <>
                                                <i className="ri-upload-cloud-2-line" style={{ fontSize: '18px', color: 'var(--light-blue)' }}></i>
                                                <span style={{ color: 'var(--light-blue)', fontSize: '13px' }}>Click to upload cover media</span>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Row 4: Conditions (Small Textarea) */}
                                <div>
                                    <label style={{ display: 'block', color: 'var(--light-blue)', fontSize: '11px', marginBottom: '6px', fontWeight: 'bold', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Conditions</label>
                                    <textarea
                                        value={formData.conditions}
                                        onChange={e => setFormData({ ...formData, conditions: e.target.value })}
                                        rows="2"
                                        placeholder="Specific rules..."
                                        style={{
                                            width: '100%',
                                            padding: '12px 16px',
                                            background: 'rgba(255,255,255,0.03)',
                                            border: '1px solid var(--glass-border)',
                                            borderRadius: '12px',
                                            color: 'var(--off-white)',
                                            fontSize: '14px',
                                            outline: 'none',
                                            resize: 'none',
                                            fontFamily: 'MiSans-Regular',
                                            lineHeight: '1.4'
                                        }}
                                        onFocus={e => e.target.style.borderColor = '#4da6ff'}
                                        onBlur={e => e.target.style.borderColor = 'var(--glass-border)'}
                                    />
                                </div>

                                {/* Action Buttons - Keeping them bold but reducing top margin implies flow */}
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
                                        onClick={handleSubmit}
                                        style={{
                                            flex: 2,
                                            padding: '14px',
                                            borderRadius: '12px',
                                            background: 'linear-gradient(135deg, var(--medium-blue) 0%, var(--darker-medium-blue) 100%)',
                                            border: '1px solid var(--glass-border)',
                                            color: '#fff',
                                            cursor: 'pointer',
                                            fontSize: '14px',
                                            fontWeight: 'bold',
                                            fontFamily: 'MiSans-Bold',
                                            boxShadow: '0 8px 16px rgba(74, 127, 167, 0.2)'
                                        }}
                                        onMouseEnter={e => { e.target.style.transform = 'translateY(-1px)'; e.target.style.boxShadow = '0 12px 24px rgba(74, 127, 167, 0.3)'; }}
                                        onMouseLeave={e => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 8px 16px rgba(74, 127, 167, 0.2)'; }}
                                    >
                                        Create Dare
                                    </button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>,
        document.body
    );
}
