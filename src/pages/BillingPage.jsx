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
  } = useUser();

  const [billPendingOnly, setBillPendingOnly] = useState(false);
  const [paymentModes, setPaymentModes] = useState({});
  const [completedBills, setCompletedBills] = useState(() => {
    const stored = localStorage.getItem('completedBills');
    return stored ? JSON.parse(stored) : [];
  });

  const [billPendingTables, setBillPendingTables] = useState(() => {
    const stored = localStorage.getItem('billPendingTables');
    return stored ? JSON.parse(stored) : [];
  });

  // Group orders by table
  const ordersByTable = kotList.reduce((acc, order) => {
    if (!acc[order.table]) acc[order.table] = [];
    acc[order.table].push(order);
    return acc;
  }, {});

  const itemPrices = {
    Haleem: 160, 'Chicken 65': 180, 'Chilli Chicken': 190, 'Pepper Chicken': 200,
    'Chicken Manchuria(Dry/Gravy)': 210, 'Chicken Lollipop': 200, 'Fish Pakora': 220,
    'Apollo Fish': 240, 'Masala Fish': 250, 'Chilli Garlic Prawns': 270, 'Golden Fried Prawns': 270,
    'Veg Samosa': 50, 'Spring Roll': 60, 'Cilli Paneer': 140, 'Paneer 65': 150, 'Veg Manchuria(Dry/Gravy)': 130,
    'Tandoori Chicken(Half)': 180, 'Tandoori Chicken(Full)': 340, 'She Kabab (4 Pieces)': 150,
    'Chicken Tikka (8 Pieces)': 220, 'Chicken wings(10 Pcs)': 210,
    'Sheekh Kabab/Chicken Tikka Rolls': 190, 'Akbari Lamb Chops': 280, 'Lamb Tikka Boti': 300,
    'Mixed Grilled Platter': 480, 'Fish Tikka': 260, 'Chicken Shashlik': 250,
    'Keema Mutter': 180, 'Butter Chicken': 220, 'Chicken Tikka Masala': 230, 'Chicken Karahi': 240,
    'Chicken Malai Tikka(8 Pieces)': 260, 'Mutton Karahi': 280, 'Hyderabadi Talawa Ghost': 290,
    'Mutton Masala': 300, 'Lamb Nahari': 270, 'Chicken Mandi': 320,
    'Sheekh Kabab Mandi': 350, 'Lamb Mandi': 370, 'Fish Mandi': 360,
    Dosa: 50, 'Vada Sambar': 40, Idli: 35, Parata: 30,
    Kheer: 50, 'Gulab Jamun': 40,
    'Irani Chai': 25, Coffee: 30, 'Zeera Soda': 35
  };

  const getOrderTotal = (items) => {
    return items.reduce((sum, item) => {
      const price = itemPrices[item.name] || 0;
      return sum + price * item.quantity;
    }, 0);
  };

  const markAsPaid = (tableId, allItems, total) => {
    const updatedKOT = kotList.filter(order => order.table !== tableId);
    setKOTList(updatedKOT);
    updateTableStatus(tableId, 'Available');

    const billData = {
      table: tableId,
      items: allItems,
      total,
      time: new Date().toLocaleString(),
      payment: paymentModes[tableId] || 'N/A'
    };

    const updatedBills = [...completedBills, billData];
    setCompletedBills(updatedBills);
    localStorage.setItem('completedBills', JSON.stringify(updatedBills));
    localStorage.setItem('kotList', JSON.stringify(updatedKOT));
  };

  const markAsBillPending = (tableId) => {
    const updated = [...new Set([...billPendingTables, tableId])];
    setBillPendingTables(updated);
    localStorage.setItem('billPendingTables', JSON.stringify(updated));
  };

  const downloadBill = (tableId, items, total) => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(`🧾 Table: ${tableId}`, 10, 10);
    let y = 20;
    items.forEach(item => {
      const line = `${item.name} x ${item.quantity} @ ₹${itemPrices[item.name] || 0}`;
      doc.text(line, 10, y);
      y += 8;
    });
    doc.text(`Total: ₹${total}`, 10, y + 10);
    doc.text(`Paid via: ${paymentModes[tableId] || 'N/A'}`, 10, y + 18);
    doc.save(`bill_${tableId}.pdf`);
  };

  const handlePaymentModeChange = (tableId, mode) => {
    setPaymentModes(prev => ({ ...prev, [tableId]: mode }));
  };

  useEffect(() => {
    localStorage.setItem('billPendingTables', JSON.stringify(billPendingTables));
    localStorage.setItem('completedBills', JSON.stringify(completedBills));
  }, [billPendingTables, completedBills]);

  return (
    <div style={{ padding: 20 }}>
      {/* 🔘 Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 15 }}>
        <button onClick={() => navigate('/dashboard')}>🏠 Dashboard</button>
        <h2>💵 Billing Page</h2>
        <button onClick={logout}>🚪 Logout</button>
      </div>

      {/* 💸 Toggle */}
      <div style={{ marginBottom: 20 }}>
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

      {/* 🔄 Active Tables for Billing */}
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
              padding: 15,
              marginBottom: 20,
              backgroundColor: '#17a2b8'
            }}>
              <h3>🪑 Table: {tableId}</h3>
              {allItems.map((item, i) => (
                <div key={i}>
                  {item.name} x {item.quantity} @ ₹{itemPrices[item.name] || 0} = ₹{item.quantity * (itemPrices[item.name] || 0)}
                </div>
              ))}
              <h4 style={{ marginTop: 10 }}>💰 Total: ₹{total}</h4>

              <div style={{ marginTop: 10 }}>
                <label><b>Payment Mode: </b></label>
                <select
                  value={paymentModes[tableId] || ''}
                  onChange={(e) => handlePaymentModeChange(tableId, e.target.value)}
                >
                  <option value="">-- Select --</option>
                  <option value="Cash">💵 Cash</option>
                  <option value="UPI">📱 UPI</option>
                  <option value="Card">💳 Card</option>
                  <option value="Other">🧾 Other</option>
                </select>
              </div>

              {/* 🔘 Actions */}
              <div style={{ marginTop: 10, display: 'flex', gap: 10 }}>
                <button onClick={() => downloadBill(tableId, allItems, total)}>🖨️ Print PDF</button>
                <button onClick={() => markAsPaid(tableId, allItems, total)}>✅ Mark as Paid</button>
                <button onClick={() => markAsBillPending(tableId)}>💸 Bill Pending</button>
              </div>
            </div>
          );
        })}

      {/* 🧾 Completed Bills */}
      {completedBills.length > 0 && (
        <>
          <h3>🗂️ Completed Bills</h3>
          {completedBills.map((bill, i) => (
            <div key={i} style={{
              border: '1px dashed #aaa',
              padding: 12,
              marginBottom: 12,
              borderRadius: 6,
              backgroundColor: '#17a2b8'
            }}>
              <b>🪑 Table:</b> {bill.table} | <b>Total:</b> ₹{bill.total} | <b>Payment:</b> {bill.payment}<br />
              <small>{bill.time}</small>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
