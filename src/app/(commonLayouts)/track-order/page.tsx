import PageTitle from "@/components/ui/PageTitle";
import TrackingForm from "./TrackingForm";

export default function TrackOrderPage() {
  return (
    <div className="min-h-screen bg-[#f5f5f5] dark:bg-slate-950 py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-[#e0e0e0] dark:border-slate-800 p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-[#212121] dark:text-slate-100 mb-2">Track Your Order</h1>
            <p className="text-[#757575] dark:text-slate-400">
              Enter your Order ID or Tracking Code below to check the current status of your delivery.
            </p>
          </div>
          <TrackingForm />
        </div>
      </div>
    </div>
  );
}
