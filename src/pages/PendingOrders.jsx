import React from "react";

const pendingOrders = [
  { table: 2, items: ["Fish Pakora", "Zeera Soda"], status: "Pending" },
  { table: 4, items: ["Butter Chicken", "Naan"], status: "Pending" },
];

const PendingOrders = () => {
  return (
    <div>
      <h2>Pending Orders</h2>
      {pendingOrders.map((order, index) => (
        <div key={index} className="pending-box">
          <h4>Table {order.table}</h4>
          <p><strong>Items:</strong> {order.items.join(", ")}</p>
          <p>Status: {order.status}</p>
        </div>
      ))}
    </div>
  );
};

export default PendingOrders;
