import PageTitle from "@/components/ui/PageTitle";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import TransactionForm from "./transactionForm";

export default async function ProductsPage() {
  return (
    <main className="flex min-h-screen flex-col gap-6 w-full">
      <div className=" flex-col flex w-full">
        <div className="flex-1 space-y-4 p-8 pt-6">
          <div className=" space-y-2">
            <div className="flex">
              <Link href="/dashboard/accounts">
                <Button variant="ghost">
                  <ArrowLeft />
                </Button>
              </Link>
              <PageTitle title="Expenses" />
            </div>
            <div className="flex items-center w-full  space-x-2">
              <TransactionForm />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-1">
            {/* <UserDataTable columns={columns} data={data} /> */}
          </div>
        </div>
      </div>
    </main>
  );
}
