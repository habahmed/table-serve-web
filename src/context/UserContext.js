import React, { createContext, useContext, useState, useEffect } from 'react';
import jsPDF from 'jspdf'; // 📄 For exporting stock report as PDF

const UserContext = createContext();

export function UserProvider({ children }) {
  // 🧑‍💼 User + Role + Table Context
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [table, setTable] = useState(null);

  // 📦 Order and KOT tracking
  const [orders, setOrders] = useState([]);
  const [kotList, setKOTList] = useState([]);

  // 🧾 Procurement and inventory
  const [stock, setStock] = useState(() => ({
    chicken: 50,
    paneer: 20,
    spices: 10,
    butter: 5,
    cream: 5,
    riceFlour: 10,
    tea: 2,
    milk: 5,
    Fish: 5,
    Prawns: 5,
    Lamb: 5,
    Mutton: 5,
    Coffee: 5
  }));
  const [restockHistory, setRestockHistory] = useState([]); // ✅ Logs for restock activity

  // 🪑 Initial table statuses
  const [tableStatuses, setTableStatuses] = useState(() => {
    const initial = {};
    for (let i = 1; i <= 12; i++) initial[`T${i}`] = 'Available';
    return initial;
  });

  // ✅ Ingredient usage for logistics tracking
  const ingredientMap = {
    'Chicken 65': { chicken: 1, spices: 0.2 },
    'Paneer 65': { paneer: 1, spices: 0.2 },
    'Butter Chicken': { chicken: 1, butter: 0.2, cream: 0.1, spices: 0.2 },
    'Dosa': { riceFlour: 0.5 },
    'Idli': { riceFlour: 0.3 },
    'Irani Chai': { tea: 0.1, milk: 0.2 },
    // ➕ Extend mapping as needed
  };

  // 🧾 Menu with pricing
  const menu = {
    "NON-VEG STARTERS": [ { name: "Haleem", price: 150 }, { name: "Chicken 65", price: 120 }, { name: "Chilli Chicken", price: 130 }, { name: "Pepper Chicken", price: 140 }, { name: "Chicken Manchuria(Dry/Gravy)", price: 135 }, { name: "Chicken Lollipop", price: 140 }, { name: "Fish Pakora", price: 160 }, { name: "Apollo Fish", price: 180 }, { name: "Masala Fish", price: 160 }, { name: "Chilli Garlic Prawns", price: 190 }, { name: "Golden Fried Prawns", price: 200 }],
    "VEG STARTERS": [ { name: "Veg Samosa", price: 60 }, { name: "Spring Roll", price: 70 }, { name: "Cilli Paneer", price: 100 }, { name: "Paneer 65", price: 110 }, { name: "Veg Manchuria(Dry/Gravy)", price: 95 }],
    "GRILL TANDOORI": [ { name: "Tandoori Chicken(Half)", price: 180 }, { name: "Tandoori Chicken(Full)", price: 320 }, { name: "She Kabab (4 Pieces)", price: 150 }, { name: "Chicken Tikka (8 Pieces)", price: 170 }, { name: "Chicken wings(10 Pcs)", price: 160 }, { name: "Sheekh Kabab/Chicken Tikka Rolls", price: 140 }, { name: "Akbari Lamb Chops", price: 220 }, { name: "Lamb Tikka Boti", price: 210 }, { name: "Mixed Grilled Platter", price: 300 }, { name: "Fish Tikka", price: 190 }, { name: "Chicken Shashlik", price: 180 }],
    "NON_VEG MAIN COURSE": [ { name: "Keema Mutter", price: 160 }, { name: "Butter Chicken", price: 170 }, { name: "Chicken Tikka Masala", price: 175 }, { name: "Chicken Karahi", price: 180 }, { name: "Chicken Malai Tikka(8 Pieces)", price: 190 }, { name: "Mutton Karahi", price: 220 }, { name: "Hyderabadi Talawa Ghost", price: 210 }, { name: "Mutton Masala", price: 200 }, { name: "Lamb Nahari", price: 230 }, { name: "Chicken Mandi", price: 260 }, { name: "Sheekh Kabab Mandi", price: 270 }, { name: "Lamb Mandi", price: 280 }, { name: "Fish Mandi", price: 275 }],
    "BREAKFAST MENU": [ { name: "Dosa", price: 50 }, { name: "Vada Sambar", price: 45 }, { name: "Idli", price: 40 }, { name: "Parata", price: 35 }],
    "DESSERTS": [ { name: "Kheer", price: 60 }, { name: "Gulab Jamun", price: 50 }],
    "DRINKS": [ { name: "Irani Chai", price: 30 }, { name: "Coffee", price: 35 }, { name: "Zeera Soda", price: 25 }]
  };

  // 🔁 Restore from localStorage on load
  useEffect(() => {
    const restore = (key, setter, parseJson = true) => {
      const saved = localStorage.getItem(key);
      if (saved) {
        setter(parseJson ? JSON.parse(saved) : saved);
      }
    };

    restore('user', setUser);                // ✅ JSON
    restore('role', setRole, false);         // ✅ Plain string
    restore('table', setTable, false);       // ✅ Plain string
    restore('tableStatuses', setTableStatuses);
    restore('kotList', setKOTList);
    restore('stock', setStock);
    restore('restockHistory', setRestockHistory);
  }, []);

  // ✅ Login & Logout
  const login = (username, role) => {
    const userData = { username, role };
    setUser(userData);
    setRole(role);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('role', role);
  };

  const logout = () => {
    setUser(null);
    setRole(null);
    setTable(null);
    setOrders([]);
    setKOTList([]);
    localStorage.clear();
  };

  // ✅ Update table status
  const updateTableStatus = (tableId, status) => {
    setTableStatuses(prev => {
      const updated = { ...prev, [tableId]: status };
      localStorage.setItem('tableStatuses', JSON.stringify(updated));
      return updated;
    });
  };

  // ✅ Deduct ingredients on order placement
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

  // ✅ Record restock to history
  const recordRestock = (item, qty) => {
    const log = { item, qty: parseInt(qty), time: new Date().toLocaleString() };
    setRestockHistory(prev => {
      const updated = [...prev, log];
      localStorage.setItem('restockHistory', JSON.stringify(updated));
      return updated;
    });
  };

  // ✅ Generate PDF stock report
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

  // ✅ Add new order to KOT and deduct inventory
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
    setKOTList(prev => {
      const updated = [...prev, newOrder];
      localStorage.setItem('kotList', JSON.stringify(updated));
      return updated;
    });
  };

  const updateKOTStatus = (orderId, newStatus) => {
    setKOTList(prev => {
      const updated = prev.map(order =>
        order.id === orderId ? { ...order, status: newStatus } : order
      );
      localStorage.setItem('kotList', JSON.stringify(updated));
      return updated;
    });
  };

  const setAndPersistKOTList = (newList) => {
    setKOTList(newList);
    localStorage.setItem('kotList', JSON.stringify(newList));
  };

  // ✅ Expose context to app
  return (
    <UserContext.Provider
      value={{
        user,
        role,
        table,
        setTable,
        orders,
        setOrders,
        menu,
        login,
        logout,
        tableStatuses,
        updateTableStatus,
        kotList,
        setKOTList: setAndPersistKOTList,
        addOrderToKOT,
        updateKOTStatus,
        stock,
        setStock,
        ingredientMap,
        deductStock,
        recordRestock,
        restockHistory,
        generateStockReport
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

// ✅ Hook to use context
export const useUser = () => useContext(UserContext);
