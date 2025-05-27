// ✅ src/pages/CustomerMenu.jsx (Clean & Final)
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { QRCodeSVG } from 'qrcode.react';

export default function CustomerMenu() {
  const [searchParams] = useSearchParams();
  const [table, setTable] = useState('');
  const { menu } = useUser();

  // ✅ Auto-detect table from query
  useEffect(() => {
    const scannedTable = searchParams.get('table');
    if (scannedTable && scannedTable.startsWith('T')) {
      setTable(scannedTable);
      localStorage.setItem('table', scannedTable); // store if needed later
    }
  }, [searchParams]);

  if (!table) return <p style={{ padding: 20 }}>⏳ Loading or invalid table...</p>;

  const link = `${window.location.origin}/customer-menu?table=${table}`;

  return (
    <div style={{ padding: 20 }}>
      <h2>🍽️ Welcome to Table {table}</h2>
      <p>Scan this QR code next time or bookmark the link.</p>

      {/* ✅ QR Code for this table */}
      <div style={{ marginBottom: 20 }}>
        <QRCodeSVG value={link} size={180} />
        <p style={{ fontSize: 14, marginTop: 8 }}>{link}</p>
      </div>

      {/* ✅ Read-only Menu */}
      <h3>📜 Menu</h3>
      {Object.entries(menu).map(([category, items]) => (
        <div key={category} style={{ marginBottom: 20 }}>
          <h4>{category}</h4>
          <ul>
            {items.map((item, i) => (
              <li key={i}>
                {item.name} — ₹{item.price}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
