import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';

export default function SimulateOnlineOrder() {
  const { menu, addOnlineOrder } = useUser(); // ✅ addOnlineOrder handles online flow
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [selectedItems, setSelectedItems] = useState({});

  // ✅ Convert menu to flat list for lookup
  const allMenuItems = Object.entries(menu).flatMap(([category, items]) =>
    items.map((item) => ({ ...item, category }))
  );

  // ✅ Track quantity for each menu item
  const handleQtyChange = (itemName, qty) => {
    setSelectedItems(prev => ({
      ...prev,
      [itemName]: parseInt(qty || 0)
    }));
  };

  // ✅ Submit order to system
  const handleSubmit = () => {
    if (!name) return alert('❗ Enter your name');
    const items = Object.entries(selectedItems)
      .filter(([_, qty]) => qty > 0)
      .map(([itemName, qty]) => {
        const found = allMenuItems.find(i => i.name === itemName);
        return {
          name: found.name,
          quantity: qty,
          price: found.price
        };
      });

    if (items.length === 0) return alert('❗ Select at least one item');

    addOnlineOrder(items, name); // ✅ push to online orders list
    alert('✅ Order submitted!');
    navigate('/'); // Go back to homepage
  };

  return (
    <div style={{ padding: 20, maxWidth: 600, margin: '0 auto' }}>
      <h2>🧪 Simulate Online Order (Customer)</h2>

      {/* 🧑 Customer Name */}
      <div style={{ marginBottom: 15 }}>
        <label><b>Your Name:</b></label><br />
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="e.g. Ali, Ramu"
          style={{ width: '100%', padding: 8 }}
        />
      </div>

      {/* 🍽️ Menu Display */}
      <h4>Select Items:</h4>
      {Object.entries(menu).map(([category, items]) => (
        <div key={category} style={{ marginBottom: 20 }}>
          <h5>{category}</h5>
          {items.map((item) => (
            <div key={item.name} style={{ marginBottom: 8 }}>
              <label>{item.name} (₹{item.price})</label>
              <input
                type="number"
                min="0"
                value={selectedItems[item.name] || ''}
                onChange={(e) => handleQtyChange(item.name, e.target.value)}
                style={{ marginLeft: 10, width: 60 }}
              />
            </div>
          ))}
        </div>
      ))}

      {/* ✅ Submit Button */}
      <button
        onClick={handleSubmit}
        style={{
          marginTop: 20,
          padding: '10px 20px',
          backgroundColor: '#28a745',
          color: '#fff',
          border: 'none',
          borderRadius: 5
        }}
      >
        🛒 Submit Order
      </button>
    </div>
  );
}
