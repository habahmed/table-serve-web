import React from "react";
import { useNavigate } from "react-router-dom";

const RoleHome = ({ role }) => {
  const navigate = useNavigate();

  return (
    <div style={{ padding: "20px" }}>
      <h2>Welcome, {role}</h2>
      <p>This is the {role} dashboard.</p>

      <div style={{ marginTop: "20px" }}>
        <button onClick={() => navigate("/menu")}>View Menu</button> <br /><br />
        <button onClick={() => navigate("/kot-status")}>KOT Status</button> <br /><br />
        <button onClick={() => navigate("/order-confirmation")}>Order Confirmation</button> <br /><br />
        <button onClick={() => navigate("/pending-orders")}>View Pending Orders</button> <br /><br />
        <button onClick={() => navigate("/Table-Status")}>View Table Status</button> <br /><br />
        <button onClick={() => navigate("/")}>Back to Login</button>
      </div>
    </div>
  );
};

export default RoleHome;
