// ✅ src/pages/TableStatus.jsx (FINAL FIX: Single source of truth for KOT/Status update)
import React, { useState, useMemo } from 'react';
import { useUser } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import './TableStatus.css'; // Ensure this CSS file exists

export default function TableStatus() {
  // ✅ Accessing all necessary state and functions
  const {
    tableStatuses,
    updateTableStatus,
    menu,
    addOrderToKOT,
    user, // user is the object {username, role}
    logout,
    role,
    ROOM_NAMES // Accessing ROOM_NAMES from context for clean code
  } = useUser();

  const navigate = useNavigate();

  // --- STATE FOR ROOM/TABLE SELECTION ---
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedTablePart, setSelectedTablePart] = useState(null); // The table number (e.g., 'T1')
  const [selectedItems, setSelectedItems] = useState({});
  const [showMenu, setShowMenu] = useState(false);
  const [takeAwayName, setTakeAwayName] = useState('');

  // --- Derived State ---
  const selectedTableId = useMemo(() => {
    // Correctly creates the combined ID: e.g., "Restaurant - T1"
    return selectedRoom && selectedTablePart ? `${selectedRoom} - ${selectedTablePart}` : null;
  }, [selectedRoom, selectedTablePart]);


  // --- Handlers ---

  const handleSelectRoom = (roomName) => {
    setSelectedRoom(roomName);
    setSelectedTablePart(null);
    setShowMenu(false);
    setSelectedItems({});
  };

  const handleSelectTable = (tablePart, status) => {
    setSelectedTablePart(tablePart);

    // Show menu if the table is occupied or available
    if (status === 'Occupied' || status === 'Available') {
      setShowMenu(true);
    } else {
      setShowMenu(false);
    }
    setSelectedItems({});
  };

  const handleStatusUpdate = (newStatus) => {
    if (selectedRoom && selectedTablePart) {
      updateTableStatus(selectedRoom, selectedTablePart, newStatus);
    }
    if (newStatus === 'Available' || newStatus === 'Cleaning') {
        setSelectedTablePart(null);
        setShowMenu(false);
    }
  };

  const handleQuantityChange = (itemKey, quantity) => {
    setSelectedItems(prev => ({
      ...prev,
      [itemKey]: quantity > 0 ? quantity : 0,
    }));
  };

  const calculateTotal = () => {
    return Object.entries(selectedItems).reduce((sum, [itemKey, quantity]) => {
      if (quantity === 0) return sum;
      const [category, index] = itemKey.split('|');
      const item = menu[category][parseInt(index)];
      if (!item) return sum; // Defensive check
      return sum + (item.price * quantity);
    }, 0).toFixed(2);
  };

  const handleConfirmOrder = () => {
    const orderItems = Object.entries(selectedItems)
      .filter(([, quantity]) => quantity > 0)
      .map(([itemKey, quantity]) => {
        const [category, index] = itemKey.split('|');
        const item = menu[category][parseInt(index)];

        if (!item) {
             console.error(`Menu item not found for key: ${itemKey}`);
             return null;
        }

        return {
          name: item.name,
          price: item.price,
          quantity: quantity
        };
      })
      .filter(item => item !== null); // Remove any null items

    if (orderItems.length === 0) {
      alert("Please select items to order.");
      return;
    }

    let placedBy = user?.username || 'Guest'; // Use optional chaining for safety
    if (selectedRoom === 'TakeAway') {
        if (!takeAwayName) {
            alert("Please enter a customer name for the TakeAway order.");
            return;
        }
        placedBy = takeAwayName;
    }

    // CORE FUNCTION CALL: This updates KOT list and Table Status in context
    addOrderToKOT(selectedTableId, orderItems, placedBy);

    // Clean up local state
    setSelectedItems({});
    setTakeAwayName('');

    // ✅ Navigate immediately to KOT status page to confirm order visibility
    navigate('/kot-status');
  };


  // Helper to determine role-based navigation links
  const getNavLinks = () => {
      const links = [];
      if (role === 'admin' || role === 'servicemanager' || role === 'cashier') {
          links.push(<button key="dash" onClick={() => navigate('/dashboard')}>🏠 Dashboard</button>);
      }
      if (role === 'waiter' || role === 'servicemanager') {
          // Waiters need KOT/Pending Orders access
          links.push(<button key="pending" onClick={() => navigate('/pending-orders')}>📋 Pending Orders</button>);
      }
      links.push(<button key="menu" onClick={() => navigate('/menu')}>🍽️ Menu List</button>);
      links.push(<button key="kotstatus" onClick={() => navigate('/kot-status')}>🧾 KOT Status</button>);
      links.push(<button key="logout" onClick={logout}>🚪 Logout</button>);
      return links;
  };

  // Common Header component for both Room/Table views
  const Header = ({ title }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, borderBottom: '1px solid #eee', paddingBottom: 10 }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
            <h2>{title}</h2>
            {/* Safely render username string instead of user object */}
            <span style={{ fontSize: '0.9em', color: '#666' }}>Logged in as: {user?.username} ({role})</span>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>{getNavLinks()}</div>
    </div>
  );


  const renderRoomView = () => (
    <>
        <Header title="🪑 Select a Room" />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, justifyContent: 'center', marginTop: 30 }}>
            {ROOM_NAMES.map(room => {
                const roomTables = tableStatuses[room] || {};
                const occupiedCount = Object.values(roomTables).filter(s => s === 'Occupied').length;
                const availableCount = Object.values(roomTables).filter(s => s === 'Available').length;

                return (
                    <div
                        key={room}
                        onClick={() => handleSelectRoom(room)}
                        style={{
                            padding: '30px',
                            backgroundColor: occupiedCount > 0 ? '#dc3545' : '#28a745',
                            color: 'white',
                            borderRadius: 10,
                            cursor: 'pointer',
                            textAlign: 'center',
                            minWidth: 200,
                            boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
                        }}
                    >
                        <h3>{room}</h3>
                        <p>{occupiedCount} Occupied / {availableCount} Available</p>
                    </div>
                );
            })}
        </div>
    </>
  );

  const renderTableView = () => {
    const tablesInRoom = tableStatuses[selectedRoom] || {};

    return (
        <>
            <Header title={`🪑 Tables in: ${selectedRoom}`} />

            <button onClick={() => handleSelectRoom(null)} style={{ marginBottom: 20 }}>
                ⬅️ Back to Rooms
            </button>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, borderBottom: '1px solid #eee', paddingBottom: 20 }}>
                {Object.entries(tablesInRoom).map(([tablePart, status]) => {
                    const isSelected = selectedTablePart === tablePart;
                    let color = '#ccc';
                    if (status === 'Available') color = '#28a745';
                    else if (status === 'Occupied') color = '#dc3545';
                    else if (status === 'Reserved') color = '#ffc107';
                    else if (status === 'Cleaning') color = '#FF8000';

                    return (
                        <div
                            key={tablePart}
                            onClick={() => handleSelectTable(tablePart, status)}
                            style={{
                                padding: '15px 10px',
                                backgroundColor: color,
                                color: 'white',
                                borderRadius: 5,
                                cursor: 'pointer',
                                textAlign: 'center',
                                minWidth: 100,
                                border: isSelected ? '3px solid black' : '1px solid #888'
                            }}
                        >
                            {tablePart}
                            <div style={{ fontSize: 12, marginTop: 5, fontWeight: 'bold' }}>{status}</div>
                        </div>
                    );
                })}
            </div>
        </>
    );
  };


  // --- MAIN COMPONENT RENDER ---

  return (
    <div style={{ padding: 20, maxWidth: 1200, margin: '0 auto' }}>

      {!selectedRoom ? renderRoomView() : renderTableView()}

      {/* Order Panel - Only shown if both Room and Table are selected */}
      {selectedTableId && (
        <div style={{ marginTop: 30, border: '2px solid #333', padding: 20, borderRadius: 10, backgroundColor: '#f9f9f9' }}>
          <h3>Order for: {selectedTableId}</h3>

          <div style={{ marginBottom: 15, display: 'flex', gap: 10 }}>
            {['Available', 'Occupied', 'Reserved', 'Cleaning'].map(status => (
              <button
                key={status}
                onClick={() => handleStatusUpdate(status)}
                style={{ backgroundColor: status === (tableStatuses[selectedRoom]?.[selectedTablePart]) ? '#007bff' : '#6c757d', color: 'white' }}
                disabled={selectedRoom === 'TakeAway' && (status === 'Available' || status === 'Cleaning')}
              >
                {status}
              </button>
            ))}
          </div>

          {selectedRoom === 'TakeAway' && (
              <div style={{ marginBottom: 15 }}>
                  <label style={{ fontWeight: 'bold' }}>Customer Name:</label>
                  <input
                      type="text"
                      placeholder="Enter Customer Name"
                      value={takeAwayName}
                      onChange={(e) => setTakeAwayName(e.target.value)}
                      style={{ marginLeft: 10, padding: 5, width: 'calc(100% - 150px)', border: '1px solid #ccc', borderRadius: 3 }}
                  />
              </div>
          )}


          {showMenu && (
            <div>
              <div style={{ maxHeight: 400, overflowY: 'auto' }}>
                {Object.entries(menu).map(([category, items]) => (
                  <div key={category} style={{ marginBottom: 15, padding: 10, border: '1px solid #eee', borderRadius: 5 }}>
                    <h5 style={{ margin: '0 0 10px 0', color: '#333' }}>{category}</h5>
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