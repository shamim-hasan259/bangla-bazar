"use client";
import PageTitle from "@/components/ui/PageTitle";
import { Button } from "@/components/ui/button";
import prisma from "@/index";
import { ArrowLeft, DownloadCloud } from "lucide-react";
import Link from "next/link";
import { columns } from "./columns";
import React, { useEffect, useState } from "react";
import { DateRange } from "react-day-picker";
import CSVDownload from "@/components/ui/CSVDownload";
import { UserDataTable } from "./data-table";
import CalenderDateRangePicker from "@/components/ui/CalenderDateRangePicker";
import {
  getSaleByDate,
  getUniqueArticleCodeData,
  getUniqueArticlesWithDetails,
  getUniqueArticlesWithTotalQty,
} from "./_action";
import Loader from "@/components/ui/Loader";

function SaleList({}) {
  const [data, setData] = useState([]);
  const [loader, setLoader] = useState(false);
  const loaderClose = () => setLoader(false);
  const loaderShow = () => setLoader(true);
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: new Date(),
    to: new Date(),
  });

  // TODO : Date Range filtering functionality Added but not WOkring properly.

  const startDate = date?.from || new Date();
  const endDate = date?.to || new Date();

  useEffect(() => {
    async function fetchSale() {
      const startDate = new Date(date?.from);
      const endDate = new Date(date?.to);

      try {
        loaderShow();
        const sale = await getSaleByDate({ startDate, endDate });
        // const product = await getUniqueArticlesWithDetails();
        //  ("userLogsData", product);
        setData(sale);
        loaderClose();
      } catch (error) {
        console.error("Error fetching Sale:", error);
      }
    }

    fetchSale();
  }, [startDate, endDate]);

  return (
    <>
      <UserDataTable
        columns={columns}
        data={data}
        date={date}
        setDate={setDate}
      />
      <Loader isOpen={loader} onClose={setLoader} title="Please Wait" />
    </>
  );
}

export default SaleList;
