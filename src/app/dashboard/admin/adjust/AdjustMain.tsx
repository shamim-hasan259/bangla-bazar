"use client";
import PageTitle from "@/components/ui/PageTitle";
import { Button } from "@/components/ui/button";
import prisma from "@/index";
import { ArrowLeft, DownloadCloud } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { DateRange } from "react-day-picker";
import CSVDownload from "@/components/ui/CSVDownload";
import CalenderDateRangePicker from "@/components/ui/CalenderDateRangePicker";
import Loader from "@/components/ui/Loader";
import { UserDataTable } from "./data-table";
import { getAdjustByDate } from "./_action";
import { columns } from "./column";

function AdjustMain({}) {
  // const currentSaleId = window.location.pathname;
  // const routeParts = currentSaleId.split("/");
  // const id = routeParts[routeParts.length - 1];
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
        const adjust = await getAdjustByDate({ startDate, endDate });
        //  ("userLogsData", logs);
        setData(adjust);
        loaderClose();
      } catch (error) {
        console.error("Error fetching TPN:", error);
      }
    }

    fetchSale();
  }, [startDate, endDate]);

  "data", data;
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

export default AdjustMain;
