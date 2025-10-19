// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Import Pages
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import Menu from './pages/Menu';
import KOTStatusPage from './pages/KOTStatusPage';
import PendingOrdersPage from './pages/PendingOrdersPage';
import OrderConfirmation from './pages/OrderConfirmation';
import TableStatus from './pages/TableStatus';
import OrderHistory from './pages/OrderHistory';
import ScanTable from './pages/ScanTable';
import BillingPage from './pages/BillingPage';
import Procurement from './pages/Procurement';
import QRCodeGenerator from './pages/QRCodeGenerator';
import CustomerMenu from './pages/CustomerMenu';
import CustomerStatus from './pages/CustomerStatus';
import TestSuite from './pages/TestSuite';
import OnlineOrdersPage from './pages/OnlineOrders';
import SimulateOnlineOrder from './pages/SimulateOnlineOrder';

// Import ProtectedRoute wrapper
import ProtectedRoute from './components/ProtectedRoute'; // 🔸 Import

function App() {
  return (
    <Router>
      <Routes>
        {/* 🟢 Public Login Route */}
        <Route path="/login" element={<LoginPage />} />

        {/* 🔒 Protected Routes - only accessible if logged in */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/menu"
          element={
            <ProtectedRoute>
              <Menu />
            </ProtectedRoute>
          }
        />
        <Route
          path="/kot-status"
          element={
            <ProtectedRoute>
              <KOTStatusPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/pending-orders"
          element={
            <ProtectedRoute>
              <PendingOrdersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/order-confirmation"
          element={
            <ProtectedRoute>
              <OrderConfirmation />
            </ProtectedRoute>
          }
        />
        <Route
          path="/table-status"
          element={
            <ProtectedRoute>
              <TableStatus />
            </ProtectedRoute>
          }
        />
        <Route
          path="/order-history"
          element={
            <ProtectedRoute>
              <OrderHistory />
            </ProtectedRoute>
          }
        />
        <Route path="/scan" element={<ScanTable />} />
        <Route path="/generate-qr" element={<QRCodeGenerator />} /> {/* ✅ Now valid */}
        <Route path="/customer-menu" element={<CustomerMenu />} />
        <Route path="/customer-status" element={<CustomerStatus />} />
        <Route path="/test-suite" element={<TestSuite />} />
        <Route path="/online-orders" element={<OnlineOrdersPage />} />
        <Route path="/simulate-online-order" element={<SimulateOnlineOrder />} />
        <Route
          path="/billing"
          element={
            <ProtectedRoute>
              <BillingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/procurement"
          element={
            <ProtectedRoute>
              <Procurement />
            </ProtectedRoute>
          }
        />
        {/* 🚪 Redirect unknown routes to login */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;