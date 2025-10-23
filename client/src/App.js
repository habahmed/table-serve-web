// client/src/App.js (Final RBAC Version with Procurement component)
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
import OnlineOrdersPage from './pages/OnlineOrders';
import SimulateOnlineOrder from './pages/SimulateOnlineOrder';
import PendingOrdersPage from './pages/PendingOrdersPage';
import OrderConfirmation from './pages/OrderConfirmation';
// ✅ NEW IMPORT
import Procurement from './pages/Procurement';

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

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && allowedRoles.includes(role)) {
    return children;
  }

  // If unauthorized, redirect to their Primary View
  const primaryView = Object.entries(ROLE_ACCESS).find(([, roles]) => roles.includes(role))?.[0] || '/dashboard';

  if (window.location.pathname !== primaryView) {
      return <Navigate to={primaryView} replace />;
  }

  return <Navigate to="/dashboard" replace />;
};
// ---------------------------------


export default function App() {
  const { user, role } = useUser();

  // --- Initial Path Redirect Logic (Primary View) ---
  const getInitialPath = () => {
    if (!user) return <Navigate to="/login" replace />;

    const path = Object.entries(ROLE_ACCESS).find(([, roles]) => roles.includes(role))?.[0];

    return <Navigate to={path || '/dashboard'} replace />;
  };

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={getInitialPath()} />

        {/* --- Protected Routes --- */}

        <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['admin', 'servicemanager', 'cashier']}><Dashboard /></ProtectedRoute>} />
        <Route path="/table-status" element={<ProtectedRoute allowedRoles={['admin', 'servicemanager', 'cashier', 'waiter']}><TableStatus /></ProtectedRoute>} />
        <Route path="/menu" element={<ProtectedRoute allowedRoles={['admin', 'servicemanager', 'cashier', 'waiter']}><Menu /></ProtectedRoute>} />
        <Route path="/kot-status" element={<ProtectedRoute allowedRoles={['admin', 'servicemanager', 'cashier', 'waiter', 'kitchenmanager']}><KOTStatusPage /></ProtectedRoute>} />
        <Route path="/pending-orders" element={<ProtectedRoute allowedRoles={['admin', 'servicemanager', 'cashier', 'waiter', 'kitchenmanager']}><PendingOrdersPage /></ProtectedRoute>} />
        <Route path="/order-confirmation" element={<ProtectedRoute allowedRoles={['admin', 'servicemanager', 'cashier', 'waiter', 'kitchenmanager']}><OrderConfirmation /></ProtectedRoute>} />

        {/* ✅ Procurement Route: Now uses the actual component */}
        <Route
          path="/procurement"
          element={<ProtectedRoute allowedRoles={['admin', 'servicemanager']}><Procurement /></ProtectedRoute>}
        />

        {/* Other Routes */}
        <Route path="/billing" element={<ProtectedRoute allowedRoles={['admin', 'servicemanager', 'cashier']}><BillingPage /></ProtectedRoute>} />
        <Route path="/order-history" element={<ProtectedRoute allowedRoles={['admin', 'servicemanager', 'cashier']}><OrderHistory /></ProtectedRoute>} />
        <Route path="/online-orders" element={<ProtectedRoute allowedRoles={['admin', 'servicemanager', 'cashier', 'kitchenmanager']}><OnlineOrdersPage /></ProtectedRoute>} />
        <Route path="/simulate-online-order" element={<ProtectedRoute allowedRoles={['admin']}><SimulateOnlineOrder /></ProtectedRoute>} />

        <Route path="*" element={<h1>404 Not Found</h1>} />
      </Routes>
    </Router>
  );
}