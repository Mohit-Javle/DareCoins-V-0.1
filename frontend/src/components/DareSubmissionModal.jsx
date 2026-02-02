import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';

export default function DareSubmissionModal({ isOpen, onClose, dare, onSubmit }) {
    const [step, setStep] = useState('upload'); // upload | submitting | success
    const [media, setMedia] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const fileInputRef = useRef(null);

    // Reset state when opening
    useEffect(() => {
        if (isOpen) {
            setStep('upload');
            setMedia(null);
            setPreviewUrl(null);
        }
    }, [isOpen]);

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setMedia(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = () => {
        if (!media) return;
        setStep('submitting');

        // Simulate upload delay
        setTimeout(() => {
            setStep('success');
            setTimeout(() => {
                if (dare?.type === 'truth') {
                    // Send text answer
                    onSubmit({ answer: media });
                } else {
                    // Send file
                    onSubmit(media);
                }
                onClose();
            }, 1000);
        }, 1500);
    };

    if (typeof document === 'undefined') return null;

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100vw',
                    height: '100vh',
                    zIndex: 2147483647, // Max Z-Index
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    {/* Dark Blurry Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            background: 'rgba(5, 10, 20, 0.85)',
                            backdropFilter: 'blur(16px)',
                            zIndex: 1
                        }}
                    />

                    {/* Premium Glass Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        style={{
                            position: 'relative',
                            width: '90%',
                            maxWidth: '480px',
                            background: 'rgba(20, 30, 50, 0.6)',
                            backgroundImage: 'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.01))',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '30px',
                            padding: '30px',
                            zIndex: 2,
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255,255,255,0.05)',
                            overflow: 'hidden'
                        }}
                    >
                        {/* Glow Effect */}
                        <div style={{
                            position: 'absolute',
                            top: '-50%',
                            left: '-50%',
                            width: '200%',
                            height: '200%',
                            background: 'radial-gradient(circle at center, rgba(0, 255, 128, 0.03), transparent 60%)',
                            pointerEvents: 'none',
                            zIndex: 0
                        }}></div>

                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            style={{
                                position: 'absolute',
                                top: '20px',
                                right: '20px',
                                background: 'rgba(255,255,255,0.05)',
                                border: 'none',
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                color: 'rgba(255,255,255,0.5)',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.2s',
                                zIndex: 10
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                                e.currentTarget.style.color = '#fff';
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                                e.currentTarget.style.color = 'rgba(255,255,255,0.5)';
                            }}
                        >
                            <i className="ri-close-line" style={{ fontSize: '20px' }}></i>
                        </button>

                        <div style={{ position: 'relative', zIndex: 1 }}>
                            {step === 'upload' && (
                                <>
                                    <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                                        <div style={{
                                            width: '60px', height: '60px', margin: '0 auto 16px',
                                            background: 'linear-gradient(135deg, #00ff80, #00b8ff)',
                                            borderRadius: '20px',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            boxShadow: '0 10px 20px rgba(0,0,0,0.3)'
                                        }}>
                                            <i className={dare?.type === 'truth' ? "ri-chat-voice-fill" : "ri-upload-cloud-2-fill"} style={{ fontSize: '32px', color: '#0a1931' }}></i>
                                        </div>
                                        <h2 style={{ fontFamily: 'MiSans-Bold', fontSize: '24px', color: '#fff', marginBottom: '8px' }}>
                                            {dare?.type === 'truth' ? 'Speak Your Truth' : 'Submit Your Proof'}
                                        </h2>
                                        <p style={{ color: 'rgba(179, 207, 229, 0.7)', fontSize: '14px', lineHeight: '1.5' }}>
                                            {dare?.type === 'truth' ? 'Be honest. Your answer will be public.' : (
                                                <>
                                                    Upload a video or photo to complete<br />
                                                    <span style={{ color: '#fff', fontWeight: '500' }}>"{dare?.fullTitle || 'this dare'}"</span>
                                                </>
                                            )}
                                        </p>
                                    </div>

                                    {/* Input Area */}
                                    {dare?.type === 'truth' ? (
                                        <textarea
                                            placeholder="Type your honest answer here..."
                                            onChange={(e) => setMedia(e.target.value)} // Reusing media state for text
                                            style={{
                                                width: '100%',
                                                height: '150px',
                                                background: 'rgba(0,0,0,0.2)',
                                                border: '1px solid rgba(255,255,255,0.1)',
                                                borderRadius: '16px',
                                                padding: '16px',
                                                color: 'white',
                                                fontSize: '16px',
                                                fontFamily: 'MiSans-Regular',
                                                resize: 'none',
                                                marginBottom: '24px',
                                                outline: 'none'
                                            }}
                                            autoFocus
                                        />
                                    ) : (
                                        <div
                                            onClick={() => fileInputRef.current.click()}
                                            style={{
                                                position: 'relative',
                                                width: '100%',
                                                height: '180px',
                                                background: 'rgba(0,0,0,0.2)',
                                                border: `2px dashed ${media ? '#00ff80' : 'rgba(255,255,255,0.1)'}`,
                                                borderRadius: '24px',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                cursor: 'pointer',
                                                transition: 'all 0.3s',
                                                overflow: 'hidden',
                                                marginBottom: '24px'
                                            }}
                                            onMouseEnter={e => {
                                                if (!media) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)';
                                                e.currentTarget.style.background = 'rgba(0,0,0,0.25)';
                                            }}
                                            onMouseLeave={e => {
                                                if (!media) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                                                e.currentTarget.style.background = 'rgba(0,0,0,0.2)';
                                            }}
                                        >
                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                onChange={handleFileChange}
                                                accept="image/*,video/*"
                                                style={{ display: 'none' }}
                                            />

                                            {media ? (
                                                <>
                                                    {/* Preview Background */}
                                                    {media.type.startsWith('image') ? (
                                                        <img src={previewUrl} style={{ position: 'absolute', width: '100%', height: '100%', objectFit: 'cover', opacity: 0.4 }} alt="Preview" />
                                                    ) : (
                                                        <video src={previewUrl} style={{ position: 'absolute', width: '100%', height: '100%', objectFit: 'cover', opacity: 0.4 }} />
                                                    )}

                                                    <div style={{
                                                        position: 'relative',
                                                        width: '50px', height: '50px',
                                                        background: '#00ff80', borderRadius: '50%',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        boxShadow: '0 5px 15px rgba(0,0,0,0.3)',
                                                        marginBottom: '10px'
                                                    }}>
                                                        <i className="ri-check-line" style={{ fontSize: '28px', color: '#00331a' }}></i>
                                                    </div>
                                                    <div style={{ fontSize: '14px', color: '#00ff80', fontWeight: 'bold' }}>Ready to Submit</div>
                                                    <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginTop: '4px' }}>Click to replace</div>
                                                </>
                                            ) : (
                                                <>
                                                    <div style={{
                                                        width: '48px', height: '48px',
                                                        background: 'rgba(255,255,255,0.05)', borderRadius: '50%',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        marginBottom: '12px'
                                                    }}>
                                                        <i className="ri-add-line" style={{ fontSize: '24px', color: 'rgba(255,255,255,0.8)' }}></i>
                                                    </div>
                                                    <div style={{ fontSize: '15px', color: '#fff', fontWeight: '500' }}>Click to Upload</div>
                                                    <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>MP4, JPG, PNG</div>
                                                </>
                                            )}
                                        </div>
                                    )}

                                    {/* Action Button */}
                                    <button
                                        onClick={handleSubmit}
                                        disabled={!media || (typeof media === 'string' && media.trim().length === 0)}
                                        style={{
                                            width: '100%',
                                            padding: '16px',
                                            borderRadius: '16px',
                                            border: 'none',
                                            background: media ? 'linear-gradient(90deg, #00ff80, #00cc66)' : 'rgba(255,255,255,0.05)',
                                            color: media ? '#00331a' : 'rgba(255,255,255,0.3)',
                                            fontSize: '16px',
                                            fontWeight: 'bold',
                                            cursor: media ? 'pointer' : 'not-allowed',
                                            transition: 'all 0.3s',
                                            boxShadow: media ? '0 10px 25px rgba(0, 255, 128, 0.25)' : 'none',
                                            transform: media ? 'translateY(0)' : 'translateY(0)',
                                        }}
                                        onMouseEnter={e => {
                                            if (media) e.currentTarget.style.transform = 'translateY(-2px)';
                                        }}
                                        onMouseLeave={e => {
                                            if (media) e.currentTarget.style.transform = 'translateY(0)';
                                        }}
                                    >
                                        {media ? (dare?.type === 'truth' ? 'Confirm Answer' : 'Submit Proof 🚀') : (dare?.type === 'truth' ? 'Type an Answer' : 'Select File First')}
                                    </button>
                                </>
                            )}

                            {step === 'submitting' && (
                                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                                    <div style={{ position: 'relative', width: '80px', height: '80px', margin: '0 auto 24px' }}>
                                        <motion.div
                                            style={{
                                                width: '100%', height: '100%',
                                                borderRadius: '50%',
                                                border: '3px solid rgba(255,255,255,0.1)',
                                                borderTopColor: '#00ff80'
                                            }}
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                        />
                                    </div>
                                    <h3 style={{ fontSize: '20px', color: 'white', marginBottom: '8px' }}>Uploading...</h3>
                                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>Please wait while we secure your proof.</p>
                                </div>
                            )}

                            {step === 'success' && (
                                <div style={{ textAlign: 'center', padding: '30px 0' }}>
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: 'spring', damping: 12 }}
                                        style={{
                                            width: '80px', height: '80px', margin: '0 auto 24px',
                                            background: '#00ff80', borderRadius: '50%',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            boxShadow: '0 0 40px rgba(0,255,128,0.4)'
                                        }}
                                    >
                                        <i className="ri-check-line" style={{ fontSize: '40px', color: '#00331a' }}></i>
                                    </motion.div>
                                    <h3 style={{ fontSize: '24px', color: '#fff', marginBottom: '8px' }}>Submitted!</h3>
                                    <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px' }}>
                                        Your proof is now pending approval from the creator. Good luck!
                                    </p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>,
        document.body
    );
}
