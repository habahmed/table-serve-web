// ✅ src/context/UserContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import jsPDF from 'jspdf';

const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [table, setTable] = useState(null);
  const [orders, setOrders] = useState([]);
  const [kotList, setKOTList] = useState([]);
  const [stock, setStock] = useState({});
  const [restockHistory, setRestockHistory] = useState([]);
  const [tableStatuses, setTableStatuses] = useState(() => {
    const init = {};
    for (let i = 1; i <= 12; i++) init[`T${i}`] = 'Available';
    return init;
  });

  const ingredientMap = {
    'Chicken 65': { chicken: 1, spices: 0.2 },
    'Paneer 65': { paneer: 1, spices: 0.2 },
    'Butter Chicken': { chicken: 1, butter: 0.2, cream: 0.1, spices: 0.2 },
    'Dosa': { riceFlour: 0.5 },
    'Idli': { riceFlour: 0.3 },
    'Irani Chai': { tea: 0.1, milk: 0.2 }
  };

  const menu = {
    "NON-VEG STARTERS": [ { name: "Haleem", price: 150 }, { name: "Chicken 65", price: 120 } ],
    "VEG STARTERS": [ { name: "Paneer 65", price: 110 }, { name: "Veg Manchuria(Dry/Gravy)", price: 95 } ],
    "NON_VEG MAIN COURSE": [ { name: "Butter Chicken", price: 170 } ],
    "BREAKFAST MENU": [ { name: "Dosa", price: 50 }, { name: "Idli", price: 40 } ],
    "DRINKS": [ { name: "Irani Chai", price: 30 } ]
  };

  useEffect(() => {
    const restore = (key, setter, json = true) => {
      const val = localStorage.getItem(key);
      if (val) setter(json ? JSON.parse(val) : val);
    };
    restore('user', setUser);
    restore('role', setRole, false);
    restore('table', setTable, false);
    restore('kotList', setKOTList);
    restore('stock', setStock);
    restore('tableStatuses', setTableStatuses);
    restore('restockHistory', setRestockHistory);
  }, []);

  const updateTableStatus = (tableId, status) => {
    const updated = { ...tableStatuses, [tableId]: status };
    setTableStatuses(updated);
    localStorage.setItem('tableStatuses', JSON.stringify(updated));
  };

  const deductStock = (items) => {
    setStock(prev => {
      const updated = { ...prev };
      items.forEach(item => {
        const ingredients = ingredientMap[item.name];
        if (ingredients) {
          Object.entries(ingredients).forEach(([i, qty]) => {
            updated[i] = (updated[i] || 0) - qty * item.quantity;
          });
        }
      });
      localStorage.setItem('stock', JSON.stringify(updated));
      return updated;
    });
  };

  const addOrderToKOT = (tableId, items, placedBy) => {
    const newOrder = {
      id: Date.now(),
      table: tableId,
      items,
      placedBy,
      time: new Date().toLocaleTimeString(),
      status: 'Pending'
    };
    updateTableStatus(tableId, 'Occupied'); // ✅ Auto-occupy table
    deductStock(items);
    const updated = [...kotList, newOrder];
    setKOTList(updated);
    localStorage.setItem('kotList', JSON.stringify(updated));
  };

  const updateKOTStatus = (id, newStatus) => {
    const updated = kotList.map(o => o.id === id ? { ...o, status: newStatus } : o);
    setKOTList(updated);
    localStorage.setItem('kotList', JSON.stringify(updated));
  };

  const recordRestock = (item, qty) => {
    const log = { item, qty: parseInt(qty), time: new Date().toLocaleString() };
    const updated = [...restockHistory, log];
    setRestockHistory(updated);
    localStorage.setItem('restockHistory', JSON.stringify(updated));
  };

  const generateStockReport = () => {
    const doc = new jsPDF();
    doc.text('📦 Stock Report', 10, 10);
    let y = 20;
    Object.entries(stock).forEach(([item, qty]) => {
      doc.text(`${item}: ${qty}`, 10, y);
      y += 10;
    });
    doc.save('stock_report.pdf');
  };

  return (
    <UserContext.Provider value={{
      user, role, table, setTable, orders, setOrders,
      menu, stock, setStock, kotList, addOrderToKOT, updateKOTStatus,
      tableStatuses, updateTableStatus,
      restockHistory, recordRestock, generateStockReport
    }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);
