// ✅ QRCodeGenerator.jsx
import React from 'react';
import { QRCodeCanvas } from 'qrcode.react'; // ✅ Use named import

export default function QRCodeGenerator() {
  const tables = Array.from({ length: 12 }, (_, i) => `T${i + 1}`);

  return (
    <div style={{ padding: 20 }}>
      <h2>🧾 QR Code Generator</h2>
      <p>Scan QR to auto-assign table.</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 20 }}>
        {tables.map((tableId) => (
          <div key={tableId} style={{ textAlign: 'center', border: '1px solid #ccc', padding: 15, borderRadius: 8 }}>
            <h4>{tableId}</h4>
            <QRCodeCanvas value={`https://table-serve-web/scan/${tableId}`} size={180} />
            <p style={{ fontSize: 12, color: '#555' }}>Scan to order from {tableId}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
