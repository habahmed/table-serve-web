// ✅ src/pages/CustomerMenu.jsx
import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { QRCodeSVG } from 'qrcode.react';

export default function CustomerMenu() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { menu, addOrderToKOT, updateTableStatus } = useUser();

  const [table, setTable] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [selectedItems, setSelectedItems] = useState({});
  const [orderPlaced, setOrderPlaced] = useState(false);

  useEffect(() => {
    const scanned = searchParams.get('table');
    if (scanned?.startsWith('T')) {
      setTable(scanned);
      localStorage.setItem('table', scanned);
    }
  }, [searchParams]);

  const handleQuantityChange = (itemName, qty) => {
    setSelectedItems((prev) => ({ ...prev, [itemName]: qty }));
  };

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
      addOrderToKOT(table, items, `Customer-${table}`);
      updateTableStatus(table, 'Occupied');
      setOrderPlaced(true);
      setTimeout(() => {
        navigate(`/customer-status?table=${table}`);
      }, 1200);
    }
  };

  const fullURL = `${window.location.origin}/customer-menu?table=${table}`;

  return (
    <div style={{ padding: 20 }}>
      <h2>🍽️ Welcome to Table {table || '...'}</h2>

      {!showMenu && !orderPlaced && (
        <div>
          <p>Scan this QR code to access the menu:</p>
          <QRCodeSVG value={fullURL} size={200} />
          <p style={{ fontSize: 14 }}>{fullURL}</p>
          <button onClick={() => setShowMenu(true)} style={{ marginTop: 20 }}>📥 Start Ordering</button>
        </div>
      )}

      {showMenu && !orderPlaced && (
        <>
          <h3>📋 Menu</h3>ß
          {Object.entries(menu).map(([category, items]) => (
            <div key={category} style={{ marginBottom: 15 }}>
              <h4>{category}</h4>
              {items.map((item) => (
                <div key={item.name}>
                  {item.name} — ₹{item.price}
                  <input
                    type="number"
                    value={selectedItems[item.name] || ''}
                    onChange={(e) => handleQuantityChange(item.name, parseInt(e.target.value || 0))}
                    style={{ width: 50, marginLeft: 10 }}
                  />
                </div>
              ))}
            </div>
          ))}
          <button onClick={handleConfirmOrder} style={{ marginTop: 10 }}>✅ Confirm Order</button>
        </>
      )}

      {orderPlaced && <h3 style={{ color: 'green' }}>✅ Order Placed! Redirecting...</h3>}
    </div>
  );
}
