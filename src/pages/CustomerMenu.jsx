// ✅ src/pages/CustomerMenu.jsx (Final Version)
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
    addOrderToKOT,
    updateTableStatus
  } = useUser();

  // ✅ Get ?table param from URL
  useEffect(() => {
    const scannedTable = searchParams.get('table');
    if (scannedTable?.startsWith('T')) {
      setTable(scannedTable);
      localStorage.setItem('table', scannedTable);
    }
  }, [searchParams]);

  // 🧮 Handle quantity update
  const handleQtyChange = (itemName, value) => {
    setQuantities((prev) => ({
      ...prev,
      [itemName]: parseInt(value) || 0,
    }));
  };

  // ✅ Confirm Order and update KOT
  const handleOrderSubmit = () => {
    const selectedItems = [];

    Object.entries(quantities).forEach(([name, qty]) => {
      if (qty > 0) {
        // Find the item price from menu
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
      addOrderToKOT(table, selectedItems, `customer-${table}`);
      updateTableStatus(table, 'Occupied');
      setOrderPlaced(true);
      setTimeout(() => window.location.reload(), 5000); // ✅ Auto-refresh
    }
  };

  // 🔁 Construct QR link
  const link = `${window.location.origin}/customer-menu?table=${table}`;

  if (!table) return <p style={{ padding: 20 }}>⏳ Loading or invalid table...</p>;

  return (
    <div style={{ padding: 20 }}>
      <h2>🍽️ Table {table}</h2>

      {!showMenu && !orderPlaced && (
        <>
          <p>Scan this QR code to place your order.</p>
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
          <p>We’ll serve you shortly. This page will refresh automatically.</p>
        </div>
      )}
    </div>
  );
}
