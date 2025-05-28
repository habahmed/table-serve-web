// ✅ src/pages/CustomerMenu.jsx — Final Clean Version with QR + Order Flow

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { QRCodeSVG } from 'qrcode.react';

export default function CustomerMenu() {
  const [searchParams] = useSearchParams();
  const [table, setTable] = useState('');
  const [selectedItems, setSelectedItems] = useState({});
  const { menu, addOrderToKOT } = useUser();

  // ✅ Detect table from ?table=T1 in URL
  useEffect(() => {
    const scannedTable = searchParams.get('table');
    if (scannedTable && scannedTable.startsWith('T')) {
      setTable(scannedTable);
      localStorage.setItem('table', scannedTable);
    }
  }, [searchParams]);

  // ❌ Show message if table not set
  if (!table) return <p style={{ padding: 20 }}>⏳ Loading or invalid table...</p>;

  // ✅ Update selection for item
  const handleSelect = (itemName, quantity, price) => {
    setSelectedItems((prev) => ({
      ...prev,
      [itemName]: { quantity: parseInt(quantity), price }
    }));
  };

  // ✅ Place order using context KOT
  const handlePlaceOrder = () => {
    const items = Object.entries(selectedItems).map(([name, data]) => ({
      name,
      quantity: data.quantity,
      price: data.price
    }));

    if (items.length > 0 && table) {
      addOrderToKOT(table, items, 'Customer');
      alert(`✅ Order placed for ${table}`);
      setSelectedItems({});
    }
  };

  const qrLink = `${window.location.origin}/customer-menu?table=${table}`;

  return (
    <div style={{ padding: 20, maxWidth: 600, margin: 'auto' }}>
      {/* 🔘 Table and QR code */}
      <h2>🍽️ Table: {table}</h2>
      <p>Scan this QR to come back here:</p>
      <div style={{ marginBottom: 20 }}>
        <QRCodeSVG value={qrLink} size={180} />
        <p style={{ fontSize: 14, marginTop: 8 }}>{qrLink}</p>
      </div>

      {/* 🔘 Menu with selection */}
      <h3>📜 Menu</h3>
      {Object.entries(menu).map(([category, items]) => (
        <div key={category} style={{ marginBottom: 25 }}>
          <h4>{category}</h4>
          {items.map(({ name, price }) => (
            <div key={name} style={{ display: 'flex', alignItems: 'center', marginBottom: 6 }}>
              <span style={{ flex: 1 }}>{name} - ₹{price}</span>
              <select
                value={selectedItems[name]?.quantity || ''}
                onChange={(e) => handleSelect(name, e.target.value, price)}
              >
                <option value="">Qty</option>
                {[1, 2, 3, 4, 5].map(q => (
                  <option key={q} value={q}>{q}</option>
                ))}
              </select>
            </div>
          ))}
        </div>
      ))}

      {/* 🔘 Place order */}
      <button
        onClick={handlePlaceOrder}
        disabled={Object.keys(selectedItems).length === 0}
        style={{ marginTop: 10 }}
      >
        ✅ Confirm Order
      </button>
    </div>
  );
}
