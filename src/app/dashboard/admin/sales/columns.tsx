"use client";

import { ColumnDef } from "@tanstack/react-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  ArrowUpDown,
  Check,
  MoreHorizontal,
  Pencil,
  Printer,
  Trash,
  Undo2,
  X,
} from "lucide-react";
import { useState } from "react";
import { SalePrintLog } from "@/components/ui/sell-print-pop";
import { TaxInvoicePrint } from "@/components/ui/govt-format-invoice-sale";

import { UpdateSaleStatus, salesById } from "./_action";
import StatusUpdatePop from "@/components/StatusUpdatePop";
import { useDispatch } from "react-redux";
import {
  setReturnActive,
  setSalesForUpdate,
} from "@/app/redux-store/Slice/SalesSlice";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type Order = {
  id: string;
  invoiceId: string;
  status: "Complete" | "Ordered" | "Delete";
  customer: any;
  user: any;
  grossTotalRound: number;
  date: string;
};

export const columns: ColumnDef<Order>[] = [
  {
    accessorKey: "no",
    header: "#",
    cell: ({ row }: { row: any }) => {
      const sl = row.index + 1; // row.index gives the zero-based index, add 1 to make it 1-based

      return `${sl}.`;
    },
  },
  {
    accessorKey: "invoiceId",
    header: "Invoice ID",
  },

  {
    accessorKey: "user.name",
    header: "Biller",
  },
  {
    accessorKey: "customer.name",
    header: "Customer",
    cell: ({ row }) => {
      //@ts-ignore
      const customer = row?.original?.customer;
      return customer.company !== null ? customer.company : customer?.name;
    },
  },
  {
    accessorKey: "customer.phone",
    header: "Phone",
  },
  {
    accessorKey: "grossTotalRound",
    header: "Gross Total",
  },
  {
    accessorKey: "status",
    header: "Status",
  },
  {
    accessorKey: "createdAt",
    header: "Date",
  },
  {
    accessorKey: "action",
    header: () => <div className="">Action</div>,
    id: "actions",
    cell: ({ row }) => {
      const sales = row.original;
      const dispatch = useDispatch();
      const router = useRouter();
      const [activate, setActive] = useState(false);
      const [taxInvActive, setTaxInvActive] = useState(false);
      const [alertOpen, setAlertOpen] = useState(false);
      const [status, setStatus] = useState("");

      // Button Function
      const handleUpdate = (operation: string) => {
        setStatus(operation);
        setAlertOpen(true);
      };

      // Alert Function
      const updateStatus = async () => {
        setAlertOpen(false);
        const updateStatus = await UpdateSaleStatus(sales.id, status);
        //@ts-ignore
        if (updateStatus) {
          // tosst successfully updated
          toast.success("success");
        } else {
          // toast successfully failed
          ("failed");
        }
      };

      const returnSale = async () => {
        ("Return");
        try {
          const saleData = await salesById(sales.id);
          saleData;
          dispatch(setSalesForUpdate(saleData));
          router.push("/dashboard/sales/create-order");
        } catch (error) {
          error;
        }
      };

      return (
        <>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
              {sales.status !== "Complete" && (
                <>
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => handleUpdate("Complete")}
                  >
                    <Check size={16} className="mr-2" />
                    Complete
                  </DropdownMenuItem>

                  <Link href={`/dashboard/sales/${sales.id}`}>
                    <DropdownMenuItem
                      className="cursor-pointer"
                      // onClick={returnSale}
                      onClick={() => dispatch(setReturnActive(true))}
                    >
                      <Undo2 size={16} className="mr-2" />
                      Return
                    </DropdownMenuItem>
                  </Link>
                </>
              )}
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => setActive(true)}
              >
                <Printer size={16} className="mr-2" /> Invoice
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => setTaxInvActive(true)}
              >
                <Printer size={16} className="mr-2" />
                Tax Invoice
              </DropdownMenuItem>
              {sales.status !== "Complete" && (
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => handleUpdate("Delete")}
                >
                  <X size={16} className="mr-2" />
                  Cancel
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          <StatusUpdatePop
            alertOpen={alertOpen}
            setAlertOpen={setAlertOpen}
            updateStatus={updateStatus}
            model="Sales"
            operation={status}
          />
          <SalePrintLog open={activate} setOpen={setActive} id={sales?.id} />
          <TaxInvoicePrint
            open={taxInvActive}
            setOpen={setTaxInvActive}
            entry={sales}
          />
        </>
      );
    },
  },
];
