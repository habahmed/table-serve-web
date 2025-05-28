// ✅ src/pages/CustomerStatus.jsx
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useUser } from '../context/UserContext';

export default function CustomerStatus() {
  const [searchParams] = useSearchParams();
  const { kotList } = useUser();
  const [table, setTable] = useState('');

  // ✅ Read table param from URL
  useEffect(() => {
    const t = searchParams.get('table');
    if (t) setTable(t);
  }, [searchParams]);

  // ✅ Filter orders for this table only
  const tableOrders = kotList.filter(order => order.table === table);

  return (
    <div style={{ padding: 20 }}>
      <h2>📦 Order Status - Table {table}</h2>

      {tableOrders.length === 0 ? (
        <p>No orders yet.</p>
      ) : (
        tableOrders.map((order) => (
          <div key={order.id} style={{ border: '1px solid #ccc', padding: 10, marginBottom: 10 }}>
            <p><strong>Status:</strong> {order.status}</p>
            <p><strong>Time:</strong> {order.time}</p>
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
