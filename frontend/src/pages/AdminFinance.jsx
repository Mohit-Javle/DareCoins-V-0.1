import React, { useState, useEffect } from 'react';
import { adminService } from '../services/api';

const AdminFinance = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchTransactions();
    }, []);

    const fetchTransactions = async () => {
        try {
            const data = await adminService.getAllTransactions();
            setTransactions(data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load transactions');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div style={{ color: 'white', padding: '20px' }}>Loading transactions...</div>;
    if (error) return <div style={{ color: 'red', padding: '20px' }}>Error: {error}</div>;

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    return (
        <div style={{ padding: '20px' }}>
            <h2 className="dare-title-sm" style={{ marginBottom: '20px' }}>Financial Transactions</h2>

            <div style={{ overflowX: 'auto', background: 'rgba(10, 25, 49, 0.6)', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', color: 'var(--off-white)' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'left' }}>
                            <th style={{ padding: '16px' }}>Date</th>
                            <th style={{ padding: '16px' }}>User</th>
                            <th style={{ padding: '16px' }}>Type</th>
                            <th style={{ padding: '16px' }}>Description</th>
                            <th style={{ padding: '16px' }}>Amount</th>
                            <th style={{ padding: '16px' }}>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {transactions.map(tx => (
                            <tr key={tx._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <td style={{ padding: '16px', fontSize: '13px', opacity: 0.8 }}>{formatDate(tx.createdAt)}</td>
                                <td style={{ padding: '16px' }}>{tx.user?.username || 'Unknown'}</td>
                                <td style={{ padding: '16px' }}>
                                    <span style={{
                                        textTransform: 'capitalize',
                                        color: tx.type === 'deposit' ? '#4ade80' :
                                            tx.type === 'withdrawal' ? '#f87171' :
                                                '#94a3b8'
                                    }}>
                                        {tx.type}
                                    </span>
                                </td>
                                <td style={{ padding: '16px', fontSize: '13px' }}>{tx.description}</td>
                                <td style={{ padding: '16px', fontWeight: 'bold', color: tx.amount >= 0 ? '#4ade80' : '#f87171' }}>
                                    {tx.amount > 0 ? '+' : ''}{tx.amount} DRC
                                </td>
                                <td style={{ padding: '16px' }}>
                                    <span style={{
                                        padding: '4px 8px', borderRadius: '4px', fontSize: '12px',
                                        background: tx.status === 'completed' ? 'rgba(74, 222, 128, 0.1)' : 'rgba(255,255,255,0.1)',
                                        color: tx.status === 'completed' ? '#4ade80' : 'white'
                                    }}>
                                        {tx.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminFinance;
