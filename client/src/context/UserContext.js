// ✅ /src/context/UserContext.js (Final COMPLETE Version with ALL functions in Provider)
import React, { createContext, useContext, useState, useEffect } from 'react';
import jsPDF from 'jspdf';

const UserContext = createContext();

// --- Configuration for Tables ---
const TABLES_PER_ROOM = 15;
const ROOM_NAMES = [
  "Restaurant", "Meeting Room", "Board Room", "Garden", "Majlis(RM6&7)", "Party Hall", "TakeAway"
];
// ---------------------------------

// Helper function to safely parse localStorage items
const loadFromStorage = (key, initialValue) => {
    try {
        const stored = localStorage.getItem(key);
        // If the key is null or undefined (like 'user' on logout), return initialValue
        if (stored === null || stored === undefined) return initialValue;

        // Handle specific case for role and table which are stored as raw strings
        if (key === 'role' || key === 'table') return stored;

        return JSON.parse(stored);
    } catch (e) {
        console.error(`Error loading state ${key}:`, e);
        return initialValue;
    }
};

export function UserProvider({ children }) {
  // --- STATE INITIALIZATION ---
  const initialTableStatuses = (() => {
    const initial = {};
    ROOM_NAMES.forEach(room => {
      initial[room] = {};
      for (let i = 1; i <= TABLES_PER_ROOM; i++) {
        initial[room][`T${i}`] = 'Available';
      }
    });
    return initial;
  })();

  const initialStock = { chicken: 50, paneer: 20, spices: 10, butter: 5, cream: 5, riceFlour: 10, tea: 2, milk: 5, Fish: 5, Prawns: 5, Lamb: 5, Mutton: 5, Coffee: 5 };

  // Load all state from storage on mount
  const [user, setUser] = useState(() => loadFromStorage('user', null));
  const [role, setRole] = useState(() => loadFromStorage('role', null));
  const [table, setTable] = useState(() => loadFromStorage('table', null));
  const [orders, setOrders] = useState([]);
  const [kotList, setKOTList] = useState(() => loadFromStorage('kotList', []));
  const [orderHistory, setOrderHistory] = useState(() => loadFromStorage('orderHistory', []));
  const [onlineOrders, setOnlineOrders] = useState(() => loadFromStorage('onlineOrders', []));
  const [restockHistory, setRestockHistory] = useState(() => loadFromStorage('restockHistory', []));
  const [stock, setStock] = useState(() => loadFromStorage('stock', initialStock));
  const [tableStatuses, setTableStatuses] = useState(() => loadFromStorage('tableStatuses', initialTableStatuses));


  // --- MENU AND INGREDIENT MAPS (unchanged) ---
  const ingredientMap = {
    'Chicken 65': { chicken: 1, spices: 0.2 }, 'Paneer 65': { paneer: 1, spices: 0.2 },
    'Butter Chicken': { chicken: 1, butter: 0.2, cream: 0.1, spices: 0.2 },
    'Dosa': { riceFlour: 0.5 }, 'Idli': { riceFlour: 0.3 }, 'Irani Chai': { tea: 0.1, milk: 0.2 }
  };
  const menu = {
  "AL-HYDERABADI DUM BIRYANI": [
          { name: "BIRYANI RICE", price: 3.99 },
          { name: "MANDI RICE", price: 4.99 },
          { name: "EGG BIRYANI", price: 5.99 },
          { name: "VEG BIRYANI", price: 6.99 },
          { name: "CHICKEN DUM BIRYANI", price: 6.99 },
          { name: "CHICKEN TIKKA BIRYANI", price: 8.99 },
          { name: "LAMB DUM BIRYANI", price: 9.99 },
          { name: "PANEER BIRYANI", price: 9.99 },
          { name: "CHICKEN 65 BIRYANI", price: 9.99 },
          { name: "CHICKEN DUM BIRYANI (FAMILY PACK: 4-5 PERSON)", price: 29.99 },
          { name: "CHICKEN DUM BIRYANI WITH CHICKEN 65 (FAMILY PACK: 4-5 PERSON)", price: 34.99 },
          { name: "LAMB DUM BIRYANI (FAMILY PACK: 4-5 PERSON)", price: 39.99 },
          { name: "LAMB DUM BIRYANI WITH CHICKEN 65 (FAMILY PACK: 4-5 PERSON)", price: 44.99 }
      ],
      "AL-HYDERABADI SPECIALS": [
          { name: "DUM KA MURGH", price: 8.99 },
          { name: "HYDERABADI TALAWA GHOST", price: 10.99 },
          { name: "NAWAABI LAMB CREAMY CURRY HYDERABADI SPECIAL", price: 12.99 },
          { name: "AL HYDERABADI TAWA", price: 49.99 }
      ],
      "BREADS": [
          { name: "PLAIN NAAN", price: 1.49 },
          { name: "BUTTER NAAN", price: 1.99 },
          { name: "RUMALI ROTI", price: 1.99 },
          { name: "GARLIC CHILLI NAAN", price: 2.49 },
          { name: "KEEMA NAAN", price: 2.99 }
      ],
      "KIDS MEAL DEALS": [
          { name: "PLAIN CHIPS", price: 3.99 },
          { name: "MASALA CHIPS", price: 3.99 },
          { name: "CHICKEN NUGGETS WITH FRIES", price: 5.99 }
      ],
      "EXTRAS": [
          { name: "ONIONS & SALAD", price: 1.99 }
      ],
      "VEG CURRY": [
          { name: "MIXED VEG CURRY", price: 7.99 },
          { name: "DAL TADKA", price: 7.99 },
          { name: "BAGARA BAINGAN", price: 7.99 },
          { name: "KADAI PANEER", price: 9.99 },
          { name: "MUTTER PANEER", price: 9.99 },
          { name: "PALAK PANEER", price: 9.99 }
      ],
      "HYDERABADI SPECIAL MANDI": [
          { name: "CHICKEN MANDI", price: 9.99 },
          { name: "TANDOORI CHICKEN MANDI", price: 10.99 },
          { name: "SHEEKH KEBAB MANDI", price: 11.99 },
          { name: "CHICKEN TIKKA MANDI", price: 13.99 },
          { name: "CHICKEN 65 MANDI", price: 13.99 },
          { name: "LAMB MANDI", price: 14.99 },
          { name: "FISH MANDI", price: 14.99 },
          { name: "HALF TANDOORI CHICKEN MANDI", price: 14.99 },
          { name: "LAMB MANDI WITH CHICKEN 65", price: 17.99 },
          { name: "LAMB MANDI WITH CHICKEN THIGH PIECE", price: 17.99 },
          { name: "DOUBLE GHOSHT LAMB MANDI", price: 24.99 },
          { name: "CHICKEN MANDI STEAM (FAMILY PACK: 4-5 PERSON)", price: 34.99 },
          { name: "TANDOORI CHICKEN MANDI (FAMILY PACK: 4-5 PERSON)", price: 37.99 },
          { name: "CHICKEN FAHAM MANDI (FAMILY PACK: 4-5 PERSON)", price: 39.99 },
          { name: "LAMB MANDI-SPICY (FAMILY PACK: 4-5 PERSON)", price: 54.99 },
          { name: "MIX MANDI (FAMILY PACK: 4-5 PERSON) lamb/chicken/fish", price: 54.99 },
          { name: "MIX GRILL MANDI (FAMILY PACK: 4-5 PERSON)", price: 59.99 },
          { name: "YAMANI ZURBIAN MANDI/PARDA MANDI(FAMILY PACK: 4-5 PERSON)", price: 59.99 },
          { name: "CHICKEN MANDI (JUMBO PACK: 7-8 PERSON)", price: 69.99 },
          { name: "MIX GRILL MANDI (JUMBO PACK: 7-8 PERSON)", price: 89.99 },
          { name: "MIX MANDI (JUMBO PACK: 7-8 PERSON)", price: 89.99 },
          { name: "LAMB MANDI (JUMBO PACK: 7-8 PERSON)", price: 99.99 },
          { name: "SPICY LAMB MANDI (JUMBO PACK: 7-8 PERSON)", price: 99.99 }
      ],
      "GRILL-TANDOORI": [
          { name: "TANDOORI CHICKEN (HALF)", price: 6.99 },
          { name: "TANDOORI CHICKEN (FULL)", price: 11.99 },
          { name: "SHEEKH KEBAB (4 pcs)", price: 7.99 },
          { name: "CHICKEN TIKKA (6 pcs)", price: 7.99 },
          { name: "CHICKEN MALAI TIKKA (6 pcs)", price: 7.99 },
          { name: "CHICKEN WINGS (8 pcs)", price: 7.99 },
          { name: "SHEEKH KEBAB", price: 7.99 },
          { name: "AKBARI LAMB CHOPS (4)", price: 11.99 },
          { name: "FISH TIKKA", price: 9.99 },
          { name: "MIX GRILL PLATTER", price: 39.99 }
      ],
      "NON-VEG MAIN COURSE": [
          { name: "CHICKEN CURRY", price: 7.99 },
          { name: "ANDHRA KODI VEPUDU", price: 7.99 },
          { name: "KEEMA MUTTER", price: 8.99 },
          { name: "PALAK GOSHT", price: 8.99 },
          { name: "BUTTER CHICKEN", price: 8.99 },
          { name: "CHICKEN TIKKA MASALA", price: 8.99 },
          { name: "LAMB CURRY", price: 9.99 },
          { name: "KALI MIRCH GOSHT", price: 9.99 },
          { name: "FISH/PRAWN CURRY", price: 11.99 },
          { name: "CHICKEN KARAHI (½ KG)", price: 19.99 },
          { name: "CHICKEN KARAHI (1 KG)", price: 31.99 },
          { name: "LAMB KARAHI (½ KG)", price: 24.99 },
          { name: "LAMB KARAHI (1 KG)", price: 44.99 }
      ],
      "VEG MAIN COURSE": [
          { name: "CHANA MASALA", price: 6.99 }
      ],
      "NON-VEG STARTERS": [
          { name: "CHICKEN 65 (FAMOUS HYDERABADI SPECIALTY)", price: 8.99 },
          { name: "CHILLI CHICKEN", price: 8.99 },
          { name: "PEPPER CHICKEN", price: 8.99 },
          { name: "CHICKEN MANCHURIAN (DRY)", price: 8.99 },
          { name: "CHICKEN MANCHURIAN (GRAVY)", price: 9.99 },
          { name: "CHICKEN LOLLIPOP (5 PCS)", price: 8.99 },
          { name: "FISH PAKORA", price: 9.99 },
          { name: "APOLLO FISH", price: 9.99 },
          { name: "HALEEM", price: 11.99 },
          { name: "MASALA FISH (2 pcs)", price: 11.99 },
          { name: "CHILLI GARLIC PRAWNS", price: 11.99 },
          { name: "GOLDEN FRIED PRAWNS", price: 11.99 }
      ],
      "VEG STARTERS": [
          { name: "VEG SAMOSA (3 PCS)", price: 3.99 },
          { name: "SPRING ROLL (3 PCS)", price: 3.99 },
          { name: "VEG MANCHURIAN (DRY)", price: 8.99 },
          { name: "VEG MANCHURIAN (GRAVY)", price: 9.99 },
          { name: "CHILLI PANEER", price: 9.99 },
          { name: "PANEER 65", price: 9.99 },
          { name: "PANEER TIKKA", price: 9.99 }
      ],
      "ROLLS": [
          { name: "CHICKEN TIKKA ROLL", price: 6.99 },
          { name: "SEEKH KEBAB ROLL", price: 6.99 },
          { name: "PANEER TIKKA ROLL", price: 8.99 }
      ],
      "CHINESE": [ // Merged Noodles/Fried Rice into one
          { name: "VEG NOODLES", price: 7.99 },
          { name: "CHICKEN NOODLES", price: 8.99 },
          { name: "EGG (or) VEG FRIED RICE", price: 7.99 },
          { name: "CHICKEN FRIED RICE", price: 8.99 }
      ],
      "DESSERTS": [
          { name: "KHEER", price: 4.99 },
          { name: "GULAB JAMUN", price: 4.99 },
          { name: "OUBANI KA METHA", price: 4.99 },
          { name: "APRICOT DELIGHT", price: 5.99 },
          { name: "MANGO DELIGHT", price: 5.99 },
          { name: "KUNFAHAH", price: 6.99 }
      ],
      "LASSI": [
          { name: "LASSI SWEET OR SALT (GLASS)", price: 2.49 },
          { name: "LASSI SWEET OR SALT (JUG)", price: 7.99 },
          { name: "MANGO LASSI (GLASS)", price: 2.99 },
          { name: "MANGO LASSI (JUG)", price: 9.99 }
      ],
      "COLD DRINKS": [
          { name: "WATER small", price: 1.00 },
          { name: "WATER Big", price: 2.99 },
          { name: "SOFT DRINK (CAN) coke/pepsi/fanta/sprite", price: 1.99 },
          { name: "SOFT DRINK (CAN) Thumbs UP/Zeera Soda", price: 2.50 },
          { name: "SOFT DRINK (BIG BOTTLE)", price: 5.99 },
          { name: "AL-HYDERABADI SPECIAL (SAUDI CHAMPAGNE)", price: 8.99 }
      ],
      "HOT DRINKS": [
          { name: "HYDERABADI KARAK CHAI", price: 2.50 },
          { name: "CARDAMOM TEA", price: 2.50 },
          { name: "COFFEE", price: 2.50 },
          { name: "SULEMANI BLACK TEA (POT)", price: 5.99 }
      ],
      "BUFFET": [
          { name: "ADULTS", price: 20.99 },
          { name: "KIDS (5-11)", price: 11.99 },
          { name: "KIDS Under 5", price: 0.00 } // Set price to 0.00 for FREE
      ]
  };

  // 🔁 Sync across tabs/windows
  useEffect(() => {
    const sync = (e) => {
      if (e.key === 'kotList') setKOTList(loadFromStorage(e.key, []));
      if (e.key === 'orderHistory') setOrderHistory(loadFromStorage(e.key, []));
      if (e.key === 'tableStatuses') setTableStatuses(loadFromStorage(e.key, initialTableStatuses));
      if (e.key === 'onlineOrders') setOnlineOrders(loadFromStorage(e.key, []));
      if (e.key === 'user') setUser(loadFromStorage(e.key, null));
      if (e.key === 'role') setRole(e.newValue);
    };
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);

  // --- USER FUNCTIONS ---
  const login = (username, role) => {
    const u = { username, role };
    setUser(u); setRole(role);
    localStorage.setItem('user', JSON.stringify(u));
    localStorage.setItem('role', role);
  };

  const logout = () => {
    setUser(null); setRole(null); setTable(null);
    setOrders([]);

    localStorage.removeItem('user');
    localStorage.removeItem('role');
    localStorage.removeItem('table');
  };

  // --- TABLE FUNCTIONS ---
  const updateTableStatus = (roomName, tableId, status) => {
    setTableStatuses(prev => {
      const updated = { ...prev, [roomName]: { ...prev[roomName], [tableId]: status } };
      localStorage.setItem('tableStatuses', JSON.stringify(updated));
      return updated;
    });
  };

  const selectTable = (roomName, tableId) => {
    const combinedId = `${roomName} - ${tableId}`;
    setTable(combinedId);
    localStorage.setItem('table', combinedId);
  };

  // --- INVENTORY FUNCTIONS ---
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

  // --- ORDER/KOT FUNCTIONS ---
  const addOrderToKOT = (tableDisplayId, items, placedBy) => {
    const newOrder = {
      id: Date.now(), table: tableDisplayId, items: items.map(i => ({ name: i.name, quantity: i.quantity, price: i.price })), placedBy, time: new Date().toLocaleTimeString(), status: 'Pending'
    };

    deductStock(items);
    const [roomName, tableId] = tableDisplayId.split(' - ');
    if (roomName && tableId) { updateTableStatus(roomName, tableId, 'Occupied'); }

    setKOTList(prev => {
      const updated = [...prev, newOrder];
      localStorage.setItem('kotList', JSON.stringify(updated));
      return updated;
    });
    setOrderHistory(prev => {
      const exists = prev.find(o => o.id === newOrder.id);
      const updated = exists ? prev : [...prev, newOrder];
      localStorage.setItem('orderHistory', JSON.stringify(updated));
      return updated;
    });
  };

  // ✅ THIS FUNCTION IS THE SOURCE OF THE BUG
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

  // --- ONLINE ORDER FUNCTIONS ---
  const addOnlineOrder = (items, customerName) => {
    const newOrder = {
      id: Date.now(), items, placedBy: customerName, time: new Date().toLocaleTimeString(), status: 'Pending'
    };
    setOnlineOrders(prev => {
      const updated = [...prev, newOrder];
      localStorage.setItem('onlineOrders', JSON.stringify(updated));
      return updated;
    });
  };

  const updateOnlineOrderStatus = (orderId, newStatus) => {
    setOnlineOrders(prev => {
      const updated = prev.map(order =>
        order.id === orderId ? { ...order, status: newStatus } : order
      );
      localStorage.setItem('onlineOrders', JSON.stringify(updated));
      return updated;
    });
  };


  // --- CONTEXT PROVIDER VALUE (FINAL FIX) ---
  return (
    <UserContext.Provider
      value={{
        user, role, table, setTable, orders, setOrders,
        menu, login, logout,
        tableStatuses, updateTableStatus, selectTable,
        kotList, setKOTList: setAndPersistKOTList,
        addOrderToKOT,
        // ✅ CRITICAL FIX: Include the function here
        updateKOTStatus,
        stock, setStock, ingredientMap, deductStock,
        recordRestock, restockHistory,
        generateStockReport,
        orderHistory, archiveOrder, archiveOrders,
        onlineOrders, addOnlineOrder, updateOnlineOrderStatus,
        ROOM_NAMES
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);