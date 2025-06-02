"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
// import { Text } from "@nextui-org/react";

const PaymentInfo: React.FC = () => {
  const searchParams = useSearchParams();
  const [orderCode, setOrderCode] = useState<string | null>(null);

  useEffect(() => {
    const code = searchParams.get("orderCode");
    setOrderCode(code);
  }, [searchParams]);

  return (
    <div className="text-center">
      <p className="text-sm text-gray-600">
        Cảm ơn bạn đã thanh toán. Đơn hàng của bạn sẽ được xử lý sớm nhất.
      </p>
      {orderCode && (
        <p className="text-sm text-gray-500 mt-2">
          Mã giao dịch: <span className="font-mono">{orderCode}</span>
        </p>
      )}
    </div>
  );
};

export default PaymentInfo;
