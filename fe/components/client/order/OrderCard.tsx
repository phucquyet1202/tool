// app/components/OrderCard.tsx
"use client";
import React from "react";
import { Card, CardBody, Button } from "@nextui-org/react";
import Link from "next/link";

interface OrderCardProps {
  id: string;
  amount: number;
  paid: boolean;
}

const OrderCard: React.FC<OrderCardProps> = ({ id, amount, paid }) => {
  return (
    <Card className="mb-4">
      <CardBody>
        <div className="flex justify-between items-center">
          <div>
            <p>
              <strong>Mã đơn hàng:</strong> {id}
            </p>
            <p>
              <strong>Số tiền:</strong> {amount} VNĐ
            </p>
            <p>
              <strong>Trạng thái:</strong>{" "}
              {paid ? "Đã thanh toán" : "Chưa thanh toán"}
            </p>
          </div>
          <div>
            {paid ? (
              <Button color="success" isDisabled>
                Đã thanh toán
              </Button>
            ) : (
              <Link href={`/payment/${id}`}>
                <Button color="primary">Thanh toán</Button>
              </Link>
            )}
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default OrderCard;
