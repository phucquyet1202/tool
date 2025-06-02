"use client";

import React from "react";
import { Card, CardBody, Button } from "@nextui-org/react";

export default function PaymentPage() {
  // Đây chỉ là ví dụ, bạn có thể thêm form hoặc QR code ở đây.
  return (
    <div className="flex flex-col items-center justify-center p-6 min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Card className="max-w-md w-full">
        <CardBody className="flex flex-col items-center">
          <h2 className="text-xl font-semibold mb-4">Thanh toán đơn hàng</h2>
          <Button color="primary" size="lg">
            Tạo QR Thanh Toán
          </Button>
        </CardBody>
      </Card>
    </div>
  );
}
