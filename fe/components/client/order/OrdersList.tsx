// app/components/OrdersList.tsx
"use client";
import React from "react";
import OrderCard from "./OrderCard";

interface OrdersListProps {
  orders: { id: string; amount: number; paid: boolean }[];
}

const OrdersList: React.FC<OrdersListProps> = ({ orders }) => {
  return (
    <div className="max-w-3xl mx-auto mt-8">
      <h1 className="text-2xl font-bold mb-4">Danh sách đơn hàng</h1>
      {orders.map((order) => (
        <OrderCard
          key={order.id}
          id={order.id}
          amount={order.amount}
          paid={order.paid}
        />
      ))}
    </div>
  );
};

export default OrdersList;
