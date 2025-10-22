// client/src/App.js (Final RBAC Version)
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useUser } from './context/UserContext';

// Pages
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import Menu from './pages/Menu';
import TableStatus from './pages/TableStatus';
import KOTStatusPage from './pages/KOTStatusPage';
import BillingPage from './pages/BillingPage';
import OrderHistory from './pages/OrderHistory';
import OnlineOrdersPage from './pages/OnlineOrders'; // Assuming OnlineOrders.jsx
import SimulateOnlineOrder from './pages/SimulateOnlineOrder';

// --- Authorization Configuration ---
const ROLE_ACCESS = {
  // Primary View
  '/dashboard': ['admin', 'servicemanager', 'cashier'],
  '/kot-status': ['kitchenmanager'],
  '/table-status': ['waiter'],
};

// --- Protected Route Component ---
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, role } = useUser();

  // Redirect to login if not logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If role is authorized for this route, allow access
  if (allowedRoles && allowedRoles.includes(role)) {
    return children;
  }

  // If unauthorized, redirect to their Primary View
  const primaryView = Object.entries(ROLE_ACCESS).find(([, roles]) => roles.includes(role))?.[0] || '/dashboard';

  // If they are on an unauthorized route, redirect them.
  if (window.location.pathname !== primaryView) {
      return <Navigate to={primaryView} replace />;
  }

  // Fallback: If they are on their primary view, just show it (shouldn't happen with correct routing)
  return <Navigate to="/dashboard" replace />;
};
// ---------------------------------


export default function App() {
  const { user, role } = useUser();

  // --- Initial Path Redirect Logic (Primary View) ---
  const getInitialPath = () => {
    if (!user) return <Navigate to="/login" replace />;

    // Find the primary view for the current role
    const path = Object.entries(ROLE_ACCESS).find(([, roles]) => roles.includes(role))?.[0];

    // Redirect to the role's primary view path
    return <Navigate to={path || '/dashboard'} replace />;
  };

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        {/* Root path redirects based on role */}
        <Route path="/" element={getInitialPath()} />

        {/* --- Protected Routes --- */}

        <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['admin', 'servicemanager', 'cashier']}><Dashboard /></ProtectedRoute>} />

        {/* Table Status: Manager/Admin, Waiter */}
        <Route path="/table-status" element={<ProtectedRoute allowedRoles={['admin', 'servicemanager', 'cashier', 'waiter']}><TableStatus /></ProtectedRoute>} />

        {/* Menu: Manager/Admin, Waiter */}
        <Route path="/menu" element={<ProtectedRoute allowedRoles={['admin', 'servicemanager', 'cashier', 'waiter']}><Menu /></ProtectedRoute>} />

        {/* KOT Status: All roles - THIS IS THE CRITICAL LINE */}
        <Route
          path="/kot-status"
          element={
            <ProtectedRoute allowedRoles={['admin', 'servicemanager', 'cashier', 'waiter', 'kitchenmanager']}>
              <KOTStatusPage />
            </ProtectedRoute>
          }
        />

        {/* Billing: Admin, Cashier */}
        <Route path="/billing" element={<ProtectedRoute allowedRoles={['admin', 'cashier']}><BillingPage /></ProtectedRoute>} />

        {/* History: Manager/Admin only */}
        <Route path="/order-history" element={<ProtectedRoute allowedRoles={['admin', 'servicemanager', 'cashier']}><OrderHistory /></ProtectedRoute>} />

        {/* Online Orders & Simulation: Manager/Admin, Kitchen Manager, Cashier */}
        <Route path="/online-orders" element={<ProtectedRoute allowedRoles={['admin', 'servicemanager', 'cashier', 'kitchenmanager']}><OnlineOrdersPage /></ProtectedRoute>} />
        <Route path="/simulate-online-order" element={<ProtectedRoute allowedRoles={['admin']}><SimulateOnlineOrder /></ProtectedRoute>} />

        {/* Placeholder for Procurement: Admin, Service Manager */}
        <Route path="/procurement" element={<ProtectedRoute allowedRoles={['admin', 'servicemanager']}>
            <div style={{ padding: 20 }}><h2>Procurement Page</h2><p>Content to be added later. Only visible to Admin/Managers.</p></div>
        </ProtectedRoute>} />

        {/* Catch-all for unknown routes */}
        <Route path="*" element={<h1>404 Not Found</h1>} />
      </Routes>
    </Router>
  );
}