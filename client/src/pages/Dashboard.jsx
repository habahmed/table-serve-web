// ✅ /src/pages/Dashboard.jsx (FIXED: Table Status Overview to handle Rooms)
import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { useUser } from '../context/UserContext';
import { useTheme } from '../context/ThemeContext';

export default function Dashboard() {
  const navigate = useNavigate();
  // tableStatuses is now a nested object { RoomA: { T1: 'Status', T2: 'Status' }, ... }
  const { user, role, logout, kotList, tableStatuses } = useUser();
  const { darkMode, toggleTheme } = useTheme();

  const [kotStats, setKOTStats] = useState({});

  // 🎨 Status color map (kept as is)
  const COLORS = {
    Pending: '#ffc107',
    Accepted: '#007bff',
    Preparing: '#fd7e14',
    'Ready to Serve': '#28a745',
    Completed: '#17a2b8',
    Available: '#28a745',
    Occupied: '#dc3545',
    Reserved: '#ffc107',
    Cleaning: '#fd7e14'
  };

  // 🧮 KOT Summary (kept as is, depends on kotList which is a flat array)
  useEffect(() => {
    const counts = kotList.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {});
    setKOTStats(counts);
  }, [kotList]);

  const kotPieData = useMemo(() => {
    return Object.entries(kotStats).map(([status, value]) => ({
      name: status,
      value
    }));
  }, [kotStats]);

  // 🪑 FIX 1: Update tableStatusData calculation to iterate over Rooms
  const tableStatusData = useMemo(() => {
    const counts = { Available: 0, Occupied: 0, Reserved: 0, Cleaning: 0 };

    // Iterate through all room objects
    Object.values(tableStatuses).forEach(roomTables => {
      // Iterate through all table statuses within that room
      Object.values(roomTables).forEach(status => {
        if (counts[status] !== undefined) {
          counts[status]++;
        }
      });
    });

    return Object.entries(counts).map(([status, value]) => ({
      name: status,
      value
    }));
  }, [tableStatuses]); // Dependency on tableStatuses ensures update

  return (
    <div style={{ padding: 20, maxWidth: '100%', overflowX: 'auto', boxSizing: 'border-box' }}>
      {/* 🔘 Header (kept as is) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
        <h2>👋 Welcome {user?.username} ({role})</h2>
        <div>
          <button onClick={toggleTheme}>
            {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
          </button>
          <button onClick={logout} style={{ marginLeft: 10 }}>🚪 Logout</button>
        </div>
      </div>

      {/* 🔘 Navigation (kept as is) */}
      <div style={{ marginBottom: 30, display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button onClick={() => navigate('/menu')}>🍽️ Menu</button>
        <button onClick={() => navigate('/kot-status')}>🧾 KOT Status</button>
        <button onClick={() => navigate('/pending-orders')}>📋 Pending Orders</button>
        <button onClick={() => navigate('/order-confirmation')}>✅ Order Confirmation</button>
        <button onClick={() => navigate('/table-status')}>🪑 Table Status</button>
        <button onClick={() => navigate('/order-history')}>📊 Order History</button>
        <button onClick={() => navigate('/billing')}>💵 Billing</button>
        <button onClick={() => navigate('/procurement')}>🚚 Procurement</button>
        {['owner', 'kitchenmanager', 'cashier'].includes(role) && (
          <button onClick={() => navigate('/online-orders')}>🌐🛒 Online Orders</button>
        )}
      </div>

      {/* ✅ KOT Summary Cards (kept as is) */}
      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: 20 }}>
        {['Pending', 'Accepted', 'Preparing', 'Ready to Serve', 'Completed'].map((status) => (
          <div
            key={status}
            style={{
              padding: '10px 20px',
              borderRadius: 10,
              backgroundColor: COLORS[status],
              color: '#000',
              minWidth: 120
            }}
          >
            <h4>{status}</h4>
            <p style={{ fontSize: 24, margin: 0 }}>{kotStats[status] || 0}</p>
          </div>
        ))}
      </div>

      {/* ✅ KOT Pie Chart (kept as is) */}
      <div style={{ height: 350, width: '100%', maxWidth: 600, margin: '0 auto' }}>
        <h3 style={{ textAlign: 'center' }}>KOT Status Pie Chart</h3>
        <PieChart width={400} height={300}>
          <Pie
            data={kotPieData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={100}
            label
          >
            {kotPieData.map((entry, index) => (
              <Cell key={`cell-kot-${index}`} fill={COLORS[entry.name] || '#8884d8'} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </div>

      {/* ✅ Table Status Summary Cards */}
      <div style={{ marginTop: 40 }}>
        <h3>🪑 Table Status Overview</h3>
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: 20 }}>
          {['Available', 'Occupied', 'Reserved', 'Cleaning'].map((status) => {
            // FIX 2: Calculate the count by iterating over all rooms/tables
            const count = Object.values(tableStatuses).reduce((sum, roomTables) => {
                return sum + Object.values(roomTables).filter(s => s === status).length;
            }, 0);

            return (
              <div
                key={status}
                style={{
                  padding: '10px 20px',
                  borderRadius: 10,
                  backgroundColor: COLORS[status],
                  color: '#000',
                  minWidth: 120
                }}
              >
                <strong>{status}</strong>
                <p style={{ fontSize: 18 }}>
                  {count} {/* Display the corrected count */}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* ✅ Table Status Pie Chart (Uses the fixed tableStatusData) */}
      <div style={{ height: 350, width: '100%', maxWidth: 600, margin: '0 auto' }}>
        <h3 style={{ textAlign: 'center' }}>Table Status Pie Chart</h3>
        <PieChart width={400} height={300}>
          <Pie
            data={tableStatusData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={100}
            label
          >
            {tableStatusData.map((entry, index) => (
              <Cell key={`cell-table-${index}`} fill={COLORS[entry.name] || '#8884d8'} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </div>
    </div>
  );
}