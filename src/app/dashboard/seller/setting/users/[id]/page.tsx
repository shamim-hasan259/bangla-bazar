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

  return (
    <div className="p-8 space-y-6">
      <PageTitle title="Edit User" />
      <UserFormEdit user={user} />
    </div>
  );
}

export default EditUserPage;
