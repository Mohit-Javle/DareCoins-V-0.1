import React, { createContext, useContext, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const ToastContext = createContext();

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const showToast = useCallback((message, type = 'info') => {
        const id = Date.now().toString();
        setToasts((prev) => [...prev, { id, message, type }]);

        // Auto remove after 3 seconds
        setTimeout(() => {
            removeToast(id);
        }, 3000);
    }, []);

    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div
                style={{
                    position: 'fixed',
                    bottom: '20px',
                    right: '20px',
                    zIndex: 9999,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    pointerEvents: 'none', // Allow clicks to pass through container
                }}
            >
                <AnimatePresence>
                    {toasts.map((toast) => (
                        <motion.div
                            key={toast.id}
                            initial={{ opacity: 0, y: 20, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                            layout
                            style={{
                                background: toast.type === 'error' ? 'rgba(255, 71, 87, 0.9)' :
                                    toast.type === 'success' ? 'rgba(0, 255, 128, 0.9)' :
                                        'rgba(10, 25, 49, 0.9)', // Default dark blue
                                color: '#fff',
                                padding: '12px 20px',
                                borderRadius: '12px',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                                backdropFilter: 'blur(10px)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                minWidth: '250px',
                                pointerEvents: 'auto', // Re-enable pointer events for the toast itself
                                fontSize: '14px',
                                fontFamily: 'MiSans-Medium'
                            }}
                        >
                            <i
                                className={
                                    toast.type === 'error' ? 'ri-error-warning-fill' :
                                        toast.type === 'success' ? 'ri-checkbox-circle-fill' :
                                            'ri-information-fill'
                                }
                                style={{ fontSize: '18px' }}
                            ></i>
                            {toast.message}
                            <button
                                onClick={() => removeToast(toast.id)}
                                style={{
                                    marginLeft: 'auto',
                                    background: 'transparent',
                                    border: 'none',
                                    color: 'rgba(255, 255, 255, 0.7)',
                                    cursor: 'pointer',
                                    padding: '0 4px',
                                    fontSize: '16px'
                                }}
                            >
                                <i className="ri-close-line"></i>
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
};
