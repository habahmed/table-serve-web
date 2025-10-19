// ✅ /src/pages/Procurement.jsx
import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';

export default function Procurement() {
  const {
    stock,
    setStock,
    generateStockReport,
    restockHistory,
    recordRestock,
    logout
  } = useUser();

  const navigate = useNavigate();
  const [addQty, setAddQty] = useState({});
  const [newItem, setNewItem] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const handleUpdateStock = () => {
    const updated = { ...stock };
    Object.entries(addQty).forEach(([item, qty]) => {
      const quantity = parseFloat(qty);
      if (!isNaN(quantity) && quantity > 0) {
        updated[item] = (updated[item] || 0) + quantity;
        recordRestock(item, quantity);
      }
    });
    setStock(updated);
    setAddQty({});
  };

  const getStatus = (qty) => {
    if (qty <= 2) return 'Low';
    if (qty <= 5) return 'Medium';
    return 'OK';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Low': return '#dc3545';
      case 'Medium': return '#ffc107';
      default: return '#28a745';
    }
  };

  const lowItems = Object.entries(stock).filter(([_, qty]) => qty <= 2);

  const handleAddNewItem = () => {
    if (!newItem.trim()) return;
    setStock(prev => ({ ...prev, [newItem]: 0 }));
    setNewItem('');
  };

  const handleDeleteItem = (item) => {
    const updated = { ...stock };
    delete updated[item];
    setStock(updated);
  };

  return (
    <div style={{ padding: 20 }}>
      {/* 🔘 Topbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>🚚 Procurement & Inventory</h2>
        <button onClick={logout}>🚪 Logout</button>
      </div>

      {/* 🔔 Low Stock Banner */}
      {lowItems.length > 0 && (
        <div style={{ backgroundColor: '#dc3545', padding: 10, borderRadius: 6, marginTop: 10, fontWeight: 'bold' }}>
          ⚠️ Low Stock: {lowItems.map(([item]) => item).join(', ')}
        </div>
      )}

      {/* 🔘 Actions */}
      <div style={{ margin: '15px 0', display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <button onClick={handleUpdateStock}>🔄 Update Stock</button>
        <button onClick={generateStockReport}>📄 Download Report</button>
        <button onClick={() => navigate('/dashboard')}>🏠 Dashboard</button>
      </div>

      {/* ➕ Add New Ingredient */}
      <div style={{ marginBottom: 10 }}>
        <input
          type="text"
          placeholder="New Ingredient"
          value={newItem}
          onChange={e => setNewItem(e.target.value)}
        />
        <button onClick={handleAddNewItem}>➕ Add</button>
      </div>

      {/* 📦 Inventory Table */}
      <table border="1" cellPadding="6" style={{ width: '100%' }}>
        <thead style={{ backgroundColor: '#333', color: '#fff' }}>
          <tr>
            <th>#</th>
            <th>Item</th>
            <th>Status</th>
            <th>Available Qty</th>
            <th>Add Qty</th>
            <th>❌</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(stock).map(([item, qty], idx) => {
            const status = getStatus(qty);
            return (
              <tr key={item}>
                <td>{idx + 1}</td>
                <td>{item}</td>
                <td style={{ color: getStatusColor(status), fontWeight: 'bold' }}>{status}</td>
                <td>{qty}</td>
                <td>
                  <input
                    type="number"
                    min="0"
                    value={addQty[item] || ''}
                    onChange={e => setAddQty({ ...addQty, [item]: e.target.value })}
                    style={{ width: 60 }}
                  />
                </td>
                <td>
                  <button
                    style={{ color: 'red' }}
                    onClick={() => setDeleteConfirm(item)}
                  >🗑️</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* 🔐 Confirm Delete Dialog */}
      {deleteConfirm && (
        <div style={{ background: '#eee', padding: 10, marginTop: 10 }}>
          <b>Confirm delete:</b> {deleteConfirm}
          <div style={{ marginTop: 10 }}>
            <button onClick={() => handleDeleteItem(deleteConfirm)}>Yes</button>
            <button onClick={() => setDeleteConfirm(null)}>Cancel</button>
          </div>
        </div>
      )}

      {/* 📝 Restock Log */}
      <h3 style={{ marginTop: 30 }}>📜 Restock Log</h3>
      {restockHistory.length === 0 ? (
        <p>No restock records.</p>
      ) : (
        <table border="1" cellPadding="6" style={{ width: '100%' }}>
          <thead style={{ backgroundColor: 'black' }}>
            <tr>
              <th>#</th>
              <th>Item</th>
              <th>Qty</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            {restockHistory.map((log, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{log.item}</td>
                <td>{log.qty}</td>
                <td>{log.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
