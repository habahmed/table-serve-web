// ✅ src/pages/CustomerStatus.jsx
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useUser } from '../context/UserContext';

export default function CustomerStatus() {
  const [searchParams] = useSearchParams();
  const { kotList } = useUser();
  const [table, setTable] = useState('');

  useEffect(() => {
    const t = searchParams.get('table');
    if (t) setTable(t);
  }, [searchParams]);

  const tableOrders = kotList.filter(order => order.table === table);

  return (
    <div style={{ padding: 20 }}>
      <h2>📦 Order Status - Table {table}</h2>
      {tableOrders.length === 0 ? (
        <p>No orders yet.</p>
      ) : (
        tableOrders.map((order) => (
          <div key={order.id} style={{ border: '1px solid #ccc', padding: 10, marginBottom: 10 }}>
            <p>🕒 {order.time}</p>
            <strong>Status:</strong> {order.status}
            <ul>
              {order.items.map((item, i) => (
                <li key={i}>{item.name} × {item.quantity}</li>
              ))}
            </ul>
          </div>
        ))
      )}
    </div>
  );
}
ß