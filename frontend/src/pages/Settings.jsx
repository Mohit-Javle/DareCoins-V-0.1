import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService, walletService } from '../services/api';

export default function Settings() {
    const navigate = useNavigate();
    const { user, logout, refreshUser } = useAuth();
    const [activeSection, setActiveSection] = useState('account');
    const [isLoading, setIsLoading] = useState(false);

    // Wallet State
    const [walletData, setWalletData] = useState(null);
    const [isLoadingWallet, setIsLoadingWallet] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        username: '',
        bio: ''
    });
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);

    // Load user data
    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                username: user.username || '',
                bio: user.bio || ''
            });
        }
    }, [user]);

    // Fetch Wallet Data
    useEffect(() => {
        if (activeSection === 'wallet') {
            const fetchWallet = async () => {
                setIsLoadingWallet(true);
                try {
                    const data = await walletService.getBalance();
                    setWalletData(data);
                } catch (error) {
                    console.error("Failed to fetch wallet:", error);
                } finally {
                    setIsLoadingWallet(false);
                }
            };
            fetchWallet();
        }
    }, [activeSection]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    const handleSave = async () => {
        setIsLoading(true);
        try {
            const data = new FormData();
            if (formData.name) data.append('name', formData.name);
            // username is read-only usually, or mapped to 'username' which key "username" in backend expected? 
            // The modal mapped 'handle' to 'username'. Backend expects 'username'.
            if (formData.username) data.append('username', formData.username);
            if (formData.bio) data.append('bio', formData.bio);

            if (avatarFile) {
                data.append('avatar', avatarFile);
            }

            await authService.updateProfile(data);
            await refreshUser();
            alert('Profile updated successfully!');
            setAvatarFile(null); // Reset file input
        } catch (error) {
            console.error("Update failed:", error);
            alert('Failed to update profile');
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };
    const [notifications, setNotifications] = useState({
        email: true,
        push: true,
        marketing: false
    });

    const toggleNotification = (key) => {
        setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const sections = [
        { id: 'account', label: 'Account', icon: 'ri-user-settings-line' },
        { id: 'wallet', label: 'Wallet', icon: 'ri-wallet-3-line' },
        { id: 'preferences', label: 'Preferences', icon: 'ri-settings-4-line' },
        { id: 'support', label: 'Support', icon: 'ri-customer-service-2-line' }
    ];

    return (
        <div className="content-area" style={{ flexDirection: 'column', height: 'auto', paddingBottom: '100px' }}>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '30px' }}>
                <div style={{
                    width: '50px', height: '50px',
                    borderRadius: '16px', background: 'var(--glass-bg)',
                    border: '1px solid var(--glass-border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '24px', color: 'var(--light-blue)'
                }}>
                    <i className="ri-settings-3-fill"></i>
                </div>
                <div>
                    <h1 style={{ fontSize: '32px', fontFamily: 'MiSans-Bold', color: 'var(--off-white)' }}>Settings</h1>
                    <p style={{ color: 'var(--light-blue)', opacity: 0.7 }}>Manage your account and preferences</p>
                </div>
            </div>

            <div className="dashboard-grid">
                {/* Sidebar Nav */}
                <div className="dashboard-sidebar" style={{ flex: '1' }}>
                    <div style={{
                        background: 'var(--glass-bg)',
                        backdropFilter: 'blur(20px)',
                        borderRadius: '24px',
                        border: '1px solid var(--glass-border)',
                        padding: '20px',
                        position: 'sticky',
                        top: '20px'
                    }}>
                        {sections.map(section => (
                            <div
                                key={section.id}
                                onClick={() => setActiveSection(section.id)}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '15px',
                                    padding: '16px 20px',
                                    borderRadius: '16px',
                                    cursor: 'pointer',
                                    marginBottom: '8px',
                                    background: activeSection === section.id ? 'rgba(74, 127, 167, 0.2)' : 'transparent',
                                    border: activeSection === section.id ? '1px solid var(--medium-blue)' : '1px solid transparent',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                <i className={section.icon} style={{ fontSize: '20px', color: activeSection === section.id ? 'var(--light-blue)' : 'rgba(255,255,255,0.5)' }}></i>
                                <span style={{ color: activeSection === section.id ? 'var(--off-white)' : 'rgba(255,255,255,0.6)', fontWeight: '600', fontFamily: 'MiSans-Medium' }}>{section.label}</span>
                                {activeSection === section.id && <i className="ri-arrow-right-s-line" style={{ marginLeft: 'auto', color: 'var(--light-blue)' }}></i>}
                            </div>
                        ))}

                        <div style={{ marginTop: '40px', paddingTop: '20px', borderTop: '1px solid var(--glass-border)' }}>
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: '15px',
                                padding: '16px 20px',
                                borderRadius: '16px',
                                cursor: 'pointer',
                                color: '#ff4757',
                                transition: 'background 0.2s',
                            }}
                                onClick={handleLogout}
                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255, 71, 87, 0.1)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                            >
                                <i className="ri-logout-box-r-line" style={{ fontSize: '20px' }}></i>
                                <span style={{ fontWeight: '600', fontFamily: 'MiSans-Medium' }}>Log Out</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content Area */}
                <div style={{ flex: '2.5', minWidth: '300px' }}>
                    <AnimatePresence mode='wait'>
                        {activeSection === 'account' && (
                            <motion.div
                                key="account"
                                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                                style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
                            >
                                <SectionCard title="Profile Information">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '24px', flexWrap: 'wrap' }}>
                                        <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--glass-bg)', padding: '4px', border: '1px solid var(--glass-border)' }}>
                                            <div style={{ width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden', background: '#ccc' }}>
                                                <img src={avatarPreview || user?.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=User"} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            </div>
                                        </div>
                                        <div>
                                            <input
                                                type="file"
                                                id="avatar-upload"
                                                style={{ display: 'none' }}
                                                accept="image/*"
                                                onChange={handleFileChange}
                                            />
                                            <button
                                                onClick={() => document.getElementById('avatar-upload').click()}
                                                style={{
                                                    padding: '10px 20px', fontSize: '14px', background: 'var(--light-blue)', color: 'var(--dark-blue)',
                                                    border: 'none', borderRadius: '12px', cursor: 'pointer', fontFamily: 'MiSans-Bold', fontWeight: 'bold'
                                                }}>Change Avatar</button>
                                            <div style={{ fontSize: '12px', color: 'var(--light-blue)', opacity: 0.6, marginTop: '8px' }}>Max file size 5MB</div>
                                        </div>
                                    </div>

                                    <div className="form-group" style={{ marginBottom: '20px' }}>
                                        <label style={{ display: 'block', color: 'var(--light-blue)', opacity: 0.8, marginBottom: '8px', fontSize: '14px', fontFamily: 'MiSans-Medium' }}>Display Name</label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            style={{
                                                width: '100%', padding: '16px', background: 'rgba(10, 25, 49, 0.5)', border: '1px solid var(--glass-border)',
                                                borderRadius: '16px', color: 'var(--off-white)', outline: 'none', fontFamily: 'MiSans-Regular'
                                            }}
                                        />
                                    </div>
                                    <div className="form-group" style={{ marginBottom: '20px' }}>
                                        <label style={{ display: 'block', color: 'var(--light-blue)', opacity: 0.8, marginBottom: '8px', fontSize: '14px', fontFamily: 'MiSans-Medium' }}>Username</label>
                                        <input
                                            type="text"
                                            name="username"
                                            value={formData.username}
                                            onChange={handleChange}
                                            style={{
                                                width: '100%', padding: '16px', background: 'rgba(10, 25, 49, 0.5)', border: '1px solid var(--glass-border)',
                                                borderRadius: '16px', color: 'var(--off-white)', outline: 'none', fontFamily: 'MiSans-Regular'
                                            }}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label style={{ display: 'block', color: 'var(--light-blue)', opacity: 0.8, marginBottom: '8px', fontSize: '14px', fontFamily: 'MiSans-Medium' }}>Bio</label>
                                        <textarea
                                            name="bio"
                                            value={formData.bio}
                                            onChange={handleChange}
                                            rows="3"
                                            style={{
                                                width: '100%', padding: '16px', background: 'rgba(10, 25, 49, 0.5)', border: '1px solid var(--glass-border)',
                                                borderRadius: '16px', color: 'var(--off-white)', outline: 'none', fontFamily: 'MiSans-Regular', resize: 'vertical'
                                            }}
                                        />
                                    </div>

                                    <div style={{ marginTop: '24px', display: 'flex', justifySelf: 'flex-end' }}>
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
                                                cursor: isLoading ? 'not-allowed' : 'pointer',
                                                fontSize: '16px',
                                                boxShadow: '0 0 15px rgba(0,255,128,0.3)',
                                                width: 'fit-content'
                                            }}
                                        >
                                            {isLoading ? 'Saving...' : 'Save Changes'}
                                        </button>
                                    </div>
                                </SectionCard>

                                <SectionCard title="Security">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderBottom: '1px solid var(--glass-border)' }}>
                                        <div>
                                            <div style={{ color: 'var(--off-white)', fontWeight: '600', fontFamily: 'MiSans-Medium' }}>Password</div>
                                            <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>Last changed 3 months ago</div>
                                        </div>
                                        <button style={{
                                            padding: '8px 16px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', color: 'var(--light-blue)',
                                            border: '1px solid var(--glass-border)', cursor: 'pointer'
                                        }}>Change</button>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0' }}>
                                        <div>
                                            <div style={{ color: 'var(--off-white)', fontWeight: '600', fontFamily: 'MiSans-Medium' }}>Two-Factor Authentication</div>
                                            <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>Add an extra layer of security</div>
                                        </div>
                                        <Switch checked={false} />
                                    </div>
                                </SectionCard>
                            </motion.div>
                        )}

                        {activeSection === 'wallet' && (
                            <motion.div
                                key="wallet"
                                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                                style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
                            >
                                <SectionCard title="DareCoin Wallet">
                                    <div style={{
                                        background: 'linear-gradient(135deg, rgba(74, 127, 167, 0.1), rgba(10, 25, 49, 0.5))',
                                        padding: '24px',
                                        borderRadius: '20px',
                                        border: '1px solid var(--medium-blue)',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                            <div style={{ width: '48px', height: '48px', background: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                {/* Internal Wallet Icon */}
                                                <i className="ri-wallet-3-fill" style={{ fontSize: '24px', color: '#0a1931' }}></i>
                                            </div>
                                            <div>
                                                <div style={{ color: 'var(--off-white)', fontWeight: 'bold', fontSize: '18px', fontFamily: 'MiSans-Bold' }}>My Balance</div>
                                                <div style={{ color: 'var(--light-blue)', fontSize: '24px', fontFamily: 'MiSans-Bold' }}>
                                                    {isLoadingWallet ? 'Using scouter...' : `${walletData?.balance || user?.walletBalance || 0} DRC`}
                                                </div>
                                            </div>
                                        </div>
                                        {/* Placeholder for topup or future web3 connect */}
                                        <button style={{
                                            background: 'rgba(0, 255, 128, 0.1)', color: '#00ff80', border: '1px solid rgba(0, 255, 128, 0.3)',
                                            padding: '8px 16px', borderRadius: '10px', cursor: 'pointer', fontFamily: 'MiSans-Medium'
                                        }}>Top Up</button>
                                    </div>

                                    <div style={{ marginTop: '24px' }}>
                                        <h4 style={{ color: 'var(--off-white)', marginBottom: '16px', fontFamily: 'MiSans-Bold' }}>Transaction History</h4>
                                        {isLoadingWallet ? (
                                            <div style={{ textAlign: 'center', color: 'var(--light-blue)', padding: '20px' }}>Loading transactions...</div>
                                        ) : walletData?.transactions && walletData.transactions.length > 0 ? (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                {walletData.transactions.map((tx) => (
                                                    <div key={tx._id} style={{
                                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                                        padding: '12px 16px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px',
                                                        border: '1px solid var(--glass-border)'
                                                    }}>
                                                        <div>
                                                            <div style={{ color: 'var(--off-white)', fontWeight: '600', fontSize: '14px', textTransform: 'capitalize' }}>
                                                                {tx.type.replace('_', ' ')}
                                                            </div>
                                                            <div style={{ color: 'var(--light-blue)', fontSize: '12px', opacity: 0.7 }}>
                                                                {new Date(tx.createdAt).toLocaleDateString()} • {tx.description}
                                                            </div>
                                                        </div>
                                                        <div style={{
                                                            color: tx.amount > 0 ? '#00ff80' : '#ff4757',
                                                            fontWeight: 'bold', fontFamily: 'monospace'
                                                        }}>
                                                            {tx.amount > 0 ? '+' : ''}{tx.amount} DRC
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div style={{
                                                textAlign: 'center', padding: '40px', color: 'var(--light-blue)', opacity: 0.5, fontStyle: 'italic',
                                                border: '2px dashed var(--glass-border)', borderRadius: '16px'
                                            }}>No recent transactions</div>
                                        )}
                                    </div>
                                </SectionCard>
                            </motion.div>
                        )}

                        {activeSection === 'preferences' && (
                            <motion.div
                                key="preferences"
                                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                                style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
                            >
                                <SectionCard title="Notifications">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderBottom: '1px solid var(--glass-border)' }}>
                                        <div>
                                            <div style={{ color: 'var(--off-white)', fontWeight: '600', fontFamily: 'MiSans-Medium' }}>Email Notifications</div>
                                            <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>Get updates about your dares</div>
                                        </div>
                                        <Switch checked={notifications.email} onChange={() => toggleNotification('email')} />
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderBottom: '1px solid var(--glass-border)' }}>
                                        <div>
                                            <div style={{ color: 'var(--off-white)', fontWeight: '600', fontFamily: 'MiSans-Medium' }}>Push Notifications</div>
                                            <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>Real-time alerts on your device</div>
                                        </div>
                                        <Switch checked={notifications.push} onChange={() => toggleNotification('push')} />
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0' }}>
                                        <div>
                                            <div style={{ color: 'var(--off-white)', fontWeight: '600', fontFamily: 'MiSans-Medium' }}>Marketing Emails</div>
                                            <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>News, updates, and promotions</div>
                                        </div>
                                        <Switch checked={notifications.marketing} onChange={() => toggleNotification('marketing')} />
                                    </div>
                                </SectionCard>

                                <SectionCard title="Appearance">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0' }}>
                                        <div>
                                            <div style={{ color: 'var(--off-white)', fontWeight: '600', fontFamily: 'MiSans-Medium' }}>Dark Mode</div>
                                            <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>This app is currently dark-mode only</div>
                                        </div>
                                        <div style={{
                                            padding: '6px 16px', background: 'rgba(255,255,255,0.1)', borderRadius: '100px',
                                            fontSize: '12px', color: 'var(--off-white)', cursor: 'default', border: '1px solid var(--glass-border)'
                                        }}>
                                            Always On
                                        </div>
                                    </div>
                                </SectionCard>
                            </motion.div>
                        )}

                        {activeSection === 'support' && (
                            <motion.div
                                key="support"
                                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                                style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
                            >
                                <SectionCard title="Help & Support">
                                    <div style={{ color: 'var(--light-blue)', lineHeight: '1.6', opacity: 0.8 }}>
                                        Need help with DareCoin? Check our FAQ or contact our support team.
                                    </div>
                                    <button style={{
                                        width: 'fit-content', marginTop: '16px', padding: '12px 24px', background: 'var(--medium-blue)',
                                        color: 'white', borderRadius: '12px', border: 'none', cursor: 'pointer', fontFamily: 'MiSans-Bold'
                                    }}>Visit Help Center</button>

                                    <div style={{ marginTop: '30px', borderTop: '1px solid var(--glass-border)', paddingTop: '20px' }}>
                                        <div style={{ display: 'flex', gap: '20px', color: 'var(--light-blue)', fontSize: '14px', opacity: 0.6 }}>
                                            <span style={{ cursor: 'pointer', textDecoration: 'underline' }}>Terms of Service</span>
                                            <span style={{ cursor: 'pointer', textDecoration: 'underline' }}>Privacy Policy</span>
                                        </div>
                                    </div>
                                </SectionCard>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}

const SectionCard = ({ title, children }) => (
    <div style={{
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(20px)',
        borderRadius: '24px',
        border: '1px solid var(--glass-border)',
        padding: '30px',
        boxShadow: 'var(--glass-shadow)'
    }}>
        <h3 style={{ fontSize: '18px', color: 'var(--light-blue)', marginBottom: '24px', fontFamily: 'MiSans-Bold', textTransform: 'uppercase', letterSpacing: '1px' }}>{title}</h3>
        {children}
    </div>
);

const Switch = ({ checked, onChange }) => (
    <div
        onClick={onChange}
        style={{
            width: '44px', height: '24px',
            background: checked ? 'var(--medium-blue)' : 'rgba(255,255,255,0.1)',
            borderRadius: '12px',
            position: 'relative',
            cursor: 'pointer',
            transition: 'background 0.3s ease'
        }}
    >
        <div style={{
            width: '20px', height: '20px',
            background: 'white',
            borderRadius: '50%',
            position: 'absolute',
            top: '2px',
            left: checked ? '22px' : '2px',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
        }}></div>
    </div>
);
