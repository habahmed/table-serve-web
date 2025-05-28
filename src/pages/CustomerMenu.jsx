// ✅ src/pages/CustomerMenu.jsx (Final with KOT & Table Update Fix)
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { useUser } from '../context/UserContext';

export default function CustomerMenu() {
  const [searchParams] = useSearchParams();
  const [table, setTable] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [quantities, setQuantities] = useState({});
  const [orderPlaced, setOrderPlaced] = useState(false);

  const {
    menu,
    user,
    login, // ✅ auto-login for customers
    addOrderToKOT,
    updateTableStatus
  } = useUser();

  // ✅ Detect ?table param and assign to context + login
  useEffect(() => {
    const scannedTable = searchParams.get('table');
    if (scannedTable?.startsWith('T')) {
      setTable(scannedTable);
      localStorage.setItem('table', scannedTable);

      // ✅ Automatically assign a lightweight customer user
      login(`customer-${scannedTable}`, 'customer');
    }
  }, [searchParams, login]);

  // 🧮 Quantity update
  const handleQtyChange = (itemName, value) => {
    setQuantities((prev) => ({
      ...prev,
      [itemName]: parseInt(value) || 0,
    }));
  };

  // ✅ Submit order
  const handleOrderSubmit = () => {
    const selectedItems = [];

    Object.entries(quantities).forEach(([name, qty]) => {
      if (qty > 0) {
        const item = Object.values(menu).flat().find(i => i.name === name);
        if (item) {
          selectedItems.push({
            name: item.name,
            quantity: qty,
            price: item.price
          });
        }
      }
    });

    if (selectedItems.length > 0 && table) {
      // ✅ Add to KOT with placedBy as customer-table
      addOrderToKOT(table, selectedItems, `customer-${table}`);
      updateTableStatus(table, 'Occupied');
      setOrderPlaced(true);
      setTimeout(() => window.location.reload(), 5000);
    }
  };

  const link = `${window.location.origin}/customer-menu?table=${table}`;

  if (!table) return <p style={{ padding: 20 }}>⏳ Loading or invalid table...</p>;

  return (
    <div style={{ padding: 20 }}>
      <h2>🍽️ Welcome to Table {table}</h2>

      {!showMenu && !orderPlaced && (
        <>
          <p>📲 Scan this QR to place your order.</p>
          <QRCodeSVG value={link} size={200} />
          <p style={{ fontSize: 14, marginTop: 10 }}>{link}</p>
          <button onClick={() => setShowMenu(true)} style={{ marginTop: 20 }}>
            📥 Start Ordering
          </button>
        </>
      )}

      {showMenu && !orderPlaced && (
        <>
          <h3 style={{ marginTop: 30 }}>📝 Select Your Items</h3>
          {Object.entries(menu).map(([category, items]) => (
            <div key={category} style={{ marginBottom: 20 }}>
              <h4>{category}</h4>
              {items.map((item) => (
                <div key={item.name}>
                  {item.name} — ₹{item.price}
                  <input
                    type="number"
                    min={0}
                    value={quantities[item.name] || ''}
                    onChange={(e) => handleQtyChange(item.name, e.target.value)}
                    style={{ width: 60, marginLeft: 10 }}
                  />
                </div>
              ))}
            </div>
          ))}
          <button onClick={handleOrderSubmit} style={{ marginTop: 20 }}>
            ✅ Confirm Order
          </button>
        </>
      )}

      {orderPlaced && (
        <div style={{ marginTop: 30 }}>
          <h3>✅ Thank you! Your order has been placed.</h3>
          <p>This page will refresh automatically.</p>
        </div>
      )}
    </div>
  );
}
