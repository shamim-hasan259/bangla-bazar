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
import CalenderDateRangePicker from "@/components/ui/CalenderDateRangePicker";
import Loader from "@/components/ui/Loader";
import { DamageDataTable } from "./data-table";
import { getDamageByDate } from "./_action";

function DamageMain({}) {
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
        const damage = await getDamageByDate({ startDate, endDate });
        //  ("userLogsData", logs);
        setData(damage);
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
      <DamageDataTable
        columns={columns}
        data={data}
        date={date}
        setDate={setDate}
      />
      <Loader isOpen={loader} onClose={setLoader} title="Please Wait" />
    </>
  );
}

export default DamageMain;
