import PageTitle from "@/components/ui/PageTitle";
import CalenderDateRangePicker from "@/components/ui/CalenderDateRangePicker";
import UserLogsMain from "./UserLogsMain";

export default async function UserLogsPage() {
  return (
    <main className="flex min-h-screen flex-col gap-6 w-full">
      <div className=" flex-col flex w-full">
        <UserLogsMain />
      </div>
    </main>
  );
}
