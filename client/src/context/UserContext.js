// ✅ /src/context/UserContext.js (Full Final Version with Status Progression & Persistent History)
import React, { createContext, useContext, useState, useEffect } from 'react';
import jsPDF from 'jspdf';

const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [table, setTable] = useState(null);
  const [orders, setOrders] = useState([]);
  const [kotList, setKOTList] = useState([]);
  const [orderHistory, setOrderHistory] = useState([]); // ✅ Stores all historical orders
  const [restockHistory, setRestockHistory] = useState([]);
  const [stock, setStock] = useState(() => ({
    chicken: 50, paneer: 20, spices: 10, butter: 5, cream: 5,
    riceFlour: 10, tea: 2, milk: 5, Fish: 5, Prawns: 5,
    Lamb: 5, Mutton: 5, Coffee: 5
  }));

  const [tableStatuses, setTableStatuses] = useState(() => {
    const initial = {};
    for (let i = 1; i <= 12; i++) initial[`T${i}`] = 'Available';
    return initial;
  });
  // ADD to state:
  const [onlineOrders, setOnlineOrders] = useState(() => {
    const stored = localStorage.getItem('onlineOrders');
    return stored ? JSON.parse(stored) : [];
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
    "NON-VEG STARTERS": [ { name: "Haleem", price: 150 }, { name: "Chicken 65", price: 120 }, { name: "Chilli Chicken", price: 130 }, { name: "Pepper Chicken", price: 140 }, { name: "Chicken Manchuria(Dry/Gravy)", price: 135 }, { name: "Chicken Lollipop", price: 140 }, { name: "Fish Pakora", price: 160 }, { name: "Apollo Fish", price: 180 }, { name: "Masala Fish", price: 160 }, { name: "Chilli Garlic Prawns", price: 190 }, { name: "Golden Fried Prawns", price: 200 }],
    "VEG STARTERS": [ { name: "Veg Samosa", price: 60 }, { name: "Spring Roll", price: 70 }, { name: "Cilli Paneer", price: 100 }, { name: "Paneer 65", price: 110 }, { name: "Veg Manchuria(Dry/Gravy)", price: 95 }],
    "GRILL TANDOORI": [ { name: "Tandoori Chicken(Half)", price: 180 }, { name: "Tandoori Chicken(Full)", price: 320 }, { name: "Sheek Kabab (4 Pieces)", price: 150 }, { name: "Chicken Tikka (8 Pieces)", price: 170 }, { name: "Chicken wings(10 Pcs)", price: 160 }, { name: "Sheekh Kabab/Chicken Tikka Rolls", price: 140 }, { name: "Akbari Lamb Chops", price: 220 }, { name: "Lamb Tikka Boti", price: 210 }, { name: "Mixed Grilled Platter", price: 300 }, { name: "Fish Tikka", price: 190 }, { name: "Chicken Shashlik", price: 180 }],
    "NON_VEG MAIN COURSE": [ { name: "Keema Mutter", price: 160 }, { name: "Butter Chicken", price: 170 }, { name: "Chicken Tikka Masala", price: 175 }, { name: "Chicken Karahi", price: 180 }, { name: "Chicken Malai Tikka(8 Pieces)", price: 190 }, { name: "Mutton Karahi", price: 220 }, { name: "Hyderabadi Talawa Ghost", price: 210 }, { name: "Mutton Masala", price: 200 }, { name: "Lamb Nahari", price: 230 }, { name: "Chicken Mandi", price: 260 }, { name: "Sheekh Kabab Mandi", price: 270 }, { name: "Lamb Mandi", price: 280 }, { name: "Fish Mandi", price: 275 }],
    "BREAKFAST MENU": [ { name: "Dosa", price: 50 }, { name: "Vada Sambar", price: 45 }, { name: "Idli", price: 40 }, { name: "Parata", price: 35 }],
    "DESSERTS": [ { name: "Kheer", price: 60 }, { name: "Gulab Jamun", price: 50 }],
    "DRINKS": [ { name: "Irani Chai", price: 30 }, { name: "Coffee", price: 35 }, { name: "Zeera Soda", price: 25 }]
  };

  // 🔁 Restore from localStorage
  useEffect(() => {
    const restore = (key, setter, parse = true) => {
      const val = localStorage.getItem(key);
      if (val) setter(parse ? JSON.parse(val) : val);
    };
    restore('user', setUser);
    restore('role', setRole, false);
    restore('table', setTable, false);
    restore('kotList', setKOTList);
    restore('tableStatuses', setTableStatuses);
    restore('orderHistory', setOrderHistory);
    restore('stock', setStock);
    restore('restockHistory', setRestockHistory);
    // 🔁 Load from storage in useEffect
    restore('onlineOrders', setOnlineOrders);
  }, []);

  // 🔁 Sync across tabs
  useEffect(() => {
    const sync = (e) => {
      if (e.key === 'kotList') setKOTList(JSON.parse(e.newValue));
      if (e.key === 'tableStatuses') setTableStatuses(JSON.parse(e.newValue));
      if (e.key === 'orderHistory') setOrderHistory(JSON.parse(e.newValue));
      // 🔁 Sync online orders across tabs
      if (e.key === 'onlineOrders') setOnlineOrders(JSON.parse(e.newValue));
    };
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);

  const login = (username, role) => {
    const u = { username, role };
    setUser(u); setRole(role);
    localStorage.setItem('user', JSON.stringify(u));
    localStorage.setItem('role', role);
  };

  const logout = () => {
    setUser(null); setRole(null); setTable(null);
    setOrders([]); setKOTList([]);
    localStorage.clear();
  };

  const updateTableStatus = (tableId, status) => {
    setTableStatuses(prev => {
      const updated = { ...prev, [tableId]: status };
      localStorage.setItem('tableStatuses', JSON.stringify(updated));
      return updated;
    });
  };

  const deductStock = (items) => {
    setStock(prev => {
      const updated = { ...prev };
      items.forEach(item => {
        const ingredients = ingredientMap[item.name];
        if (ingredients) {
          Object.entries(ingredients).forEach(([ing, qty]) => {
            updated[ing] = (updated[ing] || 0) - qty * item.quantity;
          });
        }
      });
      localStorage.setItem('stock', JSON.stringify(updated));
      return updated;
    });
  };

  const recordRestock = (item, qty) => {
    const log = { item, qty: parseInt(qty), time: new Date().toLocaleString() };
    setRestockHistory(prev => {
      const updated = [...prev, log];
      localStorage.setItem('restockHistory', JSON.stringify(updated));
      return updated;
    });
  };

  const generateStockReport = () => {
    const doc = new jsPDF();
    doc.text('📦 Stock Report', 10, 10);
    let y = 20;
    for (const [item, qty] of Object.entries(stock)) {
      doc.text(`${item}: ${qty}`, 10, y);
      y += 10;
    }
    doc.save('stock_report.pdf');
  };

  // ✅ Add new order (KOT + history)
  const addOrderToKOT = (tableId, items, placedBy) => {
    const newOrder = {
      id: Date.now(),
      table: tableId,
      items: items.map(i => ({ name: i.name, quantity: i.quantity, price: i.price })),
      placedBy,
      time: new Date().toLocaleTimeString(),
      status: 'Pending'
    };

    deductStock(items);
    updateTableStatus(tableId, 'Occupied');

    setKOTList(prev => {
      const updated = [...prev, newOrder];
      localStorage.setItem('kotList', JSON.stringify(updated));
      return updated;
    });

    // ✅ Add to history only if ID not already logged
    setOrderHistory(prev => {
      const exists = prev.find(o => o.id === newOrder.id);
      const updated = exists ? prev : [...prev, newOrder];
      localStorage.setItem('orderHistory', JSON.stringify(updated));
      return updated;
    });
  };

  // ✅ Status update for KOT + history
  const updateKOTStatus = (orderId, newStatus) => {
    setKOTList(prev => {
      const updated = prev.map(order =>
        order.id === orderId ? { ...order, status: newStatus } : order
      );
      localStorage.setItem('kotList', JSON.stringify(updated));
      return updated;
    });

    setOrderHistory(prev => {
      const updated = prev.map(order =>
        order.id === orderId ? { ...order, status: newStatus } : order
      );
      localStorage.setItem('orderHistory', JSON.stringify(updated));
      return updated;
    });
  };

  // ✅ Archive + mark as Paid
  const archiveOrder = (order) => {
    setOrderHistory(prev => {
      const updated = prev.map(o =>
        o.id === order.id ? { ...o, status: 'Paid' } : o
      );
      localStorage.setItem('orderHistory', JSON.stringify(updated));
      return updated;
    });
  };

  const archiveOrders = (ordersToMarkPaid) => {
    setOrderHistory(prev => {
      const updated = prev.map(o => {
        const matched = ordersToMarkPaid.find(ord => ord.id === o.id);
        return matched ? { ...o, status: 'Paid' } : o;
      });
      localStorage.setItem('orderHistory', JSON.stringify(updated));
      return updated;
    });
  };

  const setAndPersistKOTList = (list) => {
    setKOTList(list);
    localStorage.setItem('kotList', JSON.stringify(list));
  };

  // ✅ Function to add new online order
  const addOnlineOrder = (items, customerName) => {
    const newOrder = {
      id: Date.now(),
      items,
      placedBy: customerName,
      time: new Date().toLocaleTimeString(),
      status: 'Pending'
    };
    setOnlineOrders(prev => {
      const updated = [...prev, newOrder];
      localStorage.setItem('onlineOrders', JSON.stringify(updated));
      return updated;
    });
  };

  // ✅ Update status of an online order
  const updateOnlineOrderStatus = (orderId, newStatus) => {
    setOnlineOrders(prev => {
      const updated = prev.map(order =>
        order.id === orderId ? { ...order, status: newStatus } : order
      );
      localStorage.setItem('onlineOrders', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <UserContext.Provider
      value={{
        user, role, table, setTable,
        orders, setOrders,
        menu, login, logout,
        tableStatuses, updateTableStatus,
        kotList, setKOTList: setAndPersistKOTList,
        addOrderToKOT, updateKOTStatus,
        stock, setStock, ingredientMap, deductStock,
        recordRestock, restockHistory,
        generateStockReport,
        orderHistory, archiveOrder, archiveOrders,
        onlineOrders, addOnlineOrder, updateOnlineOrderStatus
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);
