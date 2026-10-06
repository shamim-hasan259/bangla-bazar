import PageTitle from "@/components/ui/PageTitle";
import { Button } from "@/components/ui/button";
import { UserDataTable } from "./data-table";
import { User, columns } from "./columns";
import CreateUserSheet from "./createUserSheet";
import prisma from "@/index";

export default async function UserPage() {
  const data: any = await prisma.user.findMany({
    select: {
      id: true, // Include the 'id' field
      name: true, // Include the 'name' field
      email: true, // Include the 'name' field
      username: true, // Include the 'name' field
      phone: true, // Include the 'name' field
      type: true, // Exclude the 'email' field
      status: true, // Exclude the 'email' field
    },
  });

  return (
    <main className="flex min-h-screen flex-col gap-6 w-full">
      <div className=" flex-col flex w-full">
        <div className="flex-1 space-y-4 p-8 pt-6">
          <div className="flex items-center justify-between space-y-2">
            <PageTitle title="Users" />
            <div className="flex items-center space-x-2">
              {/* <CalendarDateRangePicker /> */}
              <CreateUserSheet />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-1">
            <UserDataTable columns={columns} data={data} />
          </div>
        </div>
      </div>
    </main>
  );
}
