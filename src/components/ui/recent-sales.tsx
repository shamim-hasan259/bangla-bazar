"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import prisma from "@/index";

export default function RecentSales(data: any) {
  // const recentOrder:any = []
  // await prisma.order.findMany({
  //   orderBy: {
  //     createdAt: "desc",
  //   },
  //   take: 5,

  //   select: {
  //     id: true,
  //     amount: true,
  //     Customer: {
  //       select: {
  //         name: true,
  //         phone: true,
  //       },
  //     },
  //   },
  // });
  //  ("data", data.data);
  return (
    <div className="space-y-8">
      {data && Array.isArray(data?.data) &&
        data?.data?.map((order: any) => {
          return (
            <div className="flex items-center" key={order.id}>
              <Avatar className="h-9 w-9">
                <AvatarImage src="https://github.com/shadcn.png" alt="Avatar" />
                <AvatarFallback>{order.customer?.name?.[0] || "?"}</AvatarFallback>
              </Avatar>
              <div className="ml-4 space-y-1">
                <p className="text-sm font-medium leading-none">
                  {order.customer?.name || "Unknown Customer"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {order.customer?.phone || "No Phone"}
                </p>
              </div>
              <div className="ml-auto font-medium">
                {order.total.toLocaleString("en-IN", {
                  maximumFractionDigits: 0,
                })}{" "}
                ৳
              </div>
            </div>
          );
        })}
    </div>
  );
}
