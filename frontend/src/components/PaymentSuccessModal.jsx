import React from 'react';

const PaymentSuccessModal = ({ amount, drc, onClose }) => {
    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(15px)',
            zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center',
            animation: 'fadeIn 0.3s ease-out'
        }}>
            <style>
                {`
                    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                    @keyframes scaleUp { from { transform: scale(0.8); opacity: 0; } to { transform: scale(1); opacity: 1; } }
                    @keyframes checkmark { 0% { stroke-dashoffset: 50; } 100% { stroke-dashoffset: 0; } }
                    @keyframes glow { 0% { box-shadow: 0 0 10px #00ff8033; } 50% { box-shadow: 0 0 30px #00ff8066; } 100% { box-shadow: 0 0 10px #00ff8033; } }
                `}
            </style>

            <div style={{
                width: '90%', maxWidth: '400px',
                background: 'var(--dark-blue)',
                backgroundImage: 'linear-gradient(145deg, rgba(20, 20, 20, 0.9) 0%, rgba(10, 25, 49, 0.95) 100%)',
                border: '1px solid var(--glass-border)',
                borderRadius: '30px', padding: '40px',
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                boxShadow: '0 20px 50px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(255,255,255,0.05)',
                animation: 'scaleUp 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards'
            }}>

                {/* Animated Checkmark Circle */}
                <div style={{
                    width: '100px', height: '100px', borderRadius: '50%',
                    background: 'linear-gradient(135deg, #00ff80 0%, #00cc66 100%)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: '24px',
                    boxShadow: '0 10px 30px rgba(0, 255, 128, 0.4)',
                    animation: 'glow 2s infinite'
                }}>
                    <svg viewBox="0 0 50 50" style={{ width: '50px', height: '50px', fill: 'none', stroke: '#fff', strokeWidth: '4', strokeLinecap: 'round', strokeLinejoin: 'round' }}>
                        <path d="M10 25 L22 37 L40 13" style={{ strokeDasharray: 50, strokeDashoffset: 50, animation: 'checkmark 0.6s ease-out 0.3s forwards' }} />
                    </svg>
                </div>

                <h2 style={{ fontFamily: 'MiSans-Bold', fontSize: '28px', color: '#fff', marginBottom: '8px', textAlign: 'center' }}>
                    Payment Successful!
                </h2>

                <p style={{ color: 'var(--light-blue)', textAlign: 'center', marginBottom: '30px', fontSize: '16px' }}>
                    Your wallet has been topped up.
                </p>

                <div style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: '16px', padding: '16px 24px',
                    display: 'flex', alignItems: 'center', gap: '16px',
                    marginBottom: '30px', width: '100%'
                }}>
                    <div style={{ fontSize: '32px' }}>💰</div>
                    <div>
                        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>Amount Added</div>
                        <div style={{ color: '#00ff80', fontFamily: 'MiSans-Bold', fontSize: '24px' }}>+{drc} DRC</div>
                    </div>
                </div>

                <button
                    onClick={onClose}
                    className="play-btn"
                    style={{
                        width: '100%', justifyContent: 'center', fontSize: '16px', height: '50px',
                        background: 'linear-gradient(90deg, #00ff80 0%, #00cc66 100%)',
                        color: '#000', border: 'none'
                    }}
                >
                    Continue
                </button>
            </div>
        </div>
    );
};

export default PaymentSuccessModal;
