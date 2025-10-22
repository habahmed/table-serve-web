// src/pages/LoginPage.jsx (FINAL LOGIN LOGIC with PASSWORDS)
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';

// --- CONFIGURATION ---

// 1. User/Role Mapping
const USERS_DATA = [
  // Admin Group
  { username: 'mujeeb', role: 'admin' },
  { username: 'majeed', role: 'admin' },
  { username: 'rafeeq', role: 'admin' },
  { username: 'shoiab', role: 'admin' },
  { username: 'qaiser', role: 'admin' },
  // Kitchen Manager Group
  { username: 'kitchen', role: 'kitchenmanager' },
  // Service/Cashier Group
  { username: 'kashif', role: 'servicemanager' },
  { username: 'cashier', role: 'cashier' },
  // Waiter Group
  { username: 'w1', role: 'waiter' },
  { username: 'w2', role: 'waiter' }
];

// 2. Role Passwords (Simplified for testing/demo)
const ROLE_PASSWORDS = {
  admin: 'admin123',
  servicemanager: 'service123',
  cashier: 'cashier123',
  kitchenmanager: 'kitchen123',
  waiter: 'waiter123'
};
// ---------------------

const getAvailableRoles = (selectedUsername) => {
    const user = USERS_DATA.find(u => u.username === selectedUsername);
    if (!user) return [];

    // Admin users can select 'admin', 'servicemanager', or 'cashier'
    if (['mujeeb', 'majeed', 'rafeeq', 'shoiab', 'qaiser'].includes(user.username)) {
        return ['admin', 'servicemanager', 'cashier'];
    }

    // Strict role enforcement for all others:
    return [user.role];
};

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useUser();
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [password, setPassword] = useState(''); // New state for password
  const [error, setError] = useState('');

  const availableRoles = useMemo(() => getAvailableRoles(selectedUser), [selectedUser]);

  const handleUserChange = (e) => {
      const username = e.target.value;
      setSelectedUser(username);
      setError('');

      // Auto-select the role if only one is available
      const roles = getAvailableRoles(username);
      if (roles.length === 1) {
          setSelectedRole(roles[0]);
      } else {
          setSelectedRole('');
      }
  };

  const handleLogin = () => {
    setError('');

    if (!selectedUser || !selectedRole || !password) {
      setError('Please select a user, a role, and enter the password.');
      return;
    }

    // 1. Check if the selected role is valid for the selected user
    if (!availableRoles.includes(selectedRole)) {
        setError(`Role ${selectedRole} is not valid for user ${selectedUser}.`);
        return;
    }

    // 2. Check the password against the selected role's password
    const requiredPassword = ROLE_PASSWORDS[selectedRole];
    if (password !== requiredPassword) {
        setError('Incorrect password for the selected role.');
        setPassword(''); // Clear password on failure
        return;
    }

    // 3. Success: Log in
    login(selectedUser, selectedRole);
    navigate('/'); // Navigate to root, which will redirect to the primary view
  };

  return (
    <div style={{ padding: 20, maxWidth: 400, margin: '50px auto', border: '1px solid #ccc', borderRadius: 8 }}>
      <h2>Login</h2>

      {/* User Selection */}
      <div style={{ marginTop: 15 }}>
        <label style={{ display: 'block', marginBottom: 5 }}>User:</label>
        <select value={selectedUser} onChange={handleUserChange} style={{ width: '100%', padding: 8 }}>
          <option value="">-- Select User --</option>
          {USERS_DATA.map(u => (
            <option key={u.username} value={u.username}>{u.username}</option>
          ))}
        </select>
      </div>

      {/* Role Selection */}
      <div style={{ marginTop: 15 }}>
        <label style={{ display: 'block', marginBottom: 5 }}>Role:</label>
        <select
            value={selectedRole}
            onChange={e => { setSelectedRole(e.target.value); setError(''); }}
            // Disable selection if only one role is available for the user
            disabled={selectedUser && availableRoles.length <= 1}
            style={{ width: '100%', padding: 8 }}
        >
          <option value="">-- Select Role --</option>
          {availableRoles.map(r => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </div>

      {/* Password Input */}
      <div style={{ marginTop: 15 }}>
        <label style={{ display: 'block', marginBottom: 5 }}>Password:</label>
        <input
          type="password"
          value={password}
          onChange={e => { setPassword(e.target.value); setError(''); }}
          style={{ width: 'calc(100% - 16px)', padding: 8 }}
        />
      </div>

      {/* Error Message */}
      {error && <p style={{ color: 'red', marginTop: 10 }}>{error}</p>}

      <button
        style={{ marginTop: 20, padding: '10px 15px', width: '100%', cursor: 'pointer' }}
        onClick={handleLogin}
      >
        🔑 Login
      </button>

      {/* Password Hint (for testing) */}
      <p style={{ fontSize: 12, marginTop: 15, textAlign: 'center', color: '#666' }}>
        Hint: Passwords are based on role (e.g., admin123, waiter123)
      </p>
    </div>
  );
}