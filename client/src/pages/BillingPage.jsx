// ✅ src/pages/BillingPage.jsx (FINAL FIXED: Discount Loop, Archive Read Errors, CSV Errors, and TakeAway Name)
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import { useUser } from '../context/UserContext';

// Helper function for safe object access
const safeDiscount = { type: 'None', value: 0, amount: 0 };
const getSafeBillDiscount = (bill) => bill.discount || safeDiscount;

export default function BillingPage() {
  const navigate = useNavigate();
  const {
    kotList,
    setKOTList,
    updateTableStatus,
    logout,
    archiveOrder,
    user, // Need the current user to exclude staff username from "Customer" tag
    role // <--- ADDED ROLE FOR HEADER
  } = useUser();

  const PRESET_DISCOUNTS = [5, 8, 10, 15, 20, 25, 30, 35, 40, 45, 50];

  const [billPendingOnly, setBillPendingOnly] = useState(false);
  const [showArchive, setShowArchive] = useState(false);
  const [paymentModes, setPaymentModes] = useState({});
  const [discounts, setDiscounts] = useState({}); // { tableId: { type: 'percent'|'amount', value: 10 } }

  // NOTE: Loading from storage is fine, but the data integrity is the issue (Bug 2 & 3)
  const [completedBills, setCompletedBills] = useState(() => {
    const stored = localStorage.getItem('completedBills');
    return stored ? JSON.parse(stored) : [];
  });
  const [billPendingTables, setBillPendingTables] = useState(() => {
    const stored = localStorage.getItem('billPendingTables');
    return stored ? JSON.parse(stored) : [];
  });

  const ordersByTable = kotList.reduce((acc, order) => {
    if (!acc[order.table]) acc[order.table] = [];
    acc[order.table].push(order);
    return acc;
  }, {});

  const getOrderTotal = (items) =>
    items.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0);


  // ✅ FIXED BUG 1: applyDiscount must NOT update state (discounts), it must be a pure calculation.
  const applyDiscount = (tableId, subTotal) => {
    const tableDiscount = discounts[tableId];
    if (!tableDiscount || !tableDiscount.value || subTotal === 0) {
      return { finalTotal: subTotal, discountAmount: 0, discountType: 'None', discountValue: 0 };
    }

    let discountAmount = 0;
    if (tableDiscount.type === 'percent') {
      discountAmount = subTotal * (tableDiscount.value / 100);
    } else if (tableDiscount.type === 'amount') {
      discountAmount = Math.min(tableDiscount.value, subTotal);
    }

    // Use Math.round for reliable currency precision (x100 and back)
    const discountAmountRounded = Math.round(discountAmount * 100) / 100;
    const finalTotal = Math.round((subTotal - discountAmountRounded) * 100) / 100;

    return {
        finalTotal: finalTotal,
        discountAmount: discountAmountRounded,
        discountType: tableDiscount.type,
        discountValue: tableDiscount.value
    };
  };

  const handleDiscountChange = (tableId, type, value) => {
    const numValue = parseFloat(value) || 0;

    setDiscounts(prev => ({
      ...prev,
      [tableId]: {
        type: type,
        value: numValue,
      }
    }));
  };

  const markAsPaid = (tableId) => {
    const [roomName, tablePart] = tableId.split(' - ');
    if (!roomName || !tablePart) {
        console.error("Invalid tableId format for billing:", tableId);
        return;
    }

    const completedOrders = kotList.filter(order => order.table === tableId);
    if (completedOrders.length === 0) return;

    const allItems = completedOrders.flatMap(order => order.items);
    const subTotal = getOrderTotal(allItems);

    // Calculate final total and lock in discount amount
    const { finalTotal, discountAmount, discountType, discountValue } = applyDiscount(tableId, subTotal);

    const remainingOrders = kotList.filter(order => order.table !== tableId);

    completedOrders.forEach(order => archiveOrder(order));
    setKOTList(remainingOrders);

    // Release the table
    updateTableStatus(roomName, tablePart, 'Available');

    // Remove from bill pending list
    const updatedBillPending = billPendingTables.filter(id => id !== tableId);
    setBillPendingTables(updatedBillPending);
    localStorage.setItem('billPendingTables', JSON.stringify(updatedBillPending));

    // Record completed bill with discount details
    const bill = {
      table: tableId,
      items: allItems,
      subTotal: subTotal, // Gross total (no toFixed here)
      discount: {
        type: discountType,
        value: discountValue,
        amount: discountAmount
      },
      total: finalTotal, // Net total (no toFixed here)
      time: new Date().toLocaleString(),
      payment: paymentModes[tableId] || 'N/A',
      placedBy: completedOrders[0].placedBy // ✅ ARCHIVE PLACED BY (Customer Name or Staff Username)
    };
    const updatedBills = [...completedBills, bill];
    setCompletedBills(updatedBills);

    localStorage.setItem('kotList', JSON.stringify(remainingOrders));
    localStorage.setItem('completedBills', JSON.stringify(updatedBills));

    // Clear discount and payment mode for the table
    setDiscounts(prev => { delete prev[tableId]; return { ...prev }; });
    setPaymentModes(prev => { delete prev[tableId]; return { ...prev }; });
  };

  // ✅ FIXED BUG 3: Export Bills to CSV (using safe accessor) - ADDED PLACED BY
  const exportBillsToCSV = () => {
    if (completedBills.length === 0) {
      alert("No completed bills to export.");
      return;
    }

    const headers = [
      "Bill ID", "Table", "Time", "SubTotal (Gross)", "Discount Type",
      "Discount Value", "Discount Amount", "Total (Net)", "Payment Mode", "Placed By", "Items Ordered" // ✅ ADDED Placed By Header
    ];

    const csvRows = completedBills.map((bill, index) => {
      // Use safe accessor for discount
      const discount = getSafeBillDiscount(bill);

      const itemsString = bill.items
        .map(item => `${item.name} x ${item.quantity}`)
        .join('; ');

      return [
        index + 1,
        `"${bill.table}"`,
        `"${bill.time}"`,
        (bill.subTotal || bill.total).toFixed(2), // Fallback for old bills
        discount.type,
        discount.value,
        discount.amount,
        bill.total.toFixed(2),
        bill.payment,
        `"${bill.placedBy || 'N/A'}"`, // ✅ ADDED PLACED BY DATA
        `"${itemsString}"`
      ].join(',');
    });

    const csvContent = [
      headers.join(','),
      ...csvRows
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Billing_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ✅ UPDATED downloadBill to include placedBy
  const downloadBill = (tableId, items, subTotal, finalTotal, discount, placedBy) => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(`🧾 Bill - Table: ${tableId}`, 10, 10);
    let y = 20;

    // ✅ Display Customer Name for TakeAway orders
    if (tableId.startsWith('TakeAway') && placedBy) {
      doc.setFontSize(12);
      doc.text(`👤 Customer: ${placedBy}`, 10, y);
      y += 8;
    }

    doc.setFontSize(10);
    items.forEach(item => {
      doc.text(`${item.name} x ${item.quantity} @ £${item.price}`, 10, y);
      y += 6;
    });
    doc.setFontSize(16);
    doc.text(`---------------------------------------`, 10, y + 2);
    doc.text(`Sub-Total: £${subTotal.toFixed(2)}`, 10, y + 10);
    if (discount.amount > 0) {
        doc.text(`Discount (${discount.value}${discount.type === 'percent' ? '%' : '£'}): -£${discount.amount.toFixed(2)}`, 10, y + 18);
        doc.text(`---------------------------------------`, 10, y + 20);
    }
    doc.text(`Total Payable: £${finalTotal.toFixed(2)}`, 10, y + 28);
    doc.text(`Payment Mode: ${paymentModes[tableId] || 'N/A'}`, 10, y + 36);
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
    <div style={{ padding: 20, maxWidth: 1000, margin: '0 auto' }}>

      {/* 🔘 Header (FIXED: Safely displaying user and role) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <button onClick={() => navigate('/dashboard')}>🏠 Dashboard</button>
        <div style={{ textAlign: 'center' }}>
            <h2>💵 Billing Page</h2>
            {/* ✅ FIX: Safely render username string instead of the user object */}
            <span style={{ fontSize: '0.9em', color: '#666' }}>Logged in as: {user?.username} ({role})</span>
        </div>
        <button onClick={logout}>🚪 Logout</button>
      </div>

      {/* 📊 Export Button */}
      <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
        <button onClick={exportBillsToCSV} style={{ padding: '10px 20px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: 5 }}>
            ⬇️ Export Billing Orders (.CSV)
        </button>
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
          const subTotal = getOrderTotal(allItems);

          // ✅ Get placedBy and room for conditional display/PDF
          const [room, ] = tableId.split(' - ');
          const placedBy = orders[0]?.placedBy;

          // Apply discount live for display
          const { finalTotal, discountAmount, discountType, discountValue } = applyDiscount(tableId, subTotal);

          return (
            <div key={tableId} style={{
              border: '1px solid #ccc',
              borderRadius: 8,
              padding: 15,
              marginBottom: 25,
              backgroundColor: '#f8f9fa'
            }}>
              <h3>🪑 Table: {tableId}</h3>
              {/* ✅ DISPLAY CUSTOMER NAME FOR TAKEAWAY ORDERS */}
              {room === 'TakeAway' && placedBy && (
                 <p style={{marginTop: -10, fontStyle: 'italic'}}>Customer/Order Placed By: {placedBy}</p>
              )}

              {/* Item List */}
              {allItems.map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                  <span>{item.name} x {item.quantity}</span>
                  <span>£{(item.quantity * item.price).toFixed(2)}</span>
                </div>
              ))}

              <hr style={{ margin: '10px 0' }} />
              <h4 style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Sub-Total:</span>
                <span>£{subTotal.toFixed(2)}</span>
              </h4>

              {/* 💵 DISCOUNT SECTION */}
              <div style={{ border: '1px dashed #ced4da', padding: 10, margin: '15px 0', borderRadius: 5, backgroundColor: '#fff' }}>
                <h5 style={{ margin: '0 0 10px 0' }}>Discount ({discountType !== 'None' ? discountType : 'None'})</h5>

                {/* Option 1: Manual Discount */}
                <div style={{ marginBottom: 10, display: 'flex', gap: 10 }}>
                    <input
                        type="number"
                        placeholder="Discount Amount (£)"
                        value={discounts[tableId]?.type === 'amount' ? discounts[tableId]?.value : ''}
                        onChange={(e) => handleDiscountChange(tableId, 'amount', e.target.value)}
                        style={{ width: '40%', padding: 5 }}
                    />
                    <input
                        type="number"
                        placeholder="Discount %"
                        value={discounts[tableId]?.type === 'percent' ? discounts[tableId]?.value : ''}
                        onChange={(e) => handleDiscountChange(tableId, 'percent', e.target.value)}
                        style={{ width: '40%', padding: 5 }}
                    />
                </div>

                {/* Option 2: Preset Discounts */}
                <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                  {PRESET_DISCOUNTS.map(percent => (
                    <button
                      key={percent}
                      onClick={() => handleDiscountChange(tableId, 'percent', percent)}
                      style={{
                        padding: '5px 10px',
                        backgroundColor: discounts[tableId]?.type === 'percent' && discounts[tableId]?.value === percent ? '#007bff' : '#6c757d',
                        color: 'white',
                        border: 'none',
                        borderRadius: 3,
                        cursor: 'pointer'
                      }}
                    >
                      {percent}%
                    </button>
                  ))}
                  <button
                    onClick={() => handleDiscountChange(tableId, 'None', 0)}
                    style={{
                      padding: '5px 10px',
                      backgroundColor: discountType === 'None' ? '#dc3545' : '#6c757d',
                      color: 'white',
                      border: 'none',
                      borderRadius: 3,
                      cursor: 'pointer'
                    }}
                  >
                    Clear
                  </button>
                </div>

                {/* Discount Summary */}
                {discountAmount > 0 && (
                    <p style={{ color: '#dc3545', margin: '10px 0 0 0' }}>
                        Applied Discount: -£{discountAmount.toFixed(2)}
                    </p>
                )}
              </div>

              {/* FINAL TOTAL */}
              <h3 style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid #343a40', paddingTop: 10 }}>
                <span>TOTAL PAYABLE:</span>
                <span>£{finalTotal.toFixed(2)}</span>
              </h3>

              {/* Payment Mode */}
              <label style={{ display: 'block', margin: '15px 0' }}>Payment Mode:
                <select
                  value={paymentModes[tableId] || ''}
                  onChange={e => handlePaymentModeChange(tableId, e.target.value)}
                  style={{ marginLeft: 10, padding: 5 }}
                >
                  <option value="">-- Select --</option>
                  <option value="Cash">💵 Cash</option>
                  <option value="UPI">📱 UPI</option>
                  <option value="Card">💳 Card</option>
                  <option value="Other">🧾 Other</option>
                </select>
              </label>

              {/* Actions */}
              <div style={{ marginTop: 15, display: 'flex', gap: 10 }}>
                <button
                    // ✅ Passed placedBy to downloadBill
                    onClick={() => downloadBill(tableId, allItems, subTotal, finalTotal, { type: discountType, value: discountValue, amount: discountAmount }, placedBy)}
                    style={{ backgroundColor: '#17a2b8', color: 'white' }}
                >
                    🖨️ Print/PDF
                </button>
                <button
                    onClick={() => markAsPaid(tableId)}
                    style={{ backgroundColor: '#28a745', color: 'white' }}
                    disabled={!paymentModes[tableId]} // Require payment mode selected
                >
                    ✅ Mark as Paid
                </button>
                <button
                    onClick={() => markAsBillPending(tableId)}
                    style={{ backgroundColor: '#ffc107', color: 'black' }}
                >
                    💸 Bill Pending
                </button>
              </div>
            </div>
          );
        })}

      {/* 📦 Archive Section (FIXED BUG 2: Using safe accessor for discount) */}
      {completedBills.length > 0 && (
        <div style={{ marginTop: 30 }}>
          <button onClick={() => setShowArchive(!showArchive)} style={{ marginBottom: 10 }}>
            {showArchive ? '⬆️ Hide Archived Bills' : `📦 Show Archived Bills (${completedBills.length})`}
          </button>
          {showArchive && (
            <div style={{ marginTop: 20 }}>
              <h3>🗂️ Archived Completed Bills</h3>
              {completedBills.map((bill, i) => {
                const discount = getSafeBillDiscount(bill);
                return (
                <div key={i} style={{
                  border: '1px dashed #888',
                  padding: 10,
                  marginBottom: 12,
                  borderRadius: 6,
                  backgroundColor: '#f0f8ff'
                }}>
                  <b>🪑 Table:</b> {bill.table} | <b>Total:</b> £{bill.total.toFixed(2)} (Sub: £{(bill.subTotal || bill.total).toFixed(2)})<br />
                  <small>
                    Placed By: {bill.placedBy || 'N/A'} | {/* Display Placed By/Customer Name */}
                    Discount: {discount.value}{discount.type === 'percent' ? '%' : '£'} (-£{discount.amount.toFixed(2)}) |
                    Payment: {bill.payment} | Time: {bill.time}
                  </small>
                </div>
              )})}
            </div>
          )}
        </div>
      )}
    </div>
  );
}