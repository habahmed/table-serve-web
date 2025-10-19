import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';

export default function OrderConfirmation() {
  const { kotList, logout } = useUser();
  const navigate = useNavigate();

  // ✅ Show confirmed, preparing, or ready-to-serve orders
  const confirmedOrders = kotList.filter(o =>
    ['Accepted', 'Preparing', 'Ready to Serve'].includes(o.status)
  );

  return (
    <div style={{ padding: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <button onClick={() => navigate('/dashboard')}>🏠 Dashboard</button>
        <h2>Order Confirmation</h2>
        <button onClick={logout}>🚪 Logout</button>
      </div>

      {confirmedOrders.length === 0 ? (
        <p>No active orders yet.</p>
      ) : (
        confirmedOrders.map(order => (
          <div key={order.id} style={{ marginTop: 15 }}>
            <b>Table {order.table}</b><br />
            {order.items.map((item, i) => (
              <div key={i}>{item.name} x{item.quantity}</div>
            ))}
            <small>Status: {order.status} | Placed by: {order.placedBy}</small>
          </div>
        ))
      )}
    </div>
  );
}
