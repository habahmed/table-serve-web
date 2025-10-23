// ✅ src/pages/OrderConfirmation.jsx (FIXED: User object rendering error in header)
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';

export default function OrderConfirmation() {
  // ✅ FIX 1: Destructure user and role for use in the header
  const { kotList, logout, user, role } = useUser();
  const navigate = useNavigate();

  // ✅ Show confirmed, preparing, or ready-to-serve orders
  const confirmedOrders = kotList.filter(o =>
    ['Accepted', 'Preparing', 'Ready to Serve'].includes(o.status)
  );

  return (
    <div style={{ padding: 20 }}>

      {/* ✅ FIX 2: Updated header to safely display user info */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <button onClick={() => navigate('/dashboard')}>🏠 Dashboard</button>
        <div style={{ textAlign: 'center' }}>
            <h2>✅ Order Confirmation</h2>
            {/* Display username and role safely */}
            <span style={{ fontSize: '0.9em', color: '#666' }}>Logged in as: {user?.username} ({role})</span>
        </div>
        <button onClick={logout}>🚪 Logout</button>
      </div>

      {confirmedOrders.length === 0 ? (
        <p>No active orders yet.</p>
      ) : (
        confirmedOrders.map(order => (
          <div key={order.id} style={{
            marginTop: 15,
            padding: 10,
            border: '1px solid #ccc',
            borderRadius: 5,
            backgroundColor: order.status === 'Ready to Serve' ? '#28a74533' : '#007bff33'
          }}>
            <b>Table {order.table}</b><br />
            <div style={{marginTop: 5, marginBottom: 5}}>
              {order.items.map((item, i) => (
                <div key={i}>{item.name} x{item.quantity}</div>
              ))}
            </div>
            <small style={{ fontWeight: 'bold' }}>Status: {order.status}</small>
            <small style={{ marginLeft: 10 }}>Time: {order.time}</small>
            <small style={{ marginLeft: 10 }}>Placed by: {order.placedBy}</small>
          </div>
        ))
      )}
    </div>
  );
}