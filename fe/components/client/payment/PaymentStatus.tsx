"use client";

import React from "react";
import { CheckCircle, XCircle } from "lucide-react";
// import { Text } from "@nextui-org/react";

type Props = {
  status: "success" | "failed";
};

const PaymentStatus: React.FC<Props> = ({ status }) => {
  return (
    <div className="flex flex-col items-center">
      {status === "success" ? (
        <>
          <CheckCircle className="w-16 h-16 text-success" />
          <span className="text-success text-lg font-semibold mt-2">
            Thanh toán thành công!
          </span>
        </>
      ) : (
        <>
          <XCircle className="w-16 h-16 text-danger" />
          <span className="text-danger text-lg font-semibold mt-2">
            Thanh toán thất bại!
          </span>
        </>
      )}
    </div>
  );
};

export default PaymentStatus;
