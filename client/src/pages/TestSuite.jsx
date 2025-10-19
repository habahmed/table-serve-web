// ✅ /src/pages/TestSuite.jsx
import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';

export default function TestSuite() {
  const {
    menu, kotList, addOrderToKOT, updateKOTStatus,
    tableStatuses, updateTableStatus, logout
  } = useUser();
  const navigate = useNavigate();
  const [testTable, setTestTable] = useState('T1');
  const [testItem, setTestItem] = useState('Chicken 65');
  const [testQty, setTestQty] = useState(1);

  const allItems = Object.values(menu).flat();

  const handleOrder = () => {
    const item = allItems.find(i => i.name === testItem);
    if (!item) return;
    addOrderToKOT(testTable, [{ name: item.name, quantity: testQty, price: item.price }], `TestUser`);
  };

  return (
    <div style={{ padding: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <button onClick={() => navigate('/dashboard')}>🏠 Back to Dashboard</button>
        <h2>🧪 Test Suite</h2>
        <button onClick={logout}>🚪 Logout</button>
      </div>

      <div style={{ marginTop: 20 }}>
        <label><b>Table: </b></label>
        <select value={testTable} onChange={e => setTestTable(e.target.value)}>
          {Array.from({ length: 12 }, (_, i) => `T${i + 1}`).map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>

        <label style={{ marginLeft: 20 }}><b>Item: </b></label>
        <select value={testItem} onChange={e => setTestItem(e.target.value)}>
          {allItems.map(i => <option key={i.name} value={i.name}>{i.name}</option>)}
        </select>

        <label style={{ marginLeft: 20 }}><b>Qty: </b></label>
        <input
          type="number"
          value={testQty}
          min={1}
          onChange={e => setTestQty(parseInt(e.target.value))}
          style={{ width: 60 }}
        />

        <button onClick={handleOrder} style={{ marginLeft: 20 }}>🧾 Place Test Order</button>
      </div>

      <h3 style={{ marginTop: 30 }}>📋 Current KOT</h3>
      <table border="1" cellPadding="6" style={{ width: '100%' }}>
        <thead style={{ background: '#ddd' }}>
          <tr>
            <th>#</th>
            <th>Table</th>
            <th>Item</th>
            <th>Qty</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {kotList.map((order, i) => (
            <tr key={order.id}>
              <td>{i + 1}</td>
              <td>{order.table}</td>
              <td>{order.items.map(i => i.name).join(', ')}</td>
              <td>{order.items.map(i => i.quantity).join(', ')}</td>
              <td>{order.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
