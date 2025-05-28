// ✅ src/pages/CustomerMenu.jsx (Updated for order + redirect)
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { QRCodeSVG } from 'qrcode.react';

export default function CustomerMenu() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { menu, addOrderToKOT, updateTableStatus } = useUser();
  const [table, setTable] = useState('');
  const [quantities, setQuantities] = useState({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const scannedTable = searchParams.get('table');
    if (scannedTable?.startsWith('T')) {
      setTable(scannedTable);
      localStorage.setItem('table', scannedTable);
    }
  }, [searchParams]);

  const handleChange = (item, qty) => {
    setQuantities(prev => ({ ...prev, [item.name]: qty }));
  };

  const handleSubmit = () => {
    const items = Object.entries(quantities)
      .filter(([_, qty]) => qty > 0)
      .map(([name, quantity]) => {
        const found = Object.values(menu).flat().find(i => i.name === name);
        return { name, quantity, price: found?.price || 0 };
      });

    if (items.length && table) {
      addOrderToKOT(table, items, 'Customer');
      updateTableStatus(table, 'Occupied'); // ✅ Mark table
      setSubmitted(true);
      setTimeout(() => navigate(`/customer-status?table=${table}`), 2000); // ✅ Redirect
    }
  };

  const link = `${window.location.origin}/customer-menu?table=${table}`;
  if (!table) return <p>⏳ Waiting for table info...</p>;

  return (
    <div style={{ padding: 20 }}>
      <h2>📲 Table {table}</h2>

      {!submitted && (
        <>
          <div style={{ marginBottom: 20 }}>
            <p>📸 Scan this to access menu later:</p>
            <QRCodeSVG value={link} size={160} />
          </div>

          <h3>🧾 Select Your Order</h3>
          {Object.entries(menu).map(([category, items]) => (
            <div key={category} style={{ marginBottom: 20 }}>
              <h4>{category}</h4>
              {items.map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ flex: 1 }}>{item.name} — ₹{item.price}</span>
                  <input
                    type="number"
                    min="0"
                    value={quantities[item.name] || ''}
                    onChange={e => handleChange(item, parseInt(e.target.value || 0))}
                    style={{ width: 60 }}
                  />
                </div>
              ))}
            </div>
          ))}

          <button onClick={handleSubmit} style={{ marginTop: 20 }}>✅ Confirm Order</button>
        </>
      )}

      {submitted && <p>🎉 Order placed! Redirecting...</p>}
    </div>
  );
}
