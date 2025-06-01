// ✅ src/pages/CustomerMenu.jsx
import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { QRCodeSVG } from 'qrcode.react';

export default function CustomerMenu() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // ✅ Context: Menu, Table Ops, Order Ops
  const { menu, addOrderToKOT, updateTableStatus } = useUser();

  // 🔧 State management
  const [table, setTable] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [selectedItems, setSelectedItems] = useState({});
  const [orderPlaced, setOrderPlaced] = useState(false);

  // ✅ Read table from query params and set in localStorage
  useEffect(() => {
    const scanned = searchParams.get('table');
    if (scanned?.startsWith('T')) {
      setTable(scanned);
      localStorage.setItem('table', scanned);
    }
  }, [searchParams]);

  // 🔢 Handle quantity changes
  const handleQuantityChange = (itemName, qty) => {
    setSelectedItems((prev) => ({
      ...prev,
      [itemName]: qty
    }));
  };

  // 🔁 Inside handleConfirmOrder in CustomerMenu.jsx

  const handleConfirmOrder = () => {
    const items = Object.entries(selectedItems)
      .filter(([_, qty]) => qty > 0)
      .map(([name, quantity]) => {
        let price = 0;
        for (const catItems of Object.values(menu)) {
          const found = catItems.find((i) => i.name === name);
          if (found) price = found.price;
        }
        return { name, quantity, price };
      });

    if (items.length) {
      const orderData = {
        id: Date.now(),
        table,
        items,
        placedBy: `Customer-${table}`,
        time: new Date().toLocaleTimeString(),
        status: 'Pending'
      };

      addOrderToKOT(table, items, `Customer-${table}`); // Vercel/local context
      updateTableStatus(table, 'Occupied');
      setOrderPlaced(true);

      // ✅ NEW: send to localhost API
      fetch('http://localhost:5000/api/sync-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      })
        .then(res => res.json())
        .then(console.log)
        .catch(console.error);

      setTimeout(() => navigate(`/customer-status?table=${table}`), 1200);
    }
  };

  // 🔗 Create shareable QR code URL
  const fullURL = `${window.location.origin}/customer-menu?table=${table}`;

  return (
    <div style={{ padding: 20 }}>
      <h2>🪑 Welcome to Table {table || '...'}</h2>

      {/* ✅ QR code view */}
      {!showMenu && !orderPlaced && (
        <div>
          <p>Scan this QR to revisit this menu:</p>
          <QRCodeSVG value={fullURL} size={200} />
          <p style={{ fontSize: 14 }}>{fullURL}</p>
          <button onClick={() => setShowMenu(true)} style={{ marginTop: 20 }}>
            📥 Start Ordering
          </button>
        </div>
      )}

      {/* ✅ Menu view after QR scan */}
      {showMenu && !orderPlaced && (
        <>
          <h3>📋 Menu</h3>
          {Object.entries(menu).map(([category, items]) => (
            <div key={category} style={{ marginBottom: 15 }}>
              <h4>{category}</h4>
              {items.map((item) => (
                <div key={item.name} style={{ marginBottom: 5 }}>
                  {item.name} — ₹{item.price}
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={selectedItems[item.name] || ''}
                    onChange={(e) => handleQuantityChange(item.name, parseInt(e.target.value) || 0)}
                    style={{ width: 50, marginLeft: 10 }}
                  />
                </div>
              ))}
            </div>
          ))}
          <button onClick={handleConfirmOrder} style={{ marginTop: 10 }}>
            ✅ Confirm Order
          </button>
        </>
      )}

      {/* ✅ Order Placed State */}
      {orderPlaced && <h3 style={{ color: 'green' }}>✅ Order Placed! Redirecting...</h3>}
    </div>
  );
}
