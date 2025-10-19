// ✅ /src/pages/OnlineOrders.jsx
import React from 'react';
import { useUser } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';

export default function OnlineOrdersPage() {
  const { onlineOrders, updateOnlineOrderStatus, addOrderToKOT, logout } = useUser();
  const navigate = useNavigate();

  const handleAccept = (order) => {
    updateOnlineOrderStatus(order.id, 'Accepted');
    addOrderToKOT(`Online-${order.id}`, order.items, order.placedBy); // Push to KOT
  };

  const handleDeliver = (order) => {
    updateOnlineOrderStatus(order.id, 'Delivered');
  };

  return (
    <div style={{ padding: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <button onClick={() => navigate('/dashboard')}>🏠 Dashboard</button>
        <h2>📦 Online Orders</h2>
        <button onClick={logout}>🚪 Logout</button>
      </div>

      {onlineOrders.length === 0 ? (
        <p>No online orders yet.</p>
      ) : (
        onlineOrders.map((order) => (
          <div key={order.id} style={{ border: '1px solid #ccc', padding: 12, margin: '10px 0' }}>
            <h4>🧾 Order from {order.placedBy}</h4>
            <p><b>Time:</b> {order.time}</p>
            <p><b>Status:</b> {order.status}</p>
            <ul>
              {order.items.map((item, idx) => (
                <li key={idx}>{item.name} x {item.quantity}</li>
              ))}
            </ul>

            {order.status === 'Pending' && (
              <button onClick={() => handleAccept(order)}>✅ Accept Order</button>
            )}
            {order.status === 'Ready to Serve' && (
              <button onClick={() => handleDeliver(order)}>📦 Mark as Delivered</button>
            )}
          </div>
        ))
      )}
    </div>
  );
}
