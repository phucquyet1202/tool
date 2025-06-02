// app/orders/page.tsx
"use client";
import LoadingSpinner from "@/components/client/order/LoadingSpinner";
import OrdersList from "@/components/client/order/OrdersList";
import React, { useEffect, useState } from "react";

// Giả lập fetch API - bạn thay thế bằng API thật nhé!
const fetchOrders = async () => {
  // Giả lập delay 1 giây
  await new Promise((resolve) => setTimeout(resolve, 1000));
  // Dữ liệu mẫu
  return [
    { id: "order_001", amount: 50000, paid: false },
    { id: "order_002", amount: 100000, paid: true },
    { id: "order_003", amount: 75000, paid: false },
  ];
};

const OrdersPage = () => {
  const [orders, setOrders] = useState<
    { id: string; amount: number; paid: boolean }[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getOrders = async () => {
      const data = await fetchOrders();
      setOrders(data);
      setLoading(false);
    };
    getOrders();
  }, []);

  if (loading) return <LoadingSpinner />;

  return <OrdersList orders={orders} />;
};

export default OrdersPage;
