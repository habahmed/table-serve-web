// ✅ src/pages/OrderHistory.jsx (Fixed: Safe rendering of user object)
import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  CartesianGrid, Legend, ResponsiveContainer
} from 'recharts';
import { useUser } from '../context/UserContext';

export default function OrderHistory() {
  // ✅ FIX 1: Destructure user and role to access them
  const { orderHistory, logout, user, role } = useUser();
  const navigate = useNavigate();
  const [granularity, setGranularity] = useState('hour');
  const [filterTable, setFilterTable] = useState('');
  const [filterUser, setFilterUser] = useState('');

  // ✅ Filtered order history
  const filteredOrders = useMemo(() => {
    return orderHistory.filter(order =>
      (!filterTable || order.table === filterTable) &&
      (!filterUser || order.placedBy === filterUser)
    );
  }, [orderHistory, filterTable, filterUser]);

  const allTables = [...new Set(orderHistory.map(o => o.table))];
  const allUsers = [...new Set(orderHistory.map(o => o.placedBy))];

  // ✅ Chart data bucketed by granularity
  const chartData = useMemo(() => {
    const buckets = {};
    filteredOrders.forEach(order => {
      // Logic to correctly bucket time for the chart
      const date = new Date(`1970/01/01 ${order.time}`);
      let key;
      if (granularity === 'hour') {
        key = `${date.getHours()}:00`;
      } else if (granularity === 'minute') {
        key = `${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
      } else {
        // Fallback or future implementation for day/month/year
        key = order.time;
      }

      buckets[key] = (buckets[key] || 0) + 1;
    });
    return Object.entries(buckets).map(([time, count]) => ({ time, count }));
  }, [filteredOrders, granularity]);

  // ✅ Export CSV of filtered orders
  const exportToCSV = () => {
    const rows = ['Table,User,Time,Items,Qty,Status'];
    filteredOrders.forEach(order => {
      const items = order.items.map(i => i.name).join('|');
      const qty = order.items.map(i => i.quantity).join('|');
      rows.push(`${order.table},${order.placedBy},${order.time},${items},${qty},${order.status}`);
    });
    const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'order_history.csv';
    link.click();
  };

  // ✅ Badge colors for statuses
  const getStatusBadge = (status) => {
    const colors = {
      'Pending': '#ffc107',
      'Completed': '#17a2b8',
      'Paid': '#28a745'
    };
    return (
      <span style={{
        padding: '4px 8px',
        backgroundColor: colors[status] || '#ccc',
        color: '#000',
        borderRadius: '5px',
        fontSize: '0.8em'
      }}>
        {status}
      </span>
    );
  };

  return (
    <div style={{ padding: 20 }}>
      {/* 🔘 Header (Fixed to safely display username) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
        <button onClick={() => navigate('/dashboard')}>🏠 Dashboard</button>
        <div style={{ textAlign: 'center' }}>
            <h2>📈 Order History</h2>
            {/* ✅ FIX 2: Use user?.username instead of user */}
            <span style={{ fontSize: '0.9em', color: '#666' }}>Logged in as: {user?.username} ({role})</span>
        </div>
        <button onClick={logout}>🚪 Logout</button>
      </div>

      {/* 🔍 Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        <label><b>Granularity:</b>
          <select value={granularity} onChange={e => setGranularity(e.target.value)}>
            <option value="minute">Minute</option>
            <option value="hour">Hourly</option>
            {/* Options day/month/year are not fully implemented in chart logic but kept for UI */}
            <option value="day">Day</option>
            <option value="month">Month</option>
            <option value="year">Year</option>
          </select>
        </label>
        <label><b>Table:</b>
          <select value={filterTable} onChange={e => setFilterTable(e.target.value)}>
            <option value="">All</option>
            {allTables.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </label>
        <label><b>User:</b>
          <select value={filterUser} onChange={e => setFilterUser(e.target.value)}>
            <option value="">All</option>
            {allUsers.map(u => <option key={u} value={u}>{u}</option>)}
          </select>
        </label>
        <button onClick={exportToCSV}>⬇️ Export CSV</button>
      </div>

      {/* 📊 Line Chart */}
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

      {/* 📋 Orders Table */}
      <h3 style={{ marginTop: 30 }}>📋 Order Table</h3>
      <table border="1" cellPadding="6" style={{ width: '100%' }}>
        <thead style={{ background: '#333', color: '#fff' }}>
          <tr>
            <th>#</th>
            <th>Table</th>
            <th>User</th>
            <th>Time</th>
            <th>Items</th>
            <th>Qty</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {filteredOrders.map((order, i) => (
            <tr key={order.id || i}>
              <td>{i + 1}</td>
              <td>{order.table}</td>
              <td>{order.placedBy}</td>
              <td>{order.time}</td>
              <td>{order.items.map(i => i.name).join(', ')}</td>
              <td>{order.items.map(i => i.quantity).join(', ')}</td>
              <td>{getStatusBadge(order.status)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}