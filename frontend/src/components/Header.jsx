import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect, useRef } from 'react';
// import { notificationService } from '../services/api'; // Removed
// import { AnimatePresence, motion } from 'framer-motion'; // Removed if not used elsewhere, but maybe kept if used for other things? 
// AnimatePresence/motion was only used for notif dropdown in header.

export default function Header() {
    const navigate = useNavigate();
    const { user } = useAuth();
    // const [notifications, setNotifications] = useState([]); // Removed
    // const [showNotifications, setShowNotifications] = useState(false); // Removed
    // const notifRef = useRef(null); // Removed

    // Fetch notifications logic removed...

    return (
        <header>
            <div
                className="logo-area"
                onClick={() => navigate(user ? '/dashboard' : '/')}
                style={{ cursor: 'pointer' }}
            >
                <i className="ri-shield-flash-fill logo-icon"></i>
                <div className="app-title">DareCoin</div>
            </div>

            <div className="header-right" style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>

                {/* Notification Bell REMOVED */}

                <div
                    className="wallet-area"
                    onClick={() => navigate('/wallet')}
                    style={{
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        background: 'rgba(26, 61, 99, 0.4)',
                        padding: '8px 16px',
                        borderRadius: '50px',
                        border: '1px solid var(--glass-border)'
                    }}
                >
                    <i className="ri-coin-fill" style={{ color: '#FFD700', fontSize: '20px' }}></i>
                    <span style={{ fontFamily: "'MiSans-Bold'", color: "var(--off-white)" }}>
                        {user?.walletBalance !== undefined ? user.walletBalance.toLocaleString() : '0'} DRC
                    </span>
                </div>

                <div
                    className="profile-area"
                    onClick={() => navigate('/profile')}
                    style={{ cursor: 'pointer' }}
                >
                    <span style={{ fontFamily: "'MiSans-Medium'", color: "var(--light-blue)" }}>
                        Hello, {user?.username || 'Guest'}
                    </span>
                    <div className="profile-icon" style={{ borderRadius: '50%', overflow: 'hidden' }}>
                        {user?.avatar ?
                            <img src={user.avatar} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> :
                            <i className="ri-user-smile-line"></i>
                        }
                    </div>
                </div>

                {user?.role === 'admin' && (
                    <div
                        className="admin-btn"
                        onClick={() => navigate('/admin')}
                        style={{
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            background: 'rgba(255, 0, 0, 0.2)', // Distinctive red/admin color
                            padding: '8px 16px',
                            borderRadius: '50px',
                            border: '1px solid rgba(255, 0, 0, 0.3)'
                        }}
                    >
                        <i className="ri-admin-line" style={{ color: '#ff6b6b', fontSize: '20px' }}></i>
                        <span style={{ fontFamily: "'MiSans-Bold'", color: "#ff6b6b" }}>Admin</span>
                    </div>
                )}
            </div>
        </header >
    );
}
