// ✅ src/pages/OrderHistory.jsx
import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  CartesianGrid, Legend, ResponsiveContainer
} from 'recharts';
import { useUser } from '../context/UserContext';

export default function OrderHistory() {
  const { kotList, logout } = useUser();
  const navigate = useNavigate();
  const [granularity, setGranularity] = useState('hour'); // 'hour', 'minute'
  const [filterTable, setFilterTable] = useState('');
  const [filterUser, setFilterUser] = useState('');

  // ✅ Unique table/user filters
  const allTables = [...new Set(kotList.map(order => order.table))];
  const allUsers = [...new Set(kotList.map(order => order.placedBy))];

  // ✅ Filtered orders for display
  const filteredOrders = kotList.filter(order =>
    (!filterTable || order.table === filterTable) &&
    (!filterUser || order.placedBy === filterUser)
  );

  // ✅ Chart data grouped by time
  const chartData = useMemo(() => {
    const buckets = {};
    kotList.forEach(order => {
      if ((filterTable && order.table !== filterTable) ||
          (filterUser && order.placedBy !== filterUser)) return;
      const date = new Date(`1970/01/01 ${order.time}`);
      const key = granularity === 'hour'
        ? `${date.getHours()}:00`
        : `${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
      buckets[key] = (buckets[key] || 0) + 1;
    });
    return Object.entries(buckets).map(([time, count]) => ({ time, count }));
  }, [kotList, granularity, filterTable, filterUser]);

  // ✅ Export orders as CSV
  const exportToCSV = () => {
    const rows = ["Table,User,Time,Items"];
    filteredOrders.forEach(order => {
      const items = order.items.map(i => `${i.name} x ${i.quantity}`).join(', ');
      rows.push(`${order.table},${order.placedBy},${order.time},"${items}"`);
    });
    const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'order_history.csv';
    link.click();
  };

  return (
    <div style={{ padding: 20, color: 'var(--text-color)' }}>
      {/* 🔘 Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
        <button onClick={() => navigate('/dashboard')}>🏠 Dashboard</button>
        <h2>📈 Order History</h2>
        <button onClick={logout}>🚪 Logout</button>
      </div>

      {/* 🔄 Filters */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 20 }}>
        <label><b>Granularity:</b>
          <select value={granularity} onChange={(e) => setGranularity(e.target.value)}>
            <option value="hour">Hourly</option>
            <option value="minute">Minute</option>
          </select>
        </label>
        <label><b>Table:</b>
          <select value={filterTable} onChange={(e) => setFilterTable(e.target.value)}>
            <option value="">All</option>
            {allTables.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </label>
        <label><b>User:</b>
          <select value={filterUser} onChange={(e) => setFilterUser(e.target.value)}>
            <option value="">All</option>
            {allUsers.map(u => <option key={u} value={u}>{u}</option>)}
          </select>
        </label>
        <button onClick={exportToCSV}>⬇️ Export CSV</button>
      </div>

      {/* 📉 Chart */}
      {chartData.length === 0 ? (
        <p>No orders yet.</p>
      ) : (
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData}>
            <XAxis dataKey="time" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <CartesianGrid stroke="#ccc" />
            <Line type="monotone" dataKey="count" stroke="#8884d8" strokeWidth={2} />
            <Legend />
          </LineChart>
        </ResponsiveContainer>
      )}

      {/* 📋 Detailed Order List */}
      <h3 style={{ marginTop: 30 }}>📋 Order Table</h3>
      <table border="1" cellPadding="6" style={{ width: '100%', backgroundColor: 'var(--bg-color)', color: 'var(--text-color)' }}>
        <thead style={{ backgroundColor: '#444', color: '#fff' }}>
          <tr>
            <th>#</th>
            <th>Table</th>
            <th>User</th>
            <th>Time</th>
            <th>Items</th>
          </tr>
        </thead>
        <tbody>
          {filteredOrders.map((order, index) => {
            const itemText = order.items.map(i => `${i.name} x ${i.quantity}`).join(', ');
            return (
              <tr key={order.id}>
                <td>{index + 1}</td>
                <td>{order.table}</td>
                <td>{order.placedBy}</td>
                <td>{order.time}</td>
                <td>{itemText}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
