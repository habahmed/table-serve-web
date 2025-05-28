// ✅ src/pages/CustomerStatus.jsx
import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { useUser } from '../context/UserContext';

export default function CustomerStatus() {
  const [searchParams] = useSearchParams();
  const { kotList } = useUser();
  const tableId = searchParams.get('table');

  const tableOrders = kotList.filter(k => k.table === tableId);

  if (!tableId) return <p>Invalid table ID</p>;

  return (
    <div style={{ padding: 20 }}>
      <h2>📦 Order Status for Table {tableId}</h2>
      {tableOrders.length === 0 ? (
        <p>⏳ Waiting for kitchen to accept your order...</p>
      ) : (
        tableOrders.map(order => (
          <div key={order.id} style={{ marginBottom: 20, border: '1px solid #ccc', padding: 10 }}>
            <p><b>Status:</b> {order.status}</p>
            <ul>
              {order.items.map((item, i) => (
                <li key={i}>{item.name} x {item.quantity}</li>
              ))}
            </ul>
          </div>
        ))
      )}
    </div>
  );
}
