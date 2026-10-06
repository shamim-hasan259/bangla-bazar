"use client";
import { useEffect, useState } from "react";
import { columns } from "./columns";
import { UserDataTable } from "./data-table";
import { getTransactionByDate } from "./_action";
import Loader from "@/components/ui/Loader";

export default function AccountsMain() {
  const [data, setData] = useState([]);
  const [date, setDate] = useState(new Date());
  const [loader, setLoader] = useState(false);
  const loaderClose = () => setLoader(false);
  const loaderShow = () => setLoader(true);

  useEffect(() => {
    async function fetchUserLogs() {
      const startDate = new Date(date?.from);
      const endDate = new Date(date?.to);

      try {
        loaderShow();
        const tdata = await getTransactionByDate({ startDate, endDate });
        //  ("userLogsData", tdata);
        setData(tdata);
        loaderClose();
      } catch (error) {
        console.error("Error fetching user logs:", error);
      }
    }

    fetchUserLogs();
  }, [date]);

  //  ("transactions", data);

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
