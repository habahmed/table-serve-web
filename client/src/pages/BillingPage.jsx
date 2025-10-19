// ✅ src/pages/BillingPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import { useUser } from '../context/UserContext';

export default function BillingPage() {
  const navigate = useNavigate();
  const {
    kotList,
    setKOTList,
    tableStatuses,
    updateTableStatus,
    logout,
    archiveOrder
  } = useUser();

  const [billPendingOnly, setBillPendingOnly] = useState(false);
  const [showArchive, setShowArchive] = useState(false); // ✅ Toggle for archived bills
  const [paymentModes, setPaymentModes] = useState({});
  const [completedBills, setCompletedBills] = useState(() => {
    const stored = localStorage.getItem('completedBills');
    return stored ? JSON.parse(stored) : [];
  });
  const [billPendingTables, setBillPendingTables] = useState(() => {
    const stored = localStorage.getItem('billPendingTables');
    return stored ? JSON.parse(stored) : [];
  });

  // ✅ Group KOT orders by table
  const ordersByTable = kotList.reduce((acc, order) => {
    if (!acc[order.table]) acc[order.table] = [];
    acc[order.table].push(order);
    return acc;
  }, {});

  const itemPrices = {}; // Fallback map if needed

  const getOrderTotal = (items) =>
    items.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0);

  // ✅ Mark table as paid and archive order
  const markAsPaid = (tableId) => {
    const completedOrders = kotList.filter(order => order.table === tableId);
    const allItems = completedOrders.flatMap(order => order.items);
    const total = getOrderTotal(allItems);
    const remainingOrders = kotList.filter(order => order.table !== tableId);

    completedOrders.forEach(order => archiveOrder(order));
    setKOTList(remainingOrders);
    updateTableStatus(tableId, 'Available');

    const bill = {
      table: tableId,
      items: allItems,
      total,
      time: new Date().toLocaleString(),
      payment: paymentModes[tableId] || 'N/A'
    };
    const updatedBills = [...completedBills, bill];
    setCompletedBills(updatedBills);

    localStorage.setItem('kotList', JSON.stringify(remainingOrders));
    localStorage.setItem('completedBills', JSON.stringify(updatedBills));
  };

  const downloadBill = (tableId, items, total) => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(`🧾 Table: ${tableId}`, 10, 10);
    let y = 20;
    items.forEach(item => {
      doc.text(`${item.name} x ${item.quantity} @ ₹${item.price || 0}`, 10, y);
      y += 8;
    });
    doc.text(`Total: ₹${total}`, 10, y + 10);
    doc.text(`Payment: ${paymentModes[tableId] || 'N/A'}`, 10, y + 18);
    doc.save(`bill_${tableId}.pdf`);
  };

  const markAsBillPending = (tableId) => {
    const updated = [...new Set([...billPendingTables, tableId])];
    setBillPendingTables(updated);
    localStorage.setItem('billPendingTables', JSON.stringify(updated));
  };

  const handlePaymentModeChange = (tableId, mode) => {
    setPaymentModes(prev => ({ ...prev, [tableId]: mode }));
  };

  useEffect(() => {
    localStorage.setItem('completedBills', JSON.stringify(completedBills));
  }, [completedBills]);

  return (
    <div style={{ padding: 20 }}>
      {/* 🔘 Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <button onClick={() => navigate('/dashboard')}>🏠 Dashboard</button>
        <h2>💵 Billing Page</h2>
        <button onClick={logout}>🚪 Logout</button>
      </div>

      {/* 💸 Toggle for pending bill */}
      <div style={{ margin: '10px 0' }}>
        <label>
          <input
            type="checkbox"
            checked={billPendingOnly}
            onChange={() => setBillPendingOnly(!billPendingOnly)}
            style={{ marginRight: 8 }}
          />
          💸 Show Bill Pending Only
        </label>
      </div>

      {/* ✅ List Active Orders Per Table */}
      {Object.entries(ordersByTable)
        .filter(([tableId]) =>
          !billPendingOnly || billPendingTables.includes(tableId)
        )
        .map(([tableId, orders]) => {
          const allItems = orders.flatMap(order => order.items);
          const total = getOrderTotal(allItems);
          return (
            <div key={tableId} style={{
              border: '1px solid #ccc',
              borderRadius: 8,
              padding: 12,
              marginBottom: 20,
              backgroundColor: '#e6f7ff'
            }}>
              <h3>🪑 Table: {tableId}</h3>
              {allItems.map((item, i) => (
                <div key={i}>
                  {item.name} x {item.quantity} @ ₹{item.price} = ₹{item.quantity * item.price}
                </div>
              ))}
              <h4>Total: ₹{total}</h4>

              <label>Payment Mode:
                <select
                  value={paymentModes[tableId] || ''}
                  onChange={e => handlePaymentModeChange(tableId, e.target.value)}
                >
                  <option value="">-- Select --</option>
                  <option value="Cash">💵 Cash</option>
                  <option value="UPI">📱 UPI</option>
                  <option value="Card">💳 Card</option>
                  <option value="Other">🧾 Other</option>
                </select>
              </label>

              <div style={{ marginTop: 10, display: 'flex', gap: 10 }}>
                <button onClick={() => downloadBill(tableId, allItems, total)}>🖨️ Print PDF</button>
                <button onClick={() => markAsPaid(tableId)}>✅ Mark as Paid</button>
                <button onClick={() => markAsBillPending(tableId)}>💸 Mark Bill Pending</button>
              </div>
            </div>
          );
        })}

      {/* 📦 Archive Section */}
      {completedBills.length > 0 && (
        <div>
          <button onClick={() => setShowArchive(!showArchive)}>
            {showArchive ? '⬆️ Hide Archived Bills' : '📦 Show Archived Bills'}
          </button>
          {showArchive && (
            <div style={{ marginTop: 20 }}>
              <h3>🗂️ Archived Completed Bills</h3>
              {completedBills.map((bill, i) => (
                <div key={i} style={{
                  border: '1px dashed #888',
                  padding: 10,
                  marginBottom: 12,
                  borderRadius: 6,
                  backgroundColor: '#f0f8ff'
                }}>
                  <b>🪑 Table:</b> {bill.table} | <b>Total:</b> ₹{bill.total} | <b>Payment:</b> {bill.payment}<br />
                  <small>{bill.time}</small>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
