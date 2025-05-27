// src/pages/TableSelection.jsx
import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../context/UserContext";

const TableSelection = () => {
  const { user, selectTable } = useContext(UserContext);
  const [table, setTable] = useState("");
  const navigate = useNavigate();

  const handleSelect = () => {
    if (table) {
      selectTable(table);
      navigate("/menu");
    }
  };

  if (user?.role === "Owner") {
    navigate("/dashboard");
    return null;
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Select Your Table</h2>
      <select value={table} onChange={(e) => setTable(e.target.value)}>
        <option value="">Select Table</option>
        {[...Array(12)].map((_, i) => (
          <option key={i} value={`Table ${i + 1}`}>
            Table {i + 1}
          </option>
        ))}
      </select>
      <br /><br />
      <button onClick={handleSelect} disabled={!table}>Continue</button>
    </div>
  );
};

export default TableSelection;
