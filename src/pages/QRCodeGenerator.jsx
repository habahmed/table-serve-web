// ✅ src/pages/QRCodeGenerator.jsx
import React from 'react';
import { QRCodeCanvas } from 'qrcode.react'; // ✅ Use named export
import './QRCodeGenerator.css';

export default function QRCodeGenerator() {
  const baseURL = 'https://table-serve.vercel.app/scan'; // ✅ Replace with your public domain
  const tables = Array.from({ length: 12 }, (_, i) => `T${i + 1}`);

  return (
    <div style={{ padding: 20 }}>
      <h2>📲 QR Code Generator</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 20 }}>
        {tables.map((table) => (
          <div key={table} style={{ textAlign: 'center', border: '1px solid #ccc', padding: 10, borderRadius: 8 }}>
            <h4>{table}</h4>
            <QRCodeCanvas
              value={`${baseURL}?table=${table}`} // ✅ Full public scan URL
              size={150}
              level="H"
              includeMargin={true}
            />
            <p style={{ fontSize: 12 }}>{`${baseURL}?table=${table}`}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
