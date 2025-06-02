"use client";

import React, { useState } from "react";
import {
  Input,
  Button,
  Select,
  SelectItem,
  Textarea,
  Card,
  CardBody,
} from "@nextui-org/react";

const CreateOrderForm = () => {
  const [tool, setTool] = useState("");
  const [duration, setDuration] = useState("");
  const [price, setPrice] = useState("");
  const [note, setNote] = useState("");

  const handleSubmit = async () => {
    if (!tool || !duration || !price) {
      alert("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    const orderData = {
      tool,
      duration,
      price,
      note,
      status: "Chưa thanh toán",
    };

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      if (res.ok) {
        alert("Tạo đơn hàng thành công!");
        // Reset form
        setTool("");
        setDuration("");
        setPrice("");
        setNote("");
      } else {
        alert("Tạo đơn hàng thất bại!");
      }
    } catch (error) {
      console.error(error);
      alert("Lỗi kết nối server!");
    }
  };

  return (
    <div className="max-w-lg mx-auto py-8">
      <Card>
        <CardBody>
          <h1 className="text-2xl font-bold mb-4">
            Tạo đơn hàng thuê Tool Live
          </h1>
          <Select
            label="Chọn Tool"
            placeholder="Chọn Tool"
            selectedKeys={tool ? [tool] : []}
            onChange={(e) => setTool(e.target.value)}
          >
            <SelectItem key="Tool Live YouTube" value="Tool Live YouTube">
              Tool Live YouTube
            </SelectItem>
            <SelectItem key="Tool Live Facebook" value="Tool Live Facebook">
              Tool Live Facebook
            </SelectItem>
          </Select>

          <Input
            label="Thời gian thuê (ngày/giờ)"
            type="number"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="mt-4"
          />

          <Input
            label="Giá tiền thuê (VNĐ)"
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="mt-4"
          />

          <Textarea
            label="Ghi chú (tuỳ chọn)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="mt-4"
          />

          <Button color="primary" className="mt-6" onClick={handleSubmit}>
            Tạo đơn hàng
          </Button>
        </CardBody>
      </Card>
    </div>
  );
};

export default CreateOrderForm;
