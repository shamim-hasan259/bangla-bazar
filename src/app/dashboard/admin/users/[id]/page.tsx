import PageTitle from "@/components/ui/PageTitle";
import prisma from "@/index";
import UserFormEdit from "../userFormEdit";

async function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await prisma.user.findFirst({
    where: { id },
    select: {
      id: true,
      name: true,
      username: true,
      email: true,
      phone: true,
      type: true,
      status: true,
    },
  });
  // const {id,name,username, email,phone,type,status} =user

  return (
    <main className="flex min-h-screen flex-col gap-6 w-full">
      <div className=" flex-col flex w-full">
        <div className="flex-1 space-y-4 p-8 pt-6">
          <div className="flex items-center justify-between space-y-2">
            <PageTitle title="Edit User" />
            <div className="flex items-center space-x-2">
              {/* <CalendarDateRangePicker /> */}
            </div>
          </div>
          <div className="flex justify-center">
            <div className="w-1/3">
              <UserFormEdit user={user} />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default EditUserPage;
