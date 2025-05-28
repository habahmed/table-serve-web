// ✅ src/pages/QRCodeGenerator.jsx
import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

export default function QRCodeGenerator() {
  const baseUrl = `${window.location.origin}/scan`; // 🔗 All QR codes point to /scan?table=TX

  return (
    <div style={{ padding: 20 }}>
      <h2>📦 Table QR Code Generator</h2>
      <p>Scan these codes to simulate customer ordering flow:</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 20 }}>
        {[...Array(12)].map((_, i) => {
          const tableId = `T${i + 1}`;
          const url = `${baseUrl}?table=${tableId}`;
          return (
            <div key={tableId} style={{ textAlign: 'center', border: '1px solid #ccc', padding: 10, borderRadius: 8 }}>
              <h4>{tableId}</h4>
              <QRCodeSVG value={url} size={150} />
              <p style={{ fontSize: 12, marginTop: 5 }}>{url}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
