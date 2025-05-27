// src/pages/KOTStatus.jsx
//import React from "react";

//const KotStatus = () => {
  //return <div>KOT Status Page</div>;
//};

//export default KotStatus;

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';

export default function KOTStatusPage() {
  const navigate = useNavigate();
  const { logout } = useUser();

  return (
    <div style={{ padding: 20 }}>
      {/* 🔘 Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
        <button onClick={() => navigate('/dashboard')}>🏠 Back to Dashboard</button>
        <button onClick={logout}>🚪 Logout</button>
      </div>

      <h2>KOT Status Page</h2>
      <p>This page will show Kitchen Order Tickets (KOT) status.</p>
    </div>
  );
}
