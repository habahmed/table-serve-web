// src/pages/LoginPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';

const users = [
  { username: 'habeeb', role: 'owner' },
  { username: 'azhar', role: 'kitchenmanager' },
  { username: 'shree', role: 'servicemanager' },
  { username: 'avinash', role: 'cashier' },
  { username: 'pyari', role: 'waiter' }
];

const roles = ['owner', 'kitchenmanager', 'servicemanager', 'cashier', 'waiter'];

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useUser(); // ✅ Use login method from context
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedRole, setSelectedRole] = useState('');

  const handleLogin = () => {
    if (!selectedUser) {
      alert('Please select a user');
      return;
    }
    if (!selectedRole) {
      alert('Please select a role');
      return;
    }

    // ✅ Save to context AND localStorage
    login(selectedUser, selectedRole);
    navigate('/dashboard'); // ✅ Redirect after login
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Login</h2>
      <div>
        <label>User: </label>
        <select value={selectedUser} onChange={e => setSelectedUser(e.target.value)}>
          <option value="">-- Select User --</option>
          {users.map(u => (
            <option key={u.username} value={u.username}>{u.username}</option>
          ))}
        </select>
      </div>
      <div style={{ marginTop: 10 }}>
        <label>Role: </label>
        <select value={selectedRole} onChange={e => setSelectedRole(e.target.value)}>
          <option value="">-- Select Role --</option>
          {roles.map(r => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </div>
      <button style={{ marginTop: 20 }} onClick={handleLogin}>Login</button>
    </div>
  );
}
