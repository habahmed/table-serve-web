// ✅ src/pages/CustomerStatus.jsx
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useUser } from '../context/UserContext';

export default function CustomerStatus() {
  const [searchParams] = useSearchParams();
  const { kotList } = useUser();
  const [tableId, setTableId] = useState('');
  const [tableOrders, setTableOrders] = useState([]);

  useEffect(() => {
    const scanned = searchParams.get('table');
    if (scanned && scanned.startsWith('T')) {
      setTableId(scanned);
    }
  }, [searchParams]);

  useEffect(() => {
    if (tableId) {
      const filtered = kotList.filter(order => order.table === tableId);
      setTableOrders(filtered);
    }
  }, [kotList, tableId]);

  if (!tableId) return <p>⏳ Waiting for table info...</p>;

  return (
    <div style={{ padding: 20 }}>
      <h2>📦 Order Status for Table {tableId}</h2>
      {tableOrders.length === 0 ? (
        <p>No orders placed yet.</p>
      ) : (
        tableOrders.map(order => (
          <div key={order.id} style={{ border: '1px solid #ccc', margin: '10px 0', padding: 10 }}>
            <h4>Order #{order.id}</h4>
            <p>Status: <strong>{order.status}</strong></p>
            <ul>
              {order.items.map((item, i) => (
                <li key={i}>{item.name} x {item.quantity}</li>
              ))}
            </ul>
            <p>Time: {order.time}</p>
          </div>
        ))
      )}
    </div>
  );
}
