import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// Context Providers
import { UserProvider } from './context/UserContext';
import { ThemeProvider } from './context/ThemeContext';
import { SocketProvider } from './context/SocketContext'; // NEW IMPORT for real-time sync

const container = document.getElementById('root');
const root = ReactDOM.createRoot(container);

root.render(
  <React.StrictMode>
    {/* 1. SocketProvider must be high in the tree to ensure all components can access the connection */}
    <SocketProvider>
      {/* 2. ThemeProvider for UI styling */}
      <ThemeProvider>
        {/* 3. UserProvider for authentication and user details */}
        <UserProvider>
          <App />
        </UserProvider>
      </ThemeProvider>
    </SocketProvider>
  </React.StrictMode>
);