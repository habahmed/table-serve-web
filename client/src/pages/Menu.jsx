import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';

export default function Menu() {
  const { menu, logout } = useUser();  // ✅ Access menu and logout from context
  const navigate = useNavigate();      // ✅ For routing

  return (
    <div style={{ padding: 20 }}>
      {/* 🔘 Header with navigation and logout */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
        <button onClick={() => navigate('/dashboard')}>🏠 Back to Dashboard</button>
        <button onClick={logout}>🚪 Logout</button>
      </div>

      <h2>🍽️ Menu</h2>

      {/* 🔁 Loop over categories and render items with prices */}
      {Object.entries(menu).map(([category, items]) => (
        <div key={category} style={{ marginBottom: 20 }}>
          <h3>{category}</h3>
          <ul>
            {items.map((item, index) => (
              <li key={index}>
                {item.name} — £{item.price}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
