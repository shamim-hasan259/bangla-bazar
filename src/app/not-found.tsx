import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex items-center justify-center h-screen flex-col gap-y-6 bg-gray-100 dark:bg-gray-950 text-gray-800 dark:text-gray-100">
      <div className="text-center">
        <h2 className="text-4xl font-bold mb-2 text-gray-900 dark:text-gray-100">
          Page Not Found
        </h2>
        {/* <p className="text-lg text-gray-600 mb-4">
          Sorry, we couldn't find the page you were looking for.
        </p> */}
        <p className="text-6xl font-extrabold">404</p>
      </div>
      <Button className="flex items-center gap-x-2">
        <ArrowLeft />
        <Link href="/" className="font-medium text-lg">
          Home
        </Link>
      </Button>
    </div>
  );
}
