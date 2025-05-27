import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';

export default function TableStatus() {
  const { tableStatuses, updateTableStatus, menu, addOrderToKOT, user, logout } = useUser();
  const navigate = useNavigate();

  const [selectedTable, setSelectedTable] = useState(null);
  const [selectedItems, setSelectedItems] = useState({});
  const [showMenu, setShowMenu] = useState(false);

  // ✅ Update quantity per item
  const handleQuantityChange = (itemKey, qty) => {
    setSelectedItems(prev => ({ ...prev, [itemKey]: qty }));
  };

  // ✅ Confirm order and push to KOT
  const handleConfirmOrder = () => {
    const finalItems = [];

    // Parse selected items and structure them properly
    Object.entries(selectedItems).forEach(([key, qty]) => {
      if (qty > 0) {
        const [cat, index] = key.split('|');
        const item = menu[cat][parseInt(index)];
        finalItems.push({ name: item.name, quantity: qty, price: item.price });
      }
    });

    if (finalItems.length > 0) {
      addOrderToKOT(selectedTable, finalItems, user.username);
    }

    // 🔄 Reset states
    setShowMenu(false);
    setSelectedTable(null);
    setSelectedItems({});
  };

  // ✅ Calculate total based on selection
  const calculateTotal = () => {
    return Object.entries(selectedItems).reduce((sum, [key, qty]) => {
      if (qty > 0) {
        const [cat, index] = key.split('|');
        const item = menu[cat][parseInt(index)];
        return sum + qty * item.price;
      }
      return sum;
    }, 0);
  };

  const colorMap = {
    Available: 'green',
    Occupied: 'red',
    Reserved: 'yellow',
    Cleaning: 'orange'
  };

  return (
    <div style={{ padding: 20 }}>
      {/* 🔘 Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <button onClick={() => navigate('/dashboard')}>🏠 Dashboard</button>
        <button onClick={logout}>🚪 Logout</button>
      </div>

      <h2>🪑 Table Status</h2>

      {/* 🔳 Display 12 tables in a 3x4 grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
        {Object.entries(tableStatuses).map(([tableId, status]) => (
          <div
            key={tableId}
            onClick={() => setSelectedTable(tableId)}
            style={{
              backgroundColor: colorMap[status],
              padding: 15,
              borderRadius: 8,
              cursor: 'pointer',
              textAlign: 'center',
              color: '#fff',
              fontWeight: 'bold'
            }}
          >
            {tableId} <br />
            {status}
          </div>
        ))}
      </div>

      {/* 🔘 Status update for selected table */}
      {selectedTable && (
        <div style={{ marginTop: 20 }}>
          <h3>Set Status for {selectedTable}</h3>
          {['Available', 'Occupied', 'Reserved', 'Cleaning'].map((status) => (
            <button
              key={status}
              style={{ marginRight: 10 }}
              onClick={() => {
                updateTableStatus(selectedTable, status);
                if (status === 'Occupied') {
                  setShowMenu(true);
                } else {
                  setShowMenu(false);
                }
              }}
            >
              {status}
            </button>
          ))}
        </div>
      )}

      {/* 🧾 Menu with quantity and pricing */}
      {showMenu && selectedTable && (
        <div style={{ marginTop: 20 }}>
          <h3>🍽️ Order for {selectedTable}</h3>
          {Object.entries(menu).map(([category, items]) => (
            <div key={category}>
              <h4>{category}</h4>
              {items.map((item, index) => {
                const itemKey = `${category}|${index}`;
                return (
                  <div key={itemKey}>
                    <label>{item.name} (₹{item.price})</label>
                    <input
                      type="number"
                      min={0}
                      value={selectedItems[itemKey] || 0}
                      onChange={(e) => handleQuantityChange(itemKey, parseInt(e.target.value))}
                      style={{ marginLeft: 10, width: 60 }}
                    />
                  </div>
                );
              })}
            </div>
          ))}
          <h4>Total: ₹{calculateTotal()}</h4>
          <button onClick={handleConfirmOrder} style={{ marginTop: 15 }}>✅ Confirm Order</button>
        </div>
      )}
    </div>
  );
}
