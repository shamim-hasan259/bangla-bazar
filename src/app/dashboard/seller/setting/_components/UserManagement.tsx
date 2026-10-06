import PageTitle from "@/components/ui/PageTitle";
import CreateUserSheet from "../users/createUserSheet";
import { UserDataTable } from "../users/data-table";
import { columns } from "../users/columns";
import prisma from "@/index";

const UserManagement = async () => {
  const data: any = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      username: true,
      phone: true,
      type: true,
      status: true,
    },
  });
  return (
    <main className="flex min-h-screen flex-col gap-6 w-full">
      <div className=" flex-col flex w-full">
        <div className="flex-1 space-y-4">
          <div className="flex items-center justify-between space-y-2">
            <PageTitle title="Users" />
            <div className="flex items-center space-x-2">
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
};

export default UserManagement;
