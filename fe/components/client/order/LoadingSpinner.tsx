// app/components/LoadingSpinner.tsx
"use client";
import React from "react";
import { Spinner } from "@nextui-org/react";

const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-[300px]">
    <Spinner color="primary" label="Đang tải đơn hàng..." />
  </div>
);

export default LoadingSpinner;
