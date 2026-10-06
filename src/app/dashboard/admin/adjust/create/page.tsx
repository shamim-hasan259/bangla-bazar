import PageTitle from "@/components/ui/PageTitle";
import { Button } from "@/components/ui/button";
import { Toast } from "@/components/ui/toast";
import Link from "next/link";
// import PoForm from "./POForm";
import { ArrowLeft } from "lucide-react";
import AdjustForm from "./AdjustForm";

export default async function ProductsPage() {
  const data: any = [];
  // const [product, setProduct] = useState<any>([]);
  return (
    <main className="flex min-h-screen flex-col gap-0 w-full">
      <div className=" flex-col flex w-full">
        <div className="flex-1 space-y-4 p-4 pt-4">
          <div className="flex items-center justify-between space-y-2">
            <div className="flex">
              <Link href="/dashboard/adjust">
                <Button variant="ghost">
                  <ArrowLeft />
                </Button>
              </Link>
              <PageTitle title="Create New Adjust" />
            </div>

            <div className="flex items-center space-x-2">
              <Link href="/dashboard/adjust">
                <Button>Cancle</Button>
              </Link>
            </div>
          </div>
          {/* <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-1">
            <h2>Create PO Here</h2>
          </div> */}
        </div>
      </div>
      <div className="grid gap-0 md:grid-cols-1 lg:grid-cols-1">
        <AdjustForm entry={""} />
      </div>
    </main>
  );
}
