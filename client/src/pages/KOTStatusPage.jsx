// ✅ /src/pages/KOTStatusPage.jsx (FIXED: User object rendering error)
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';

export default function KOTStatusPage() {
  // ✅ FIX 1: Ensure 'user' is destructured from useUser()
  const { kotList, updateKOTStatus, role, logout, setKOTList, user } = useUser();
  const navigate = useNavigate();
  const canUpdateStatus = role === 'kitchenmanager' || role === 'owner';
  const statusFlow = ['Pending', 'Accepted', 'Preparing', 'Ready to Serve', 'Out for Delivery', 'Completed'];

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const prevKOTLength = useRef(kotList.length);

  // You need to ensure you have an actual audio file loaded, e.g., in public folder
  // const sound = useRef(new Audio('/alert.mp3')); // Uncomment and replace with your path if needed

  // 🔔 Detect new orders and play alert sound
  useEffect(() => {
    if (kotList.length > prevKOTLength.current) {
      // if (sound.current) {
      //   sound.current.play().catch(() => {}); // Uncomment if using audio
      // }
      alert('New KOT order received!');
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
      'Out for Delivery': '#9370DB', // Added for completeness
    };
    return map[status] || '#ffffff';
  };

  const getNextStatuses = (currentStatus) => {
    const currentIndex = statusFlow.indexOf(currentStatus);
    return statusFlow.slice(currentIndex);
  };

  const filteredList = useMemo(() => {
    return kotList.filter(order => {
      const matchesSearch = searchTerm === '' ||
                            order.table.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            order.placedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            order.items.some(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesStatus = statusFilter === '' || order.status === statusFilter;

      // Kitchen Managers only see statuses up to 'Ready to Serve' by default
      if (role === 'kitchenmanager') {
        const visibleStatuses = ['Pending', 'Accepted', 'Preparing', 'Ready to Serve'];
        return matchesSearch && matchesStatus && visibleStatuses.includes(order.status);
      }

      return matchesSearch && matchesStatus;
    });
  }, [kotList, searchTerm, statusFilter, role]);


  return (
    <div style={{ padding: 20 }}>
      {/* 🔘 Header (Fixed to safely display username) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
        <button onClick={() => navigate('/dashboard')}>🏠 Dashboard</button>
        <div style={{ textAlign: 'center' }}>
            <h2>🧾 Kitchen Order Ticket (KOT) Status</h2>
            {/* ✅ FIX 2: Use user?.username (string) instead of user (object) */}
            <span style={{ fontSize: '0.9em', color: '#666' }}>Logged in as: {user?.username} ({role})</span>
        </div>
        <button onClick={logout}>🚪 Logout</button>
      </div>


      {/* 🔍 Filters */}
      <div style={{ marginBottom: 20, display: 'flex', gap: 15 }}>
        <input
          type="text"
          placeholder="Search Table, Item, or User..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          style={{ padding: 8, flexGrow: 1 }}
        />
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ padding: 8 }}>
          <option value="">All Statuses</option>
          {statusFlow.map(status => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
        <button onClick={() => { setSearchTerm(''); setStatusFilter(''); }}>Clear Filters</button>
      </div>

      {/* 📋 KOT List Table */}
      {filteredList.length === 0 ? (
        <p>No KOT orders found matching the criteria.</p>
      ) : (
        <table border="1" cellPadding="6" style={{ width: '100%', borderCollapse: 'collapse' }}>
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
              <tr key={order.id} style={{ backgroundColor: getStatusColor(order.status) + '33' }}>
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