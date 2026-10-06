import PageTitle from "@/components/ui/PageTitle";
import NotificationDataTable from "./NotificationDataTable";

const NotificationSettings = async () => {
  return (
    <main className="flex min-h-screen flex-col gap-6 w-full">
      <div className=" flex-col flex w-full">
        <div className="flex-1 space-y-4">
          <div className="flex items-center justify-between space-y-2">
            <PageTitle title="Notification Settings" />
          </div>
          <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-1">
            <NotificationDataTable />
          </div>
        </div>
      </div>
    </main>
  );
};

export default NotificationSettings;
