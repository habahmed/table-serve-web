// ✅ src/pages/PendingOdersPage.jsx (Fixed: User object rendering error in header)
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';

export default function PendingOrdersPage() {
  // ✅ FIX 1: Destructure user and role for use in the header
  const { kotList, logout, user, role } = useUser();
  const navigate = useNavigate();

  // ✅ Show only Pending and Accepted orders
  const pendingOrders = kotList.filter(o =>
    ['Pending', 'Accepted'].includes(o.status)
  );

  return (
    <div style={{ padding: 20 }}>

      {/* ✅ FIX 2: Updated header to safely display user info */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <button onClick={() => navigate('/dashboard')}>🏠 Dashboard</button>
        <div style={{ textAlign: 'center' }}>
            <h2>📋 Pending Orders</h2>
            {/* Display username and role safely */}
            <span style={{ fontSize: '0.9em', color: '#666' }}>Logged in as: {user?.username} ({role})</span>
        </div>
        <button onClick={logout}>🚪 Logout</button>
      </div>

      {pendingOrders.length === 0 ? (
        <p>No pending orders.</p>
      ) : (
        pendingOrders.map(order => (
          <div key={order.id} style={{
             marginTop: 15,
             padding: 10,
             border: '1px solid #ccc',
             borderRadius: 5,
             // Highlight pending orders differently
             backgroundColor: order.status === 'Pending' ? '#ffc10733' : '#007bff33'
          }}>
            <b>Table {order.table}</b><br />
            <div style={{marginTop: 5, marginBottom: 5}}>
              {order.items.map((item, i) => (
                <div key={i}>{item.name} x{item.quantity}</div>
              ))}
            </div>
            <small style={{ fontWeight: 'bold' }}>Status: {order.status}</small>
            <small style={{ marginLeft: 10 }}>Time: {order.time}</small>
            <small style={{ marginLeft: 10 }}>Placed By: {order.placedBy}</small>
          </div>
        ))
      )}
    </div>
  );
}