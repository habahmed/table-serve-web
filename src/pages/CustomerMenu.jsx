// ✅ src/pages/CustomerMenu.jsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';

export default function CustomerMenu() {
  const { menu, table, setTable } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (!table) {
      // ⛔ If no table is assigned, redirect to scan
      navigate('/scan');
    }
  }, [table, navigate]);

  return (
    <div style={{ padding: 20, color: 'var(--text-color)' }}>
      {/* ✅ Sticky header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        position: 'sticky', top: 0, background: 'var(--bg-color)', paddingBottom: 10, zIndex: 10
      }}>
        <h2>🍽️ Table {table}</h2>
        <button onClick={() => { setTable(null); localStorage.removeItem('table'); navigate('/scan'); }}>
          🔄 Change Table
        </button>
      </div>

      {/* ✅ Menu Listing */}
      {Object.entries(menu).map(([category, items]) => (
        <div key={category} style={{ marginBottom: 20 }}>
          <h3>{category}</h3>
          <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
            {items.map((item, i) => (
              <li key={i} style={{ padding: 8, borderBottom: '1px solid #ccc' }}>
                <span>{item.name}</span>
                <span style={{ float: 'right' }}>₹{item.price}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
