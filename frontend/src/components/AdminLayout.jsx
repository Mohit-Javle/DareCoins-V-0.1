import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';

const AdminLayout = () => {
    return (
        <div style={{ display: 'flex', background: '#020617', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
            <AdminSidebar />
            <div style={{ flex: 1, marginLeft: '260px', padding: '32px' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default AdminLayout;
