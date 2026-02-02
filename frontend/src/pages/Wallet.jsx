import React, { useState, useEffect } from 'react';
import { walletService } from '../services/api';
import { paymentService } from '../services/paymentService';
import { useAuth } from '../context/AuthContext';
import PaymentSuccessModal from '../components/PaymentSuccessModal';

export default function Wallet() {
    const { refreshUser } = useAuth();
    const [balance, setBalance] = useState(0);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showTopUpModal, setShowTopUpModal] = useState(false);
    const [showTransferModal, setShowTransferModal] = useState(false);
    const [recipient, setRecipient] = useState('');
    const [transferAmount, setTransferAmount] = useState('');

    // Success Modal State
    const [successModalData, setSuccessModalData] = useState(null);

    const fetchWalletData = async () => {
        try {
            const data = await walletService.getBalance();
            setBalance(data.balance);
            setTransactions(data.transactions);
        } catch (error) {
            console.error("Failed to fetch wallet data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWalletData();
    }, []);

    // Handle Top Up (Mock Payment)
    const handleTopUp = async (plan) => {
        // Confirm Mock Purchase
        const confirmBuy = window.confirm(`Confirm purchase of ${plan.label} for ₹${plan.price}? \n(Demo Payment Mode)`);
        if (!confirmBuy) return;

        setLoading(true);

        try {
            // Simulate network delay
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Call Mock API
            const res = await paymentService.mockPayment(plan.price, plan.drc, plan.id);

            if (res.success) {
                // Refresh Data
                await fetchWalletData();
                await refreshUser();

                // Close TopUp Modal and Show Success Modal
                setShowTopUpModal(false);
                setSuccessModalData({ amount: plan.price, drc: plan.drc });
            } else {
                alert('Payment failed: ' + (res.message || 'Unknown error'));
            }
        } catch (error) {
            console.error("Payment failed", error);
            // Even if it fails, check if balance updated? No, standard error handling.
            alert("Payment logic error: " + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    const shopItems = [
        { id: 1, name: 'Double XP Boost', price: 100, icon: 'ri-flashlight-fill' },
        { id: 2, name: 'Profile Highlight', price: 300, icon: 'ri-star-smile-fill' },
        { id: 3, name: 'Custom Theme', price: 500, icon: 'ri-palette-fill' },
    ];

    const coinPacks = [
        { id: 'starter', price: 100, drc: 500, label: 'Starter Pack', popular: false },
        { id: 'pro', price: 500, drc: 3000, label: 'Pro Pack', popular: true },
        { id: 'elite', price: 1000, drc: 7000, label: 'Elite Pack', popular: false },
    ];

    const handleTransfer = async (e) => {
        e.preventDefault();
        try {
            await walletService.transfer(recipient, Number(transferAmount));
            setShowTransferModal(false);
            setRecipient('');
            setTransferAmount('');
            await fetchWalletData(); // Refresh data
            await refreshUser(); // Refresh global user data (header balance)
            alert('Transfer successful!');
        } catch (error) {
            console.error("Transfer failed", error);
            alert('Transfer failed: ' + (error.response?.data?.message || error.message));
        }
    };

    if (loading) return <div className="content-area">Loading wallet...</div>;

    return (
        <div className="content-area">
            {/* Left Panel - Balance & Actions */}
            <div className="left-panel">
                <h2 className="trending-title">My Wallet</h2>

                {/* Balance Card */}
                <div className="wallet-balance-card">
                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <div style={{ fontSize: '16px', color: 'rgba(255,255,255,0.7)', marginBottom: '8px' }}>Total Balance</div>
                        <div style={{ fontSize: '48px', fontFamily: 'MiSans-Bold', color: '#fff', marginBottom: '8px' }}>{balance.toFixed(2)} <span style={{ fontSize: '20px' }}>DRC</span></div>
                        <div style={{ fontSize: '14px', color: 'var(--light-blue)' }}>+ 15.4% from last week</div>
                    </div>
                    <i className="ri-wallet-3-fill" style={{
                        position: 'absolute',
                        right: '-20px',
                        bottom: '-20px',
                        fontSize: '150px',
                        opacity: '0.1',
                        color: '#fff'
                    }}></i>
                </div>

                {/* Quick Actions */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                    {['Top Up', 'Withdraw', 'Transfer'].map((action, idx) => (
                        <button key={idx}
                            onClick={() => {
                                if (action === 'Top Up') setShowTopUpModal(true);
                                if (action === 'Transfer') setShowTransferModal(true);
                            }}
                            className="dare-item" style={{
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'center',
                                padding: '20px',
                                gap: '10px',
                                border: '1px solid var(--glass-border)',
                                background: 'rgba(255,255,255,0.05)',
                                cursor: 'pointer'
                            }}>
                            <div className="play-btn-small" style={{ width: '50px', height: '50px', fontSize: '24px' }}>
                                <i className={
                                    action === 'Top Up' ? 'ri-add-line' :
                                        action === 'Withdraw' ? 'ri-arrow-right-up-line' :
                                            'ri-arrow-left-right-line'
                                }></i>
                            </div>
                            <span style={{ fontSize: '14px', color: 'var(--off-white)' }}>{action}</span>
                        </button>
                    ))}
                </div>

                {/* Recent Transactions */}
                <div style={{ marginTop: '30px' }}>
                    <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 className="dare-title-sm">Recent Activity</h3>
                        <span style={{ color: 'var(--light-blue)', fontSize: '14px', cursor: 'pointer' }}>View All</span>
                    </div>
                    <div className="dare-list" style={{ marginTop: '16px', maxHeight: '300px', overflowY: 'auto' }}>
                        {transactions.map(tx => (
                            <div key={tx._id} className="dare-item" style={{ padding: '16px 20px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                    <div className="play-btn-small" style={{
                                        background: tx.amount > 0 ? 'rgba(0, 255, 128, 0.1)' : 'rgba(255, 99, 71, 0.1)',
                                        color: tx.amount > 0 ? '#00ff80' : '#ff6347',
                                        border: 'none',
                                        width: '40px',
                                        height: '40px'
                                    }}>
                                        <i className={tx.amount > 0 ? 'ri-arrow-left-down-line' : 'ri-arrow-right-up-line'}></i>
                                    </div>
                                    <div>
                                        <div style={{ color: 'var(--off-white)', fontSize: '16px' }}>{tx.title || tx.description || tx.type}</div>
                                        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>
                                            {new Date(tx.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                                <div style={{
                                    color: tx.amount > 0 ? '#00ff80' : '#ff6347',
                                    fontFamily: 'MiSans-Bold',
                                    fontSize: '18px'
                                }}>
                                    {tx.amount > 0 ? '+' : ''}{tx.amount}
                                </div>
                            </div>
                        ))}
                        {transactions.length === 0 && <div style={{ padding: '20px', color: 'rgba(255,255,255,0.5)', textAlign: 'center' }}>No transactions yet</div>}
                    </div>
                </div>
            </div>

            {/* Right Panel - Marketplace */}
            <div className="right-panel no-scrollbar" style={{ overflowY: 'auto' }}>
                <h2 className="trending-title" style={{ fontSize: '32px' }}>Marketplace</h2>

                <div style={{
                    background: 'rgba(10, 25, 49, 0.4)',
                    borderRadius: '20px',
                    padding: '24px',
                    marginBottom: '20px'
                }}>
                    <h3 className="dare-title-sm" style={{ marginBottom: '16px' }}>Featured Item</h3>
                    <div className="market-feature-card">
                        <i className="ri-vip-crown-fill" style={{ fontSize: '100px', color: 'rgba(255,255,255,0.2)' }}></i>
                        <div className="market-feature-content" style={{ position: 'absolute', bottom: '20px', left: '20px' }}>
                            <div style={{ color: '#fff', fontSize: '24px', fontFamily: 'MiSans-Bold' }}>DareMaster Pro</div>
                            <div style={{ color: 'var(--light-blue)' }}>Unlock exclusive dares & badges</div>
                        </div>
                        <button className="play-btn-small market-feature-btn" style={{ position: 'absolute', right: '20px', bottom: '20px', width: 'auto', padding: '0 24px', borderRadius: '12px' }}>
                            Buy 1000 DRC
                        </button>
                    </div>
                </div>

                <h3 className="dare-title-sm">Shop Items</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    {shopItems.map(item => (
                        <div key={item.id} className="stat-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                            <div className="play-btn-small" style={{ width: '60px', height: '60px', fontSize: '28px', background: 'rgba(255,255,255,0.05)' }}>
                                <i className={item.icon}></i>
                            </div>
                            <div style={{ color: 'var(--off-white)', fontSize: '16px' }}>{item.name}</div>
                            <div className="tag" style={{ background: 'rgba(255,255,255,0.1)', color: 'var(--light-blue)' }}>
                                {item.price} DRC
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Top Up Modal */}
            {showTopUpModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)',
                    zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <div style={{
                        width: '90%', maxWidth: '500px',
                        background: 'var(--dark-blue)',
                        backgroundImage: 'linear-gradient(145deg, rgba(26, 61, 99, 0.4) 0%, rgba(10, 25, 49, 0.8) 100%)',
                        border: '1px solid var(--glass-border)',
                        borderRadius: '24px', padding: '30px', position: 'relative'
                    }}>
                        <button onClick={() => setShowTopUpModal(false)}
                            style={{ position: 'absolute', top: '20px', right: '20px', background: 'transparent', border: 'none', color: 'var(--light-blue)', fontSize: '24px', cursor: 'pointer' }}>
                            <i className="ri-close-line"></i>
                        </button>

                        <h3 style={{ fontFamily: 'MiSans-Bold', fontSize: '24px', color: 'var(--off-white)', marginBottom: '8px', textAlign: 'center' }}>Top Up Wallet</h3>
                        <p style={{ color: 'var(--light-blue)', textAlign: 'center', marginBottom: '30px', fontSize: '14px' }}>Select a coin pack to purchase</p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {coinPacks.map(pack => (
                                <div key={pack.id} onClick={() => handleTopUp(pack)} style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    padding: '20px', borderRadius: '16px',
                                    background: pack.popular ? 'rgba(77, 166, 255, 0.1)' : 'rgba(255,255,255,0.03)',
                                    border: pack.popular ? '1px solid #4da6ff' : '1px solid var(--glass-border)',
                                    cursor: 'pointer', transition: 'all 0.2s'
                                }}
                                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                        <div style={{
                                            width: '50px', height: '50px', borderRadius: '50%',
                                            background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            color: '#000', fontSize: '24px', boxShadow: '0 4px 12px rgba(255, 215, 0, 0.3)'
                                        }}>
                                            <i className="ri-database-2-fill"></i>
                                        </div>
                                        <div>
                                            <div style={{ color: 'var(--off-white)', fontSize: '18px', fontFamily: 'MiSans-Bold' }}>{pack.drc} DRC</div>
                                            <div style={{ color: 'var(--light-blue)', fontSize: '14px' }}>{pack.label}</div>
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ color: '#fff', fontSize: '20px', fontFamily: 'MiSans-Bold' }}>₹{pack.price}</div>
                                        {pack.popular && <span style={{ fontSize: '10px', background: '#4da6ff', color: '#fff', padding: '2px 8px', borderRadius: '10px' }}>POPULAR</span>}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div style={{ marginTop: '24px', textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>
                            <i className="ri-secure-payment-line" style={{ verticalAlign: 'middle', marginRight: '4px' }}></i>
                            Secured by Razorpay
                        </div>
                    </div>
                </div>
            )}

            {/* Transfer Modal */}
            {showTransferModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.8)',
                    backdropFilter: 'blur(5px)',
                    zIndex: 1000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <div style={{
                        width: '400px',
                        background: 'var(--glass-bg)',
                        border: '1px solid var(--glass-border)',
                        borderRadius: '20px',
                        padding: '30px',
                        position: 'relative'
                    }}>
                        <button
                            onClick={() => setShowTransferModal(false)}
                            style={{
                                position: 'absolute',
                                top: '15px',
                                right: '15px',
                                background: 'transparent',
                                border: 'none',
                                color: 'var(--off-white)',
                                fontSize: '24px',
                                cursor: 'pointer'
                            }}
                        >
                            <i className="ri-close-line"></i>
                        </button>

                        <h3 className="dare-title-sm" style={{ marginBottom: '20px', textAlign: 'center' }}>Transfer Coins</h3>

                        <form onSubmit={handleTransfer} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <div>
                                <label style={{ display: 'block', color: 'rgba(255,255,255,0.5)', marginBottom: '5px', fontSize: '14px' }}>Recipient Username</label>
                                <input
                                    type="text"
                                    value={recipient}
                                    onChange={(e) => setRecipient(e.target.value)}
                                    placeholder="Enter username"
                                    required
                                    style={{
                                        width: '100%',
                                        background: 'rgba(255,255,255,0.05)',
                                        border: '1px solid var(--glass-border)',
                                        borderRadius: '10px',
                                        padding: '12px 15px',
                                        color: 'white',
                                        outline: 'none'
                                    }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', color: 'rgba(255,255,255,0.5)', marginBottom: '5px', fontSize: '14px' }}>Amount (DRC)</label>
                                <input
                                    type="number"
                                    value={transferAmount}
                                    onChange={(e) => setTransferAmount(e.target.value)}
                                    placeholder="0"
                                    min="1"
                                    required
                                    style={{
                                        width: '100%',
                                        background: 'rgba(255,255,255,0.05)',
                                        border: '1px solid var(--glass-border)',
                                        borderRadius: '10px',
                                        padding: '12px 15px',
                                        color: 'white',
                                        outline: 'none'
                                    }}
                                />
                            </div>

                            <button type="submit" className="play-btn" style={{ marginTop: '10px', width: '100%', justifyContent: 'center' }}>
                                Send Coins <i className="ri-send-plane-fill"></i>
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Success Modal */}
            {successModalData && (
                <PaymentSuccessModal
                    amount={successModalData.amount}
                    drc={successModalData.drc}
                    onClose={() => setSuccessModalData(null)}
                />
            )}
        </div>
    );
}
