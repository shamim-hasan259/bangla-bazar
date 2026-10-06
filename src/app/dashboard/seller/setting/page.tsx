export const dynamic = "force-dynamic";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import AccountSetting from "./_components/AccountSetting";
import BusinessInfoSetting from "./_components/BusinessInfoSetting";
import UserManagement from "./_components/UserManagement";
import Finance from "./_components/Finance";
import NotificationSettings from "./_components/NotificationSettings";

const Setting = () => {
  return (
    <div className="p-8">
      <Tabs defaultValue="account setting" className="">
        <TabsList
          className={cn(
            "sticky z-10 top-2 justify-start md:w-full gap-4 py-6 px-3 border bg-muted mb-4"
          )}
        >
          {settingTabListLinks.map((link) => (
            <TabsTrigger
              key={link.value}
              className={cn("data-[state=active]:text-primary-seller")}
              value={link.value}
            >
              {link.title}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value="account setting">
          <AccountSetting />
        </TabsContent>

        <TabsContent value="business setting">
          <BusinessInfoSetting />
        </TabsContent>

        <TabsContent value="user management">
          <UserManagement />
        </TabsContent>

        <TabsContent value="finance">
          <Finance />
        </TabsContent>

        <TabsContent value="notification setting">
          <NotificationSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Setting;

const settingTabListLinks = [
  { title: "Account Setting", value: "account setting" },
  { title: "Business Setting", value: "business setting" },
  { title: "User Management", value: "user management" },
  { title: "Finance", value: "finance" },
  { title: "Notification Setting", value: "notification setting" },
];
