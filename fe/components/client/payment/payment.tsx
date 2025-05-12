"use client";
import { Button, Card, CardBody } from "@nextui-org/react";

export default function PaymentPage() {
  const handlePayment = async () => {
    // Tích hợp PayOS ở đây
    alert("Thanh toán qua PayOS");
  };

  return (
    <div className="flex justify-center items-center min-h-screen">
      <Card className="w-[350px]">
        <CardBody className="space-y-4 text-center">
          <h2 className="text-xl font-bold">Thanh toán</h2>
          <Button color="success" onClick={handlePayment} fullWidth>
            Thanh toán với PayOS
          </Button>
        </CardBody>
      </Card>
    </div>
  );
}
