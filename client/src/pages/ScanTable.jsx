// ✅ src/pages/ScanTable.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useUser } from '../context/UserContext';

export default function ScanTable() {
  const navigate = useNavigate();
  const { setTable } = useUser();
  const [searchParams] = useSearchParams();
  const [selected, setSelected] = useState('');

  // ✅ Replace navigate('/menu') → navigate('/customer-menu') in ScanTable.jsx

  useEffect(() => {
    const scannedTable = searchParams.get('table');
    if (scannedTable && scannedTable.startsWith('T')) {
      setSelected(scannedTable);
      setTable(scannedTable);
      localStorage.setItem('table', scannedTable);
      navigate('/customer-menu'); // ✅ redirect here
    }
  }, [searchParams, setTable, navigate]);

  const handleManualSubmit = () => {
    if (selected) {
      setTable(selected);
      localStorage.setItem('table', selected);
      navigate('/menu');
    }
  };

  return (
    <div style={{ padding: 30 }}>
      <h2>🔍 Select or Scan Your Table</h2>
      <select value={selected} onChange={(e) => setSelected(e.target.value)}>
        <option value="">-- Select Table --</option>
        {[...Array(12)].map((_, i) => (
          <option key={i} value={`T${i + 1}`}>Table T{i + 1}</option>
        ))}
      </select>
      <button onClick={handleManualSubmit} disabled={!selected} style={{ marginLeft: 10 }}>
        ✅ Proceed
      </button>
    </div>
  );
}
