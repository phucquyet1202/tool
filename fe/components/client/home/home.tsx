"use client";
import { Card, CardHeader, CardBody, Button } from "@nextui-org/react";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader className="text-xl font-bold">Live YouTube</CardHeader>
        <CardBody>
          <Link href="/youtube">
            <Button color="primary">Đi tới</Button>
          </Link>
        </CardBody>
      </Card>
      <Card>
        <CardHeader className="text-xl font-bold">Live Facebook</CardHeader>
        <CardBody>
          <Link href="/facebook">
            <Button color="primary">Đi tới</Button>
          </Link>
        </CardBody>
      </Card>
    </div>
  );
}
