"use client";
import PageTitle from "@/components/ui/PageTitle";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Square, X, CheckSquare, CheckSquare2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  reset,
  resetProducts,
  resetReturnProducts,
  setBillActive,
  setReturnActive,
  setSalesForUpdate,
  setStatus,
} from "@/app/redux-store/Slice/SalesSlice";
import { RootState } from "@/app/redux-store/store";
import { salesById } from "../_action";
import UpdateOrderForm from "./updateOrderForm";
import { useRouter } from "next/navigation";

export default function ProductsPage() {
  const saleData = useSelector((state: any) => state.sales);
  const dispatch = useDispatch();
  const router = useRouter();
  // const [returnActive, setReturnActive] = useState(false);

  // const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   setReturnActive(e.target.checked);
  // };
  const handleReturnActive = () => {
    dispatch(setReturnActive(!saleData.returnActive));
    dispatch(resetProducts());
    if (saleData.returnActive === false) {
      dispatch(resetReturnProducts());
    }
  };
  const currentSaleId = window.location.pathname;
  const routeParts = currentSaleId.split("/");
  const id = routeParts[routeParts.length - 1];

  //  ("Current Route:", saleData);
  // const [salesData, setSalesData] = useState(null);
  useEffect(() => {
    const fetchSalesData = async () => {
      try {
        const data = await salesById(id);
        dispatch(setSalesForUpdate(data));
      } catch (error) {
        console.error("Error fetching sales data:", error);
      }
    };

    fetchSalesData();
  }, [id]);

  const handleResetForm = () => {
    dispatch(reset());
    router.push("/dashboard/sales");
  };
  //  ("Sales:", salesData);

  return (
    <main className="flex min-h-screen flex-col gap-0 w-full">
      <div className="flex-col flex w-full">
        <div className="flex-1 space-y-4 p-4 ">
          <div className="flex items-center justify-between space-y-2">
            <div className="flex">
              <Link href="/dashboard/sales">
                <Button variant="ghost">
                  <ArrowLeft />
                </Button>
              </Link>
              <PageTitle title="Update Order" />
            </div>

            <div className="flex items-center space-x-2">
              <Button className="ml-4" onClick={handleResetForm}>
                <X className="mr-2 h-4 w-4" /> Cancel
              </Button>
            </div>
          </div>
        </div>
      </div>
      <div className="grid gap-0 md:grid-cols-1 lg:grid-cols-1">
        <UpdateOrderForm />
      </div>
    </main>
  );
}
