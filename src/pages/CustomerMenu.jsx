// ✅ src/pages/CustomerMenu.jsx (Final)
import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { QRCodeSVG } from 'qrcode.react';

export default function CustomerMenu() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [table, setTable] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [quantities, setQuantities] = useState({});
  const [confirmation, setConfirmation] = useState('');
  const { menu, addOrderToKOT, updateTableStatus } = useUser();

  // ✅ Detect table from ?table=T1
  useEffect(() => {
    const scannedTable = searchParams.get('table');
    if (scannedTable?.startsWith('T')) {
      setTable(scannedTable);
      localStorage.setItem('table', scannedTable);
    }
  }, [searchParams]);

  const handleScanConfirm = () => {
    setShowMenu(true);
  };

  const handleChange = (itemName, qty) => {
    setQuantities(prev => ({ ...prev, [itemName]: parseInt(qty) || 0 }));
  };

  const handlePlaceOrder = () => {
    const orderedItems = [];
    Object.entries(quantities).forEach(([name, qty]) => {
      if (qty > 0) {
        // Find price from menu
        const price = Object.values(menu).flat().find(i => i.name === name)?.price || 0;
        orderedItems.push({ name, quantity: qty, price });
      }
    });

    if (orderedItems.length > 0) {
      addOrderToKOT(table, orderedItems, `customer-${table}`);
      updateTableStatus(table, 'Occupied');
      setConfirmation('✅ Order Placed! Thank you 🙌');
      setQuantities({});
      setTimeout(() => navigate('/thank-you'), 2000); // optional thank you page
    }
  };

  if (!table) return <p style={{ padding: 20 }}>⏳ Loading or invalid table...</p>;

  const qrLink = `${window.location.origin}/customer-menu?table=${table}`;

  return (
    <div style={{ padding: 20 }}>
      <h2>🍽️ Welcome to Table {table}</h2>

      {!showMenu ? (
        <>
          <p>📲 Please scan this QR on another device to order.</p>
          <QRCodeSVG value={qrLink} size={200} />
          <div style={{ marginTop: 20 }}>
            <button onClick={handleScanConfirm}>✅ I’ve Scanned</button>
          </div>
        </>
      ) : (
        <>
          <h3>📜 Menu</h3>
          {Object.entries(menu).map(([category, items]) => (
            <div key={category} style={{ marginBottom: 20 }}>
              <h4>{category}</h4>
              {items.map((item) => (
                <div key={item.name} style={{ marginBottom: 5 }}>
                  {item.name} — ₹{item.price}{' '}
                  <input
                    type="number"
                    min="0"
                    value={quantities[item.name] || ''}
                    onChange={(e) => handleChange(item.name, e.target.value)}
                    style={{ width: 60, marginLeft: 10 }}
                  />
                </div>
              ))}
            </div>
          ))}
          <button onClick={handlePlaceOrder}>🛒 Confirm Order</button>
          {confirmation && <p style={{ marginTop: 10, color: 'green' }}>{confirmation}</p>}
        </>
      )}
    </div>
  );
}
