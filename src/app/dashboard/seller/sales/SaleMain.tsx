"use client";
import PageTitle from "@/components/ui/PageTitle";
import { Button } from "@/components/ui/button";
import prisma from "@/index";
import {
  Archive,
  ArrowLeft,
  BadgeCheck,
  DownloadCloud,
  Plus,
} from "lucide-react";
import Link from "next/link";
import { columns } from "./columns";
import React, { useEffect, useState } from "react";
import { DateRange } from "react-day-picker";
import CSVDownload from "@/components/ui/CSVDownload";
import { Menubar, MenubarMenu, MenubarTrigger } from "@/components/ui/menubar";
import { getSaleByDateRange } from "./_action";
import { UserDataTable } from "./data-table";

function SaleMain({}) {
  // const currentSaleId = window.location.pathname;
  // const routeParts = currentSaleId.split("/");
  // const id = routeParts[routeParts.length - 1];
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: new Date(),
    to: new Date(),
  });

  const startDate = date?.from || new Date();
  const endDate = date?.to || new Date();

  const [saleData, setSaleData] = useState([]);
  //   const [categorySaleData, setCategorySale] = useState([]);

  useEffect(() => {
    async function fetchData() {
      const data = await getSaleByDateRange({ startDate, endDate });
      setSaleData(data);
    }
    fetchData();
  }, [startDate, endDate]);

  //  ("article-sale", categorySaleData);
  const fieldsToInclude = [
    "id",
    "invoiceId",
    "userId",
    "customerId",
    "totalItem",
    "total",
    "grossTotalRound",
    "totalRecieved",
    "changeAmount",
    "createdAt",
    "updatedAt",
    "status",
  ];

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <PageTitle title="Sales" />
        <div className="flex items-center space-x-2">
          <Menubar>
            <MenubarMenu>
              <MenubarTrigger>
                <BadgeCheck className="mr-2 h-3 w-3" />
                <Link href="/dashboard/sales/article-sales">
                  {" "}
                  Article Sale{" "}
                </Link>
              </MenubarTrigger>
            </MenubarMenu>
            <MenubarMenu>
              <MenubarTrigger>
                <Archive className="mr-2 h-3 w-3" />{" "}
                <Link href="/dashboard/sales/category-sales">
                  Category Sale
                </Link>
              </MenubarTrigger>
            </MenubarMenu>
          </Menubar>

          <Link href="/dashboard/sales/create-order">
            <Button className="mr-2">
              <Plus className="mr-2 h-4 w-4" /> Create Order
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-1">
        {
          //@ts-ignore
          <UserDataTable
            date={date}
            setDate={setDate}
            columns={columns}
            data={saleData}
          />
        }
      </div>
    </div>
  );
}

export default SaleMain;
