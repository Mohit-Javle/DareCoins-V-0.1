import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';

export default function EditProfileModal({ isOpen, onClose, user, onSave }) {
    const [formData, setFormData] = useState({ ...user });
    const [avatarFile, setAvatarFile] = useState(null);
    const [bannerFile, setBannerFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(user.avatar);
    const [bannerPreview, setBannerPreview] = useState(user.banner);

    const avatarInputRef = useRef(null);
    const bannerInputRef = useRef(null);

    // Update local state when user prop changes (e.g. on open)
    useEffect(() => {
        if (isOpen) {
            setFormData({ ...user });
            setAvatarPreview(user.avatar);
            setBannerPreview(user.banner);
            setAvatarFile(null);
            setBannerFile(null);
        }
    }, [isOpen, user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileChange = (e, type) => {
        const file = e.target.files[0];
        if (file) {
            const previewUrl = URL.createObjectURL(file);
            if (type === 'avatar') {
                setAvatarFile(file);
                setAvatarPreview(previewUrl);
            } else {
                setBannerFile(file);
                setBannerPreview(previewUrl);
            }
        }
    };

    const [isLoading, setIsLoading] = useState(false);

    const handleSave = async () => {
        setIsLoading(true);
        try {
            const data = new FormData();
            if (formData.name) data.append('name', formData.name);
            data.append('username', formData.handle || formData.username || '');
            if (formData.bio) data.append('bio', formData.bio);
            if (formData.favVideo) data.append('favVideo', formData.favVideo);

            if (avatarFile) {
                data.append('avatar', avatarFile);
            } else if (formData.avatar) {
                // Keep existing URL if no new file
                data.append('avatar', formData.avatar);
            }

            if (bannerFile) {
                data.append('banner', bannerFile);
            } else if (formData.banner) {
                data.append('banner', formData.banner);
            }

            await onSave(data);
            onClose();
        } catch (error) {
            console.error("Save failed in modal:", error);
            const msg = error.response?.data?.message || error.message || "Failed to save profile";
            alert(`Error: ${msg}`);
        } finally {
            setIsLoading(false);
        }
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
                            background: 'rgba(0,0,0,0.6)',
                            backdropFilter: 'blur(4px)',
                            zIndex: 19999
                        }}
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -50 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -50 }}
                        style={{
                            position: 'fixed',
                            top: '5%',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: '90%',
                            maxWidth: '600px',
                            background: '#0a1931',
                            backgroundImage: 'linear-gradient(135deg, rgba(10, 25, 49, 0.95), rgba(26, 61, 99, 0.95))',
                            border: '1px solid var(--glass-border)',
                            borderRadius: '24px',
                            padding: '30px',
                            zIndex: 20000,
                            boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                            maxHeight: '90vh',
                            display: 'flex',
                            flexDirection: 'column'
                        }}
                    >
                        {/* Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h2 style={{ fontSize: '24px', fontWeight: 'bold', fontFamily: 'MiSans-Bold' }}>Edit Profile</h2>
                            <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--light-blue)', fontSize: '24px', cursor: 'pointer' }}>
                                <i className="ri-close-line"></i>
                            </button>
                        </div>

                        {/* Form Content */}
                        <div style={{ marginBottom: '30px', maxHeight: '60vh', overflowY: 'auto', paddingRight: '10px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

                            {/* Banner Field */}
                            <div>
                                <label style={{ display: 'block', fontSize: '14px', color: 'var(--light-blue)', marginBottom: '8px' }}>Banner Image</label>
                                <div
                                    onClick={() => bannerInputRef.current.click()}
                                    style={{
                                        height: '120px',
                                        borderRadius: '12px',
                                        overflow: 'hidden',
                                        marginBottom: '10px',
                                        background: '#0a1931',
                                        position: 'relative',
                                        cursor: 'pointer',
                                        border: '1px dashed var(--glass-border)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    {bannerPreview ? (
                                        <img src={bannerPreview} alt="Banner Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <div style={{ color: 'var(--light-blue)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                            <i className="ri-image-add-line" style={{ fontSize: '24px' }}></i>
                                            <span style={{ fontSize: '12px' }}>Click to upload banner</span>
                                        </div>
                                    )}
                                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)', opacity: 0, transition: 'opacity 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center' }} className="hover-overlay" onMouseEnter={(e) => e.currentTarget.style.opacity = 1} onMouseLeave={(e) => e.currentTarget.style.opacity = 0}>
                                        <i className="ri-pencil-fill" style={{ color: '#fff', fontSize: '24px' }}></i>
                                    </div>
                                </div>
                                <input
                                    type="file"
                                    ref={bannerInputRef}
                                    style={{ display: 'none' }}
                                    onChange={(e) => handleFileChange(e, 'banner')}
                                    accept="image/*"
                                />
                            </div>

                            {/* Avatar Field */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                <div
                                    onClick={() => avatarInputRef.current.click()}
                                    style={{
                                        width: '100px',
                                        height: '100px',
                                        borderRadius: '24px',
                                        overflow: 'hidden',
                                        border: '2px solid var(--medium-blue)',
                                        cursor: 'pointer',
                                        position: 'relative',
                                        background: '#000'
                                    }}
                                >
                                    <img src={avatarPreview || "https://via.placeholder.com/100"} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)', opacity: 0, transition: 'opacity 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center' }} className="hover-overlay" onMouseEnter={(e) => e.currentTarget.style.opacity = 1} onMouseLeave={(e) => e.currentTarget.style.opacity = 0}>
                                        <i className="ri-camera-fill" style={{ color: '#fff', fontSize: '24px' }}></i>
                                    </div>
                                </div>
                                <input
                                    type="file"
                                    ref={avatarInputRef}
                                    style={{ display: 'none' }}
                                    onChange={(e) => handleFileChange(e, 'avatar')}
                                    accept="image/*"
                                />

                                <div style={{ flex: 1 }}>
                                    <h3 style={{ fontSize: '18px', marginBottom: '4px' }}>{formData.name || 'User'}</h3>
                                    <div style={{ fontSize: '14px', color: 'var(--light-blue)' }}>Click image to change avatar</div>
                                </div>
                            </div>

                            {/* Name Field */}
                            <div>
                                <label style={{ display: 'block', fontSize: '14px', color: 'var(--light-blue)', marginBottom: '8px' }}>Display Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                                />
                            </div>

                            {/* Handle Field */}
                            <div>
                                <label style={{ display: 'block', fontSize: '14px', color: 'var(--light-blue)', marginBottom: '8px' }}>Username (Handle)</label>
                                <input
                                    type="text"
                                    name="handle" // We map this to 'username' in FormData
                                    value={formData.handle}
                                    onChange={handleChange}
                                    style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                                />
                            </div>

                            {/* Bio Field */}
                            <div>
                                <label style={{ display: 'block', fontSize: '14px', color: 'var(--light-blue)', marginBottom: '8px' }}>Bio</label>
                                <textarea
                                    name="bio"
                                    value={formData.bio}
                                    onChange={handleChange}
                                    rows="4"
                                    style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', resize: 'none' }}
                                />
                            </div>

                            {/* Favorite Video Field */}
                            <div>
                                <label style={{ display: 'block', fontSize: '14px', color: 'var(--light-blue)', marginBottom: '8px' }}>Favorite Dare Video URL</label>
                                <input
                                    type="text"
                                    name="favVideo"
                                    value={formData.favVideo || ''}
                                    onChange={handleChange}
                                    style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                                    placeholder="https://..."
                                />
                            </div>

                        </div>

                        {/* Footer / Actions */}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px' }}>
                            <button
                                onClick={onClose}
                                style={{
                                    padding: '12px 24px',
                                    borderRadius: '12px',
                                    background: 'transparent',
                                    border: '1px solid var(--glass-border)',
                                    color: 'var(--light-blue)',
                                    cursor: 'pointer',
                                    fontSize: '16px'
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={isLoading}
                                style={{
                                    padding: '12px 30px',
                                    borderRadius: '12px',
                                    background: '#00ff80',
                                    border: 'none',
                                    color: '#0a1931',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    fontSize: '16px',
                                    boxShadow: '0 0 15px rgba(0,255,128,0.3)',
                                    opacity: isLoading ? 0.7 : 1,
                                    cursor: isLoading ? 'not-allowed' : 'pointer'
                                }}
                            >
                                {isLoading ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>

                    </motion.div>
                </>
            )}
        </AnimatePresence>,
        document.body
    );
}
