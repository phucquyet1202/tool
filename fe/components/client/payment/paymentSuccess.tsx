"use client";

import React from "react";
import { Card, CardBody, Spacer } from "@nextui-org/react";
import PaymentStatus from "./PaymentStatus";
import PaymentInfo from "./PaymentInfo";

export default function PaymentSuccessPage() {
  return (
    <div className="flex flex-col items-center justify-center p-6 min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Card className="max-w-md w-full">
        <CardBody className="flex flex-col items-center">
          <PaymentStatus status="success" />
          <Spacer y={2} />
          <PaymentInfo />
        </CardBody>
      </Card>
    </div>
  );
}
