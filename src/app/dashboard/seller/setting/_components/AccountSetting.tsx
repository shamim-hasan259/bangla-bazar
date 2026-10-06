"use client";

import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { Edit } from "lucide-react";

import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import UpdateInfoDialogContent from "./UpdateInfoDialogContent";
import UpdatePasswordDialog from "./UpdatePasswordDialog";

const AccountSetting = () => {
  const { data: session } = useSession();

  return (
    <div>
      <div className="border shadow-lg p-6 rounded-lg space-y-4">
        <h2 className="text-lg font-semibold">Account Setting</h2>

        {/* phone */}
        <div>
          <label>Login phone number</label>
          <div className="flex items-center">
            <div>
              <p className="text-gray-500 dark:text-gray-200">
                {session?.user?.phone || "N/A"}
              </p>
            </div>

            {/* update phone modal */}
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="link">
                  <Edit size="icon" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <UpdateInfoDialogContent
                  title="Update your phone number"
                  contactInfo={session?.user?.phone}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* email */}
        <div>
          <label className="">Login email address</label>
          <div className="flex items-center">
            <div>
              <p className="text-gray-500 dark:text-gray-200">
                {session?.user?.email || "N/A"}
              </p>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="link">
                  <Edit size="icon" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <UpdateInfoDialogContent
                  title="Update your email address"
                  contactInfo={session?.user?.email}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* password */}
        <div>
          <label className="">Password</label>
          <div className="flex items-center">
            <div>
              <p className="text-gray-500 dark:text-gray-200">{"******"}</p>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="link">
                  <Edit size="icon" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <UpdatePasswordDialog title="Update your password" />
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountSetting;
