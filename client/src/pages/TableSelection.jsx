// src/pages/TableSelection.jsx
import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../context/UserContext";

const TableSelection = () => {
  // ✅ Access the UserContext, which now returns hierarchical data
  const { user, tableStatuses, selectTable, ROOM_NAMES } = useContext(UserContext);

  const [room, setRoom] = useState("");
  const [tableId, setTableId] = useState("");
  const navigate = useNavigate();

  const handleSelect = () => {
    if (room && tableId) {
      // ✅ Call the updated selectTable function with room and tableId
      selectTable(room, tableId);
      navigate("/menu");
    }
  };

  // Auto-redirect owner
  if (user?.role === "Owner") {
    navigate("/dashboard");
    return null;
  }

  // Get available tables for the currently selected room
  const availableTables = room && tableStatuses[room]
    ? Object.keys(tableStatuses[room]).filter(tId => tableStatuses[room][tId] === 'Available')
    : [];

  return (
    <div style={{ padding: 20 }}>
      <h2>Select Your Table</h2>

      {/* 1. Room Selection */}
      <select value={room} onChange={(e) => {
        setRoom(e.target.value);
        setTableId(""); // Reset table when room changes
      }}
      style={{ marginRight: 10, padding: 8 }}>
        <option value="">Select Room</option>
        {ROOM_NAMES.map((r) => (
          <option key={r} value={r}>{r}</option>
        ))}
      </select>

      {/* 2. Table Selection (Filtered by available tables in selected room) */}
      <select
        value={tableId}
        onChange={(e) => setTableId(e.target.value)}
        disabled={!room || availableTables.length === 0}
        style={{ padding: 8 }}
      >
        <option value="">Select Table</option>
        {availableTables.map((tId) => (
          <option key={tId} value={tId}>
            {tId}
          </option>
        ))}
      </select>

      <br /><br />
      <button onClick={handleSelect} disabled={!room || !tableId}>Continue</button>

      {availableTables.length === 0 && room && (
          <p style={{ color: 'red', marginTop: 10 }}>All tables in {room} are currently occupied or unavailable.</p>
      )}
    </div>
  );
};

export default TableSelection;