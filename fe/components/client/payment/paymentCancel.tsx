"use client";

import React from "react";
import { Card, CardBody, Spacer } from "@nextui-org/react";

import PaymentStatus from "./PaymentStatus";

export default function PaymentCancelPage() {
  return (
    <div className="flex flex-col items-center justify-center p-6 min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Card className="max-w-md w-full">
        <CardBody>
          <PaymentStatus status="failed" />
          <Spacer y={2} />
          <p className="text-center text-danger text-sm">
            Thanh toán đã bị hủy. Vui lòng thử lại hoặc liên hệ hỗ trợ nếu cần.
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
