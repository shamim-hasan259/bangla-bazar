import PageTitle from "@/components/ui/PageTitle";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Plus, Undo2 } from "lucide-react";
import { getDeviceType } from "@/lib/deviceDetect";
import CalenderDateRangePicker from "@/components/ui/CalenderDateRangePicker";
import prisma from "@/index";
import { InVoiceWiseArticleSale } from "./data-table";
import { columns } from "./columns";
import { getInvoicesByDateRange } from "../_action";
import { DateRange } from "react-day-picker";
import React from "react";
import { endOfDay, startOfDay } from "date-fns";
import ArticleSaleMain from "./ArticleSale";
export default async function ArticleSale() {
  //  ("article-sale", articleSale);

  return (
    <main className="flex min-h-screen flex-col gap-6 w-full">
      <div className=" flex-col flex w-full">
        <ArticleSaleMain />
      </div>
    </main>
  );
}
