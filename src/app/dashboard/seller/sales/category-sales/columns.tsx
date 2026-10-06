"use client";

import { ColumnDef } from "@tanstack/react-table";

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type Order = {
  id: string;
  customerID: string;
  status: "Complete" | "Ordered" | "Delete";
  userID: string;
  offerID: string;
  Offer: string;
  Customer: string;
  Phone: string;
  amount: number;
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
    accessorKey: "categoryName",
    header: "Category",
  },
  {
    accessorKey: "categoryCode",
    header: "Code",
  },

  {
    accessorKey: "totalAmount",
    header: "Total",
  },
  {
    accessorKey: "totalQty",
    header: "Total Qty",
  },
  // {
  //   accessorKey: `"customer.name"`,
  //   header: "Customer",
  //   cell: ({ row }) => {
  //     //@ts-ignore
  //     const customer = row?.original?.customer;
  //     return customer.company !== null ? customer.company : customer?.name;
  //   },
  // },

  // {
  //   accessorKey: "parent.name",
  //   header: "Parent",
  // },
  // {
  //   accessorKey: "parent",
  //   header: () => <div>Total Iteam</div>,
  //   id: "parent",
  //   cell: ({ row }) => {
  //     const product = row.original;
  //     //@ts-ignore
  //     const totalItem = product?.masterProducts.length;
  //     //  ("categorySaleProducts", totalPrice);
  //     return <p>{totalItem}</p>;
  //   },
  // },
  // {
  //   accessorKey: "parent",
  //   header: () => <div>Total</div>,
  //   id: "parent",
  //   cell: ({ row }) => {
  //     const product = row.original;
  //     const totalPrice = product?.masterProducts.reduce(
  //       (accumulator, product) => {
  //         return accumulator + product.price;
  //       },
  //       0
  //     );
  //     //  ("categorySaleProducts", totalPrice);
  //     return <p>{totalPrice}</p>;
  //   },
  // },
  // {
  //   accessorKey: "action",
  //   header: () => <div className="">Action</div>,
  //   id: "actions",
  //   cell: ({ row }) => {
  //     const sales = row.original;
  //      ("category", sales);
  //     const dispatch = useDispatch();
  //     const router = useRouter();
  //     const [activate, setActive] = useState(false);
  //       ("category sale", sales);

  //     return (
  //       <>
  //         <Link href={`/dashboard/sales/category-sales/${sales.id}`}>
  //           <div className="flex cursor-pointer">
  //             <Eye size={16} className="mr-2" />
  //           </div>
  //         </Link>
  //       </>
  //     );
  //   },
  // },
];
