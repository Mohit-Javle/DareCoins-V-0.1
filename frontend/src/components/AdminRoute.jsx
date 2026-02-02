import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminRoute = ({ children }) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return <div>Loading...</div>;
    }

    // If not logged in, go to login
    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // If logged in but NOT admin, go to dashboard
    if (user.role !== 'admin') {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

export default AdminRoute;
