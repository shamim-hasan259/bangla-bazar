"use client";
import PageTitle from "@/components/ui/PageTitle";
import React, { useEffect, useState } from "react";
import CalenderDateRangePicker from "@/components/ui/CalenderDateRangePicker";
import { UserLogsDataTable } from "./data-table";
import { columns } from "./columns";
import { getUserLogsByDate } from "../users/_action";
import Loader from "@/components/ui/Loader";

export default function UserLogsMain() {
  const [userLogs, setUserLogs] = useState([]);
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
        const logs = await getUserLogsByDate({ startDate, endDate });
        "userLogsData", logs;
        setUserLogs(logs);
        loaderClose();
      } catch (error) {
        console.error("Error fetching user logs:", error);
      }
    }

    fetchUserLogs();
  }, [date]);

  "userLogs", date;

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <PageTitle title="User logs" />
        <div className="flex items-center space-x-2">
          <CalenderDateRangePicker date={date} setDate={setDate} />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-1">
        <UserLogsDataTable columns={columns} data={userLogs} />
        <Loader isOpen={loader} onClose={setLoader} title="Please Wait" />
      </div>
    </div>
  );
}
