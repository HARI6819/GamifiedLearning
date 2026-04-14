import React from 'react';
import { Navigate } from 'react-router-dom';

const AdminProtectedRoute = ({ children }) => {
    const isAdmin = localStorage.getItem('isAdmin');

    if (!isAdmin) {
        // Redirect to admin login if not admin
        return <Navigate to="/admin-login" replace />;
    }

    return children;
};

export default AdminProtectedRoute;