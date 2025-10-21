// src/pages/TableStatus.jsx
import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import './TableStatus.css'; // Ensure this CSS file exists

export default function TableStatus() {
  // ✅ Accessing hierarchical state and functions
  const { tableStatuses, updateTableStatus, menu, addOrderToKOT, user, logout } = useUser();
  const navigate = useNavigate();

  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedTableId, setSelectedTableId] = useState(null);
  const [selectedItems, setSelectedItems] = useState({});
  const [showMenu, setShowMenu] = useState(false);

  // --- Handlers ---

  // Handles clicking on a table tile
  const handleSelectTable = (room, tableId, status) => {
    setSelectedRoom(room);
    setSelectedTableId(tableId);

    // Show menu if the table is currently occupied or if we are about to take an order
    if (status === 'Occupied') {
      setShowMenu(true);
      // NOTE: Logic to fetch existing order for an occupied table should go here
    } else {
      setShowMenu(false);
    }
    setSelectedItems({}); // Clear selection for new table interaction
  };

  // Handles clicking on an Available/Occupied status button
  const handleStatusUpdate = (newStatus) => {
    if (selectedRoom && selectedTableId) {
      // ✅ Call the updated updateTableStatus with both room and tableId
      updateTableStatus(selectedRoom, selectedTableId, newStatus);

      if (newStatus === 'Occupied') {
        setShowMenu(true);
      } else {
        setShowMenu(false);
      }
    }
  };

  const handleQuantityChange = (itemKey, qty) => {
    setSelectedItems(prev => ({ ...prev, [itemKey]: qty }));
  };

  const handleConfirmOrder = () => {
    const finalItems = [];

    // Structure items for KOT/history
    Object.entries(selectedItems).forEach(([key, qty]) => {
      if (qty > 0) {
        const [cat, index] = key.split('|');
        const item = menu[cat][parseInt(index)];
        finalItems.push({ name: item.name, quantity: qty, price: item.price });
      }
    });

    if (finalItems.length > 0) {
      const tableDisplayId = `${selectedRoom} - ${selectedTableId}`;
      addOrderToKOT(tableDisplayId, finalItems, user.username);
    }

    // 🔄 Reset states
    setShowMenu(false);
    setSelectedTableId(null);
    setSelectedItems({});
  };

  const calculateTotal = () => {
    return Object.entries(selectedItems).reduce((sum, [key, qty]) => {
      if (qty > 0) {
        const [cat, index] = key.split('|');
        const item = menu[cat][parseInt(index)];
        return sum + qty * item.price;
      }
      return sum;
    }, 0);
  };

  // --- Styling ---
  const colorMap = {
    Available: '#10B981', // Green
    Occupied: '#EF4444',  // Red
    Reserved: '#F59E0B',  // Amber/Yellow
    Cleaning: '#F97316'   // Orange
  };

  // --- Render Logic ---

  // RENDER 1: Room Selection View
  if (!selectedRoom) {
    return (
      <div style={{ padding: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <button onClick={() => navigate('/dashboard')}>🏠 Dashboard</button>
          <button onClick={logout}>🚪 Logout</button>
        </div>
        <h2>Select a Room</h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginTop: '20px' }}>
          {Object.keys(tableStatuses).map(roomName => {
            const tablesInRoom = tableStatuses[roomName];
            const occupiedCount = Object.values(tablesInRoom).filter(status => status === 'Occupied').length;
            const totalTables = Object.keys(tablesInRoom).length;

            return (
              <div
                key={roomName}
                onClick={() => setSelectedRoom(roomName)}
                style={{
                  padding: 20,
                  borderRadius: 10,
                  backgroundColor: occupiedCount > 0 ? '#374151' : '#1F2937',
                  cursor: 'pointer',
                  textAlign: 'center',
                  color: '#fff',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                }}
              >
                <h3>{roomName}</h3>
                <p>{occupiedCount} / {totalTables} Occupied</p>
                <p style={{fontSize: '0.8em', opacity: 0.8}}>Click to view tables</p>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // RENDER 2: Table Status View (within selected room)
  const tables = tableStatuses[selectedRoom] || {};

  return (
    <div style={{ padding: 20 }}>
      {/* 🔘 Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button onClick={() => { setSelectedRoom(null); setSelectedTableId(null); }}>
          ⬅️ Back to Rooms
        </button>
        <div>
          <button onClick={() => navigate('/dashboard')} style={{ marginRight: 10 }}>🏠 Dashboard</button>
          <button onClick={logout}>🚪 Logout</button>
        </div>
      </div>

      <h2>🪑 Tables in {selectedRoom}</h2>

      {/* 🔳 Display 15 tables in a 5x3 grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px', marginTop: 20 }}>
        {Object.entries(tables).map(([tableId, status]) => (
          <div
            key={tableId}
            onClick={() => handleSelectTable(selectedRoom, tableId, status)}
            style={{
              backgroundColor: colorMap[status],
              padding: 15,
              borderRadius: 8,
              cursor: 'pointer',
              textAlign: 'center',
              color: '#fff',
              fontWeight: 'bold',
              border: selectedTableId === tableId ? '3px solid #FFCD3C' : 'none', // Highlight selected table
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
            }}
          >
            {tableId} <br />
            {status}
          </div>
        ))}
      </div>

      {/* 🔘 Control Panel for selected table */}
      {selectedTableId && (
        <div style={{ marginTop: 30, padding: 20, border: '1px solid #ccc', borderRadius: 8 }}>
          <h3>Control Panel: {selectedRoom} - {selectedTableId}</h3>

          <div style={{ marginBottom: 15 }}>
            {['Available', 'Occupied', 'Reserved', 'Cleaning'].map((status) => (
              <button
                key={status}
                style={{ marginRight: 10, backgroundColor: colorMap[status], color: 'white', border: 'none', padding: '10px 15px', borderRadius: 5, cursor: 'pointer' }}
                onClick={() => handleStatusUpdate(status)}
              >
                Set to {status}
              </button>
            ))}
          </div>

          {/* 🧾 Menu for ordering */}
          {showMenu && (
            <div style={{ marginTop: 20 }}>
              <h4>🍽️ Place Order</h4>
              <div style={{ maxHeight: 300, overflowY: 'auto', border: '1px solid #eee', padding: 10, marginBottom: 10 }}>
                {Object.entries(menu).map(([category, items]) => (
                  <div key={category} style={{ marginBottom: 10 }}>
                    <h5 style={{ margin: '5px 0', color: '#333' }}>{category}</h5>
                    {items.map((item, index) => {
                      const itemKey = `${category}|${index}`;
                      return (
                        <div key={itemKey} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 0', borderBottom: '1px dotted #ddd' }}>
                          <label>{item.name} (£{item.price})</label>
                          <input
                            type="number"
                            min={0}
                            value={selectedItems[itemKey] || 0}
                            onChange={(e) => handleQuantityChange(itemKey, parseInt(e.target.value))}
                            style={{ marginLeft: 10, width: 60, padding: 5, borderRadius: 3, border: '1px solid #ccc' }}
                          />
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>

              <h4 style={{ marginTop: 15, borderTop: '2px solid #333', paddingTop: 10 }}>Total: £{calculateTotal()}</h4>
              <button
                onClick={handleConfirmOrder}
                style={{ marginTop: 15, padding: '10px 20px', backgroundColor: '#3B82F6', color: 'white', border: 'none', borderRadius: 5, cursor: 'pointer' }}
              >
                ✅ Confirm Order and Send to KOT
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}