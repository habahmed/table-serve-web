// ✅ /src/pages/KOTStatusPage.jsx
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';

export default function KOTStatusPage() {
  const { kotList, updateKOTStatus, role, logout, setKOTList } = useUser();
  const navigate = useNavigate();
  const canUpdateStatus = role === 'kitchenmanager' || role === 'owner';
  const statusFlow = ['Pending', 'Accepted', 'Preparing', 'Ready to Serve', 'Out for Delivery', 'Completed'];

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const prevKOTLength = useRef(kotList.length);

  const sound = useRef(null);

  // 🔔 Detect new orders and play alert sound
  useEffect(() => {
    if (kotList.length > prevKOTLength.current) {
      if (sound.current) {
        sound.current.play().catch(() => {});
      }
    }
    prevKOTLength.current = kotList.length;
  }, [kotList]);

  const getStatusColor = (status) => {
    const map = {
      Pending: '#ffc107',
      Accepted: '#007bff',
      Preparing: '#fd7e14',
      'Ready to Serve': '#28a745',
      Completed: '#17a2b8',
    };
    return map[status] || '#ffffff';
  };

  const getNextStatuses = (current) => {
    const index = statusFlow.indexOf(current);
    return statusFlow.slice(index);
  };

  const filteredList = useMemo(() => {
    return kotList.filter(order => {
      const matchesSearch =
        order.table.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.items.some(i => i.name.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesStatus = statusFilter ? order.status === statusFilter : true;
      return matchesSearch && matchesStatus;
    });
  }, [kotList, searchTerm, statusFilter]);

  const statusCounts = useMemo(() => {
    const counts = {};
    for (const status of statusFlow) counts[status] = 0;
    for (const order of kotList) counts[order.status]++;
    return counts;
  }, [kotList]);

  const handleExport = () => {
    const rows = [['#', 'Table', 'Items', 'Qty', 'PlacedBy', 'Status', 'Time']];
    kotList.forEach((o, i) => {
      const itemNames = o.items.map(i => i.name).join(', ');
      const qty = o.items.map(i => i.quantity).join(', ');
      rows.push([i + 1, o.table, itemNames, qty, o.placedBy, o.status, o.time]);
    });
    const csvContent = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'kot_report.csv';
    link.click();
  };

  const handleMarkAllComplete = () => {
    const updated = kotList.map(order => ({ ...order, status: 'Completed' }));
    setKOTList(updated);
    localStorage.setItem('kotList', JSON.stringify(updated));
  };

  return (
    <div style={{ padding: '20px' }}>
      {/* 🔔 Alert Sound */}
      <audio ref={sound} src="/alert.mp3" preload="auto" />

      {/* 🔘 Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <button onClick={() => navigate('/dashboard')}>🏠 Dashboard</button>
        <h2>KOT Status</h2>
        <button onClick={logout}>🚪 Logout</button>
      </div>

      {/* 🔍 Filters */}
      <div style={{ margin: '10px 0', display: 'flex', gap: '10px' }}>
        <input
          type="text"
          placeholder="🔍 Search"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">All Statuses</option>
          {statusFlow.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <button onClick={handleExport}>📤 Export CSV</button>
        <button onClick={handleMarkAllComplete}>✅ Mark All Completed</button>
      </div>

      {/* 🔢 Status Count */}
      <div style={{ marginBottom: '10px' }}>
        {statusFlow.map(status => (
          <span key={status} style={{ marginRight: '15px' }}>
            <b>{status}:</b> {statusCounts[status] || 0}
          </span>
        ))}
      </div>

      {/* 🧾 Table */}
      {filteredList.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <table border="1" cellPadding="10" style={{ width: '100%' }}>
          <thead>
            <tr style={{ background: '#eee' }}>
              <th>#</th>
              <th>Table</th>
              <th>Items</th>
              <th>Qty</th>
              <th>Placed By</th>
              <th>Status</th>
              <th>Time</th>
              {canUpdateStatus && <th>Action</th>}
            </tr>
          </thead>
          <tbody>
            {filteredList.map((order, index) => (
              <tr key={order.id} style={{ backgroundColor: getStatusColor(order.status) }}>
                <td>{index + 1}</td>
                <td>{order.table}</td>
                <td>{order.items.map((item, i) => <div key={i}>{item.name}</div>)}</td>
                <td>{order.items.map((item, i) => <div key={i}>{item.quantity}</div>)}</td>
                <td>{order.placedBy}</td>
                <td><b>{order.status}</b></td>
                <td>{order.time}</td>
                {canUpdateStatus && (
                  <td>
                    <select
                      value={order.status}
                      onChange={e => updateKOTStatus(order.id, e.target.value)}
                    >
                      {getNextStatuses(order.status).map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
