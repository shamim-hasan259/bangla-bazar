"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { useEffect, useState, use } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Package, Truck, CheckCircle2, XCircle, Calendar, User, Phone, Mail, MapPin } from "lucide-react";
import PageTitle from "@/components/ui/PageTitle";

type Params = {
  params: Promise<{ id: string }>;
};

type SoldProduct = {
  productId: string;
  quantity?: number;
  qty?: number;
  name: string;
  price: number;
  total: number;
  photo?: string;
};

type DeliveryAddress = {
  name: string;
  phone: string;
  email: string;
  streetAddress: string;
  city: string;
  district: string;
  country: string;
  zipCode?: string;
};

type PaidAmount = {
  cash?: number;
  card?: { name: string; amount: number };
  mfs?: { name: string; amount: number; senderNo?: string; trxId?: string };
};

type Order = {
  id: string;
  invoiceId: string;
  userId: string;
  deliveryAddress: DeliveryAddress;
  createdAt: string;
  soldProducts: SoldProduct[];
  total: number;
  grossTotal: number;
  status: string;
  paidAmount: PaidAmount;
  courierName?: string;
  trackingCode?: string;
};

const OrderDetailsPage = ({ params }: Params) => {
  const [order, setOrder] = useState<Order | null>(null);
  const { id } = use(params);

  const getOrderDetails = async () => {
    try {
      const { data } = await axios.get(`/api/orders/single-order/${id}`);
      setOrder(data);
    } catch (error) {
      console.error("Failed to fetch order:", error);
    }
  };

  useEffect(() => {
    if (id) {
      getOrderDetails();
    }
  }, [id]);

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1E60ED]"></div>
        <p className="text-sm text-slate-500">Loading Order Details...</p>
      </div>
    );
  }

  let currentStage = -1;

  if (order.status === "Pending" || order.status === "OrderPlaced") {
    currentStage = 0;
  } else if (order.status === "Processing") {
    currentStage = 1;
  } else if (order.status === "Shipped") {
    currentStage = 2;
  } else if (order.status === "Delivered" || order.status === "Complete") {
    currentStage = 3;
  }

  const paymentMethodName = order.paidAmount?.mfs?.name || (order.paidAmount?.cash !== undefined ? "Cash On Delivery" : "Online Payment");

  return (
    <div className="space-y-6 p-5 mx-auto">
      {/* Header section with back button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/seller/orders">
            <Button variant="outline" size="icon" className="h-9 w-9 border-slate-200 hover:bg-slate-100">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <PageTitle title={`Order #${order.invoiceId || order.id}`} />
            <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
              <Calendar className="h-3.5 w-3.5" />
              Placed on {new Date(order.createdAt).toLocaleString()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
            order.status === "Delivered" || order.status === "Complete" ? "bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400" :
            order.status === "Processing" || order.status === "Shipped" ? "bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400" :
            order.status === "Canceled" ? "bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400" :
            "bg-blue-100 text-orange-700 dark:bg-orange-950/30 dark:text-blue-400"
          }`}>
            {order.status}
          </span>
        </div>
      </div>

      {/* Grid containing addresses, items table and summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left column: customer details and sold products */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Customer Address Details Card */}
          <Card className="border-none shadow-sm bg-white dark:bg-slate-900">
            <CardHeader className="border-b pb-4">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <User className="h-4 w-4 text-slate-500" />
                Customer & Delivery Information
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Contact Information */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Contact Info</h3>
                  <div className="space-y-2 text-sm">
                    <p className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      <User className="h-4 w-4 text-slate-400" />
                      {order.deliveryAddress?.name}
                    </p>
                    <p className="text-slate-600 dark:text-slate-300 flex items-center gap-2">
                      <Phone className="h-4 w-4 text-slate-400" />
                      {order.deliveryAddress?.phone}
                    </p>
                    {order.deliveryAddress?.email && (
                      <p className="text-slate-600 dark:text-slate-300 flex items-center gap-2">
                        <Mail className="h-4 w-4 text-slate-400" />
                        {order.deliveryAddress?.email}
                      </p>
                    )}
                  </div>
                </div>

                {/* Delivery Address */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Delivery Address</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex gap-2 items-start text-slate-600 dark:text-slate-300">
                      <MapPin className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                      <div>
                        <p>{order.deliveryAddress?.streetAddress}</p>
                        <p>{order.deliveryAddress?.city}{order.deliveryAddress?.district ? `, ${order.deliveryAddress?.district}` : ""}</p>
                        <p className="font-semibold text-slate-800 dark:text-slate-200">{order.deliveryAddress?.country}</p>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </CardContent>
          </Card>

          {/* Sold Products Card */}
          <Card className="border-none shadow-sm bg-white dark:bg-slate-900 overflow-hidden">
            <CardHeader className="border-b pb-4">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Package className="h-4 w-4 text-slate-500" />
                Ordered Products
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-slate-50/50 dark:bg-slate-850/50">
                  <TableRow>
                    <TableHead className="pl-6">Product Details</TableHead>
                    <TableHead className="text-center">Price</TableHead>
                    <TableHead className="text-center">Quantity</TableHead>
                    <TableHead className="text-right pr-6">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.soldProducts?.map((product, idx) => {
                    let photoUrl = "";
                    if (product.photo) {
                      if (Array.isArray(product.photo) && product.photo.length > 0) {
                        photoUrl = typeof product.photo[0] === "string" ? product.photo[0] : "";
                      } else if (typeof product.photo === "string") {
                        photoUrl = product.photo;
                      }
                    }
                    photoUrl = photoUrl.trim();

                    return (
                      <TableRow key={idx}>
                        <TableCell className="pl-6 py-4">
                          <div className="flex items-center gap-3">
                            {photoUrl !== "" && (
                              <div className="relative w-12 h-12 rounded border overflow-hidden shrink-0">
                                <Image 
                                  src={photoUrl} 
                                  alt={product.name}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="font-medium text-slate-900 dark:text-slate-100 truncate max-w-sm">
                                {product.name}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">৳{product.price}</TableCell>
                        <TableCell className="text-center">{product.qty || product.quantity}</TableCell>
                        <TableCell className="text-right pr-6 font-semibold">৳{product.total}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Right column: Order summary and fulfillment info */}
        <div className="space-y-6">
          
          {/* Order Summary Card */}
          <Card className="border-none shadow-sm bg-white dark:bg-slate-900">
            <CardHeader className="border-b pb-4">
              <CardTitle className="text-base font-semibold">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Payment Method</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-200">
                    {paymentMethodName} {order.paidAmount?.mfs?.senderNo ? `(${order.paidAmount.mfs.senderNo})` : ""}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Subtotal</span>
                  <span className="font-medium text-slate-900 dark:text-slate-200">৳{order.grossTotal || order.total}</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Shipping Fee</span>
                  <span className="text-green-600 font-semibold">Free</span>
                </div>
                <div className="h-px bg-slate-100 dark:bg-slate-800 my-2"></div>
                <div className="flex justify-between text-base font-bold">
                  <span>Grand Total</span>
                  <span className="text-[#1E60ED]">৳{order.grossTotal || order.total}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Fulfillment Tracking Card */}
          <Card className="border-none shadow-sm bg-white dark:bg-slate-900">
            <CardHeader className="border-b pb-4">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Truck className="h-4 w-4 text-slate-500" />
                Fulfillment & Courier Info
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-2 pb-2">
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Courier</p>
                  <p className="font-medium text-slate-800 dark:text-slate-200 mt-1">
                    {order.courierName || "Not assigned"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Tracking Code</p>
                  <p className="font-mono font-medium text-slate-850 dark:text-slate-250 mt-1">
                    {order.trackingCode || "N/A"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>

      {/* Shipping Progress Bar */}
      <Card className="border-none shadow-sm bg-white dark:bg-slate-900">
        <CardContent className="pt-8 pb-8">
          <div className="relative flex items-center justify-between lg:gap-0 px-4">
            <div className="absolute w-[95%] h-1 bg-gray-200 dark:bg-slate-800 top-4 left-[2.5%] -z-0">
              {/* Background line */}
            </div>
            <div className="absolute h-1 bg-[#1E60ED] top-4 left-[2.5%] transition-all duration-500 -z-0"
              style={{ width: `${(currentStage / 3) * 95}%` }}>
            </div>

            {["Order Placed", "Processing", "Shipped", "Delivered"].map(
              (step, index) => {
                let StepIcon = Package;
                if (index === 1) StepIcon = Package;
                if (index === 2) StepIcon = Truck;
                if (index === 3) StepIcon = CheckCircle2;

                return (
                  <div
                    key={index}
                    className="relative flex flex-col items-center z-10"
                  >
                    <div
                      className={`w-8 h-8 flex items-center justify-center rounded-full font-bold transition-colors duration-300 ${index <= currentStage
                        ? "bg-[#1E60ED] text-white shadow-lg shadow-orange-500/30"
                        : "bg-white dark:bg-slate-900 border-2 border-gray-300 dark:border-slate-700 text-gray-400"
                        }`}
                    >
                      <StepIcon className="h-4 w-4" />
                    </div>
                    <p
                      className={`text-xs mt-2 font-semibold ${index <= currentStage
                        ? "text-[#1E60ED]"
                        : "text-gray-400"
                        }`}
                    >
                      {step}
                    </p>
                  </div>
                );
              }
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderDetailsPage;
