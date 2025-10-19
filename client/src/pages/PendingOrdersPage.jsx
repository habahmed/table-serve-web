import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';

export default function PendingOrdersPage() {
  const { kotList, logout } = useUser();
  const navigate = useNavigate();

  // ✅ Show only Pending and Accepted orders
  const pendingOrders = kotList.filter(o =>
    ['Pending', 'Accepted'].includes(o.status)
  );

  return (
    <div style={{ padding: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <button onClick={() => navigate('/dashboard')}>🏠 Dashboard</button>
        <h2>Pending Orders</h2>
        <button onClick={logout}>🚪 Logout</button>
      </div>

      {pendingOrders.length === 0 ? (
        <p>No pending orders.</p>
      ) : (
        pendingOrders.map(order => (
          <div key={order.id} style={{ marginTop: 15 }}>
            <b>Table {order.table}</b><br />
            {order.items.map((item, i) => (
              <div key={i}>{item.name} x{item.quantity}</div>
            ))}
            <small>Status: {order.status}</small>
          </div>
        ))
      )}
    </div>
  );
}
