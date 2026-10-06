import PageTitle from "@/components/ui/PageTitle";
import prisma from "@/index";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import ModifyStoreForm from "./_components/ModifyStoreForm";

const ModifyStore = async () => {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return redirect("/auth/login");
  }

  const seller = await prisma.seller.findFirst({
    where: {
      OR: [
        { id: session.user.id },
        { phone: session.user.phone || undefined },
        { email: session.user.email || undefined },
      ],
    },
  });

  const storeInformation = await prisma.store.findFirst({
    where: {
      sellerId: seller?.id,
    },
  });

  return (
    <div className="p-8">
      <PageTitle title="Modify your store" />
      <ModifyStoreForm storeInformation={storeInformation} />
    </div>
  );
};

export default ModifyStore;
