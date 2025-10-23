import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';

export default function Menu() {
  // ✅ FIX 1: Destructure user and role for safe display
  const { menu, logout, user, role } = useUser();
  const navigate = useNavigate();

  return (
    <div style={{ padding: 20 }}>

      {/* 🔘 Header with navigation and logout (FIXED: Safely displaying user and role) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <button onClick={() => navigate('/dashboard')}>🏠 Back to Dashboard</button>
        <div style={{ textAlign: 'center' }}>
            <h2>🍽️ Menu</h2>
            {/* ✅ FIX 2: Safely render username string instead of the user object */}
            <span style={{ fontSize: '0.9em', color: '#666' }}>Logged in as: {user?.username} ({role})</span>
        </div>
        <button onClick={logout}>🚪 Logout</button>
      </div>

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