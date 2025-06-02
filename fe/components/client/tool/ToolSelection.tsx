// app/tools/components/ToolSelection.tsx
"use client";

import React from "react";
import { Card, CardBody, CardHeader, Button, Spinner } from "@nextui-org/react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

import { GetAllTool } from "@/api/tool";

// const tools = [
//   {
//     id: "tool-1",
//     name: "Tool A",
//     description: "This is a powerful tool for XYZ",
//     price: 100000,
//   },
//   {
//     id: "tool-2",
//     name: "Tool B",
//     description: "This tool helps you manage ABC",
//     price: 150000,
//   },
//   {
//     id: "tool-3",
//     name: "Tool C",
//     description: "Tool C is best for DEF",
//     price: 200000,
//   },
// ];

const ToolSelection: React.FC = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["tools"],
    queryFn: GetAllTool,
  });
  console.log(data?.data?.data);
  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <Spinner color="primary" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex justify-center py-10">
        <p className="text-red-500">Đã xảy ra lỗi khi tải dữ liệu.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-5xl py-10 px-4">
      <h1 className="mb-8 text-center text-3xl font-bold">
        Chọn Tool Bạn Muốn Thuê
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 justify-center">
        {data?.data?.data?.map((tool: any) => (
          <div key={tool?.id}>
            <Card className="shadow-md hover:shadow-xl transition-shadow">
              <CardHeader>
                <h3 className="text-lg font-semibold">{tool?.name}</h3>
              </CardHeader>
              <CardBody>
                {/* <p>{tool.description}</p> */}
                <p className="text-primary mt-2">
                  Giá: {tool.base_price.toLocaleString()} VNĐ
                </p>
                <Button
                  as={Link}
                  className="mt-4 w-full"
                  color="primary"
                  href={`/create-order?toolId=${tool.id}`}
                >
                  Thuê ngay
                </Button>
              </CardBody>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ToolSelection;
