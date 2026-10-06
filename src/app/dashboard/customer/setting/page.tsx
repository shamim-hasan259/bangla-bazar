import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AccountSettingForm from "./_components/AccountSettingForm";
import BillingAddressForm from "./_components/BillingAddressForm";
import ChangePasswordForm from "./_components/ChangePasswordForm";
import ProfileImageUploader from "./_components/ProfileImageUploader";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/index";
import { redirect } from "next/navigation";

const ProfileSetting = async () => {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/customer/login");
  }

  const sessionUser = session?.user as any;
  const customer = await prisma.customer.findFirst({
    where: {
      OR: [
        { id: sessionUser?.id },
        { customerId: sessionUser?.customerId },
        { phone: sessionUser?.phone || undefined },
      ],
    },
  });

  if (!customer) {
    return (
      <div className="container mx-auto py-20 text-center">
        <h1 className="text-2xl font-bold">Customer data not found.</h1>
      </div>
    );
  }

  return (
    <div className="space-y-4 mt-14">
      {/* account setting */}
      <Card>
        <CardHeader>
          <CardTitle>Account settings</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row md:space-x-4">
          {/* Input area */}
          <div className="order-2 md:order-1 mt-4 md:mt-0 flex-1">
            <AccountSettingForm customer={customer} />
          </div>

          {/* Profile picture Uploader */}
          <div className="order-1 md:order-2 flex flex-col justify-center items-center">
            <ProfileImageUploader customer={customer} />
          </div>
        </CardContent>
      </Card>

      {/* billing address */}
      <Card>
        <CardHeader>
          <CardTitle>Billing address</CardTitle>
        </CardHeader>
        <CardContent>
          <BillingAddressForm customer={customer} />
        </CardContent>
      </Card>

      {/* change password */}
      <Card>
        <CardHeader>
          <CardTitle>Change password</CardTitle>
        </CardHeader>
        <CardContent>
          <ChangePasswordForm customer={customer} />
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileSetting;
