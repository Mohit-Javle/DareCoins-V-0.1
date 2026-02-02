import React, { useState, useEffect } from 'react';
import { adminService } from '../services/api';

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const data = await adminService.getAllUsers();
            setUsers(data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const handleRoleUpdate = async (id, newRole) => {
        try {
            if (!window.confirm(`Are you sure you want to make this user ${newRole}?`)) return;
            await adminService.updateUser(id, { role: newRole });
            setUsers(users.map(u => u._id === id ? { ...u, role: newRole } : u));
            alert('User role updated!');
        } catch (error) {
            alert('Failed to update role');
        }
    };

    if (loading) return <div style={{ color: 'white', padding: '20px' }}>Loading users...</div>;
    if (error) return <div style={{ color: 'red', padding: '20px' }}>Error: {error}</div>;

    return (
        <div style={{ padding: '20px' }}>
            <h2 className="dare-title-sm" style={{ marginBottom: '20px' }}>User Management</h2>

            <div style={{ overflowX: 'auto', background: 'rgba(10, 25, 49, 0.6)', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', color: 'var(--off-white)' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'left' }}>
                            <th style={{ padding: '16px' }}>User</th>
                            <th style={{ padding: '16px' }}>Email</th>
                            <th style={{ padding: '16px' }}>Role</th>
                            <th style={{ padding: '16px' }}>Balance</th>
                            <th style={{ padding: '16px' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <td style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <img src={user.avatar} alt="" style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
                                    <span>{user.name || user.username}</span>
                                </td>
                                <td style={{ padding: '16px' }}>{user.email}</td>
                                <td style={{ padding: '16px' }}>
                                    <span style={{
                                        padding: '4px 8px', borderRadius: '4px', fontSize: '12px',
                                        background: user.role === 'admin' ? '#ff4757' : 'rgba(255,255,255,0.1)',
                                        color: 'white'
                                    }}>
                                        {user.role.toUpperCase()}
                                    </span>
                                </td>
                                <td style={{ padding: '16px' }}>{user.walletBalance} DRC</td>
                                <td style={{ padding: '16px' }}>
                                    {user.role !== 'admin' ? (
                                        <button
                                            onClick={() => handleRoleUpdate(user._id, 'admin')}
                                            style={{ background: '#ff4757', border: 'none', color: 'white', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                                        >
                                            Make Admin
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => handleRoleUpdate(user._id, 'user')}
                                            style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                                        >
                                            Remove Admin
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminUsers;
