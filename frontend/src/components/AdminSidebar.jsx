import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminSidebar = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const links = [
        { path: '/admin', icon: 'ri-dashboard-3-line', label: 'Dashboard', end: true },
        { path: '/admin/users', icon: 'ri-group-line', label: 'Users' },
        { path: '/admin/dares', icon: 'ri-flag-line', label: 'Moderation' },
        { path: '/admin/content', icon: 'ri-file-add-line', label: 'Content' },
        { path: '/admin/finance', icon: 'ri-wallet-3-line', label: 'Finance' },
        { path: '/admin/analytics', icon: 'ri-pie-chart-2-line', label: 'Analytics' },
    ];

    return (
        <div style={{
            width: '260px',
            height: '100vh',
            background: '#0f172a', // Slate 900 - Professional Dark
            borderRight: '1px solid #1e293b', // Slate 800
            display: 'flex',
            flexDirection: 'column',
            padding: '24px',
            position: 'fixed',
            left: 0,
            top: 0,
            zIndex: 100
        }}>
            <div style={{ marginBottom: '40px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                    width: '36px', height: '36px',
                    background: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
                    borderRadius: '8px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <i className="ri-shield-star-fill" style={{ fontSize: '20px', color: 'white' }}></i>
                </div>
                <div>
                    <div style={{ color: 'white', fontWeight: 'bold', fontSize: '18px', fontFamily: 'Inter, sans-serif' }}>Admin Panel</div>
                    <div style={{ color: '#94a3b8', fontSize: '12px' }}>DareCoin Manager</div>
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                {links.map(link => (
                    <NavLink
                        key={link.path}
                        to={link.path}
                        end={link.end}
                        style={({ isActive }) => ({
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '12px 16px',
                            borderRadius: '8px',
                            color: isActive ? 'white' : '#94a3b8',
                            background: isActive ? '#3b82f6' : 'transparent', // Professional Blue
                            textDecoration: 'none',
                            fontSize: '14px',
                            fontWeight: isActive ? '600' : '400',
                            transition: 'all 0.2s ease',
                            fontFamily: 'Inter, sans-serif'
                        })}
                    >
                        <i className={link.icon} style={{ fontSize: '18px' }}></i>
                        {link.label}
                    </NavLink>
                ))}
            </div>

            <button
                onClick={handleLogout}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    color: '#ef4444', // Red 500
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontFamily: 'Inter, sans-serif',
                    marginTop: 'auto'
                }}
            >
                <i className="ri-logout-box-line"></i>
                Logout
            </button>
        </div>
    );
};

export default AdminSidebar;
