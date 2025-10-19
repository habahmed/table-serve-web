import React from "react";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div>
      <h2>Dashboard</h2>
      <ul>
        <li><Link to="/menu">Menu</Link></li>
        <li><Link to="/table-status">Table Status</Link></li>
        <li><Link to="/kot-status">KOT Status</Link></li>
        <li><Link to="/pending-orders">Pending Orders</Link></li>
        <li><Link to="/order-confirmation">Order Confirmation</Link></li>
      </ul>
    </div>
  );
};

export default Home;
