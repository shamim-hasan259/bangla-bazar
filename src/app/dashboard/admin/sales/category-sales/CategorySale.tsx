"use client";
import PageTitle from "@/components/ui/PageTitle";
import { Button } from "@/components/ui/button";
import prisma from "@/index";
import { ArrowLeft, DownloadCloud } from "lucide-react";
import Link from "next/link";
import { columns } from "./columns";
import {
  articleSaledata,
  categorySaleData,
  getInvoicesByDateRange,
  getSaleByDate,
  getSalesReportByCategory,
} from "../_action";
import React, { useEffect, useState } from "react";
import { DateRange } from "react-day-picker";
import CSVDownload from "@/components/ui/CSVDownload";
import { endOfDay, startOfDay } from "date-fns";
import { UserDataTable } from "./data-table";
import Loader from "@/components/ui/Loader";

function CategorySale({}) {
  const currentSaleId = window.location.pathname;
  const routeParts = currentSaleId.split("/");
  const id = routeParts[routeParts.length - 1];
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: new Date(),
    to: new Date(),
  });
  const [loader, setLoader] = useState(false);
  const loaderClose = () => setLoader(false);
  const loaderShow = () => setLoader(true);

  // TODO : Date Range filtering functionality Added but not WOkring properly.

  const startDate = new Date(date?.from);
  const endDate = new Date(date?.to);

  const [articleSaleData, setArticleSale] = useState([]);
  const [catData, setCatData] = useState([]);

  useEffect(() => {
    async function fetchData() {
      loaderShow();
      const data = await categorySaleData({ startDate, endDate });
      setCatData(data);
      loaderClose();
    }
    fetchData();
  }, [date]);

  //  ("article-sale", categorySaleData);
  const fieldsToInclude = [
    "articleCode",
    "name",
    "price",
    "tp",
    "qty",
    "total",
    "createdAt",
    "updatedAt",
    "status",
  ];

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div className="flex items-center">
          <Link href="/dashboard/sales">
            <Button variant="ghost">
              <ArrowLeft />
            </Button>
          </Link>
          <PageTitle title="Category Sale" />
        </div>

        <CSVDownload
          data={articleSaleData}
          filename={`artice_sales_data_${startDate}.csv`}
          fields={fieldsToInclude}
        >
          {/* <Button>
                  <DownloadCloud className="mr-2 h-4 w-4" /> Export
                </Button> */}
        </CSVDownload>
      </div>

      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-1">
        {/* <InVoiceWiseArticleSale date={date} setDate={setDate} columns={columns} data={data} /> */}
        <UserDataTable
          date={date}
          setDate={setDate}
          columns={columns}
          data={catData}
        />
        <Loader isOpen={loader} onClose={setLoader} title="Please Wait" />
      </div>
    </div>
  );
}

export default CategorySale;
