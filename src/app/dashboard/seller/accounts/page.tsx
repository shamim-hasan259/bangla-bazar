import PageTitle from "@/components/ui/PageTitle";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger,
} from "@/components/ui/menubar";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowLeftRight,
  BadgeCheck,
  CircleDollarSign,
  File,
  PencilRuler,
} from "lucide-react";
import prisma from "@/index";
import AccountsMain from "./AccountsMain";

export default async function ProductsPage() {
  // TODO: Date range filtered data need to Added.
  const data: any = await prisma?.transactions?.findMany(); //

  return (
    <main className="flex min-h-screen flex-col gap-6 w-full">
      <div className=" flex-col flex w-full">
        <div className="flex-1 space-y-4 p-8 pt-6">
          <div className="flex items-center justify-between space-y-2">
            <PageTitle title="Accounts" />
            <div className="flex items-center space-x-2">
              <Menubar>
                <MenubarMenu>
                  <MenubarTrigger>
                    <File className="mr-2 h-3 w-3" />{" "}
                    <Link href="/dashboard/accounts-head">Accounts Head </Link>
                  </MenubarTrigger>
                </MenubarMenu>
                <MenubarMenu>
                  <MenubarTrigger>
                    <BadgeCheck className="mr-2 h-3 w-3" /> Jurnal
                  </MenubarTrigger>
                </MenubarMenu>
                <MenubarMenu>
                  <MenubarTrigger>
                    <PencilRuler className="mr-2 h-3 w-3" /> Ledger
                  </MenubarTrigger>
                  <MenubarContent>
                    <MenubarItem>Customer Ledger</MenubarItem>
                    <MenubarItem>Ledger</MenubarItem>
                  </MenubarContent>
                </MenubarMenu>
                <MenubarMenu>
                  <MenubarTrigger>
                    <PencilRuler className="mr-2 h-3 w-3" /> Assets List
                  </MenubarTrigger>
                  <MenubarContent>
                    <MenubarItem>All Assets</MenubarItem>
                    <MenubarItem>Create New</MenubarItem>
                  </MenubarContent>
                </MenubarMenu>
              </Menubar>
              <Link href="/dashboard/accounts/collection">
                <Button>
                  <CircleDollarSign className="mr-2 h-4 w-4" /> Collection
                </Button>
              </Link>
              <Link href="/dashboard/accounts/expences">
                <Button>
                  <ArrowLeftRight className="mr-2 h-4 w-4" /> Expense
                </Button>
              </Link>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-1">
            <AccountsMain />
          </div>
        </div>
      </div>
    </main>
  );
}
