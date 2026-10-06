"use client";

import React, { useEffect, useState, use } from "react";
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
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Package,
  Truck,
  CheckCircle2,
  Calendar,
  User,
  Phone,
  Mail,
  MapPin,
} from "lucide-react";
import PageTitle from "@/components/ui/PageTitle";

interface Params {
  params: Promise<{ storeId: string; id: string }>;
}

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

export default function StoreOrderDetailsPage({ params }: Params) {
  const { storeId, id } = use(params);
  const [order, setOrder] = useState<Order | null>(null);

  const getOrderDetails = async () => {
    try {
      const { data } = await axios.get(`/api/orders/single-order/${id}`);
      setOrder(data);
    } catch (error) {
      console.error("Failed to fetch order details:", error);
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

  const paymentMethodName =
    order.paidAmount?.mfs?.name ||
    (order.paidAmount?.cash !== undefined ? "Cash On Delivery" : "Online Payment");

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header section with back button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href={`/dashboard/seller/store-dashboard/${storeId}/orders`}>
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 rounded-xl border-slate-200 hover:bg-slate-50"
            >
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
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${
              order.status === "Delivered" || order.status === "Complete"
                ? "bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400"
                : order.status === "Processing" || order.status === "Shipped"
                ? "bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400"
                : order.status === "Canceled"
                ? "bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400"
                : "bg-blue-100 text-orange-700 dark:bg-orange-950/30 dark:text-blue-400"
            }`}
          >
            {order.status}
          </span>
        </div>
      </div>

      {/* Grid containing addresses, items table and summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: customer details and sold products */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Address Details Card */}
          <Card className="border-none shadow-xs rounded-3xl bg-white dark:bg-slate-900">
            <CardHeader className="border-b pb-4">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <User className="h-4 w-4 text-slate-500" />
                Customer & Delivery Information
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                {/* Contact Information */}
                <div className="space-y-3">
                  <h3 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                    Contact Info
                  </h3>
                  <div className="space-y-2">
                    <p className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                      <User className="h-4 w-4 text-slate-400" />
                      {order.deliveryAddress?.name}
                    </p>
                    <p className="text-slate-650 dark:text-slate-350 flex items-center gap-2">
                      <Phone className="h-4 w-4 text-slate-400" />
                      {order.deliveryAddress?.phone}
                    </p>
                    {order.deliveryAddress?.email && (
                      <p className="text-slate-650 dark:text-slate-350 flex items-center gap-2">
                        <Mail className="h-4 w-4 text-slate-400" />
                        {order.deliveryAddress?.email}
                      </p>
                    )}
                  </div>
                </div>

                {/* Delivery Address */}
                <div className="space-y-3">
                  <h3 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                    Delivery Address
                  </h3>
                  <div className="space-y-2">
                    <div className="flex gap-2 items-start text-slate-650 dark:text-slate-350">
                      <MapPin className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                      <div>
                        <p>{order.deliveryAddress?.streetAddress}</p>
                        <p>
                          {order.deliveryAddress?.city}
                          {order.deliveryAddress?.district
                            ? `, ${order.deliveryAddress?.district}`
                            : ""}
                        </p>
                        <p className="font-bold text-slate-800 dark:text-slate-200">
                          {order.deliveryAddress?.country}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sold Products Card */}
          <Card className="border-none shadow-xs rounded-3xl bg-white dark:bg-slate-900 overflow-hidden">
            <CardHeader className="border-b pb-4">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Package className="h-4 w-4 text-slate-500" />
                Ordered Products
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-slate-50/50 dark:bg-slate-950/20">
                  <TableRow>
                    <TableHead className="pl-6 text-[10px] font-extrabold uppercase tracking-wider">
                      Product Details
                    </TableHead>
                    <TableHead className="text-center text-[10px] font-extrabold uppercase tracking-wider">
                      Price
                    </TableHead>
                    <TableHead className="text-center text-[10px] font-extrabold uppercase tracking-wider">
                      Quantity
                    </TableHead>
                    <TableHead className="text-right pr-6 text-[10px] font-extrabold uppercase tracking-wider">
                      Total
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="text-xs">
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
                            {photoUrl !== "" ? (
                              <div className="relative w-10 h-10 border rounded-lg overflow-hidden shrink-0">
                                <Image
                                  src={photoUrl}
                                  alt={product.name}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            ) : (
                              <div className="w-10 h-10 border bg-slate-50 rounded-lg flex items-center justify-center shrink-0">
                                <Package className="w-5 h-5 text-slate-300" />
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="font-bold text-slate-800 dark:text-slate-200 truncate max-w-xs">
                                {product.name}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">৳ {product.price}</TableCell>
                        <TableCell className="text-center">
                          {product.qty || product.quantity}
                        </TableCell>
                        <TableCell className="text-right pr-6 font-bold">
                          ৳ {product.total}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Right column: Order summary and fulfillment info */}
        <div className="space-y-6 text-xs">
          {/* Order Summary Card */}
          <Card className="border-none shadow-xs rounded-3xl bg-white dark:bg-slate-900">
            <CardHeader className="border-b pb-4">
              <CardTitle className="text-sm font-bold">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-slate-500">
                  <span>Payment Method</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {paymentMethodName}
                    {order.paidAmount?.mfs?.senderNo
                      ? ` (${order.paidAmount.mfs.senderNo})`
                      : ""}
                  </span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal</span>
                  <span className="font-bold text-slate-850 dark:text-slate-200">
                    ৳ {order.grossTotal || order.total}
                  </span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Shipping Fee</span>
                  <span className="text-green-600 font-extrabold">Free</span>
                </div>
                <div className="h-px bg-slate-100 dark:bg-slate-800 my-2"></div>
                <div className="flex justify-between text-sm font-black">
                  <span>Grand Total</span>
                  <span className="text-[#1E60ED]">
                    ৳ {order.grossTotal || order.total}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Fulfillment Tracking Card */}
          <Card className="border-none shadow-xs rounded-3xl bg-white dark:bg-slate-900">
            <CardHeader className="border-b pb-4">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Truck className="h-4 w-4 text-slate-500" />
                Fulfillment & Courier Info
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-3">
              <div className="grid grid-cols-2 gap-2 pb-2">
                <div>
                  <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">
                    Courier
                  </p>
                  <p className="font-bold text-slate-800 dark:text-slate-200 mt-1">
                    {order.courierName || "Not assigned"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">
                    Tracking Code
                  </p>
                  <p className="font-mono font-bold text-slate-850 dark:text-slate-250 mt-1">
                    {order.trackingCode || "N/A"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Shipping Progress Bar */}
      <Card className="border-none shadow-xs rounded-3xl bg-white dark:bg-slate-900">
        <CardContent className="pt-8 pb-8">
          <div className="relative flex items-center justify-between px-4">
            <div className="absolute w-[95%] h-1 bg-gray-100 dark:bg-slate-800 top-4 left-[2.5%] -z-0">
              {/* Background line */}
            </div>
            <div
              className="absolute h-1 bg-[#1E60ED] top-4 left-[2.5%] transition-all duration-500 -z-0"
              style={{ width: `${(currentStage / 3) * 95}%` }}
            ></div>

            {["Order Placed", "Processing", "Shipped", "Delivered"].map((step, index) => {
              let StepIcon = Package;
              if (index === 1) StepIcon = Package;
              if (index === 2) StepIcon = Truck;
              if (index === 3) StepIcon = CheckCircle2;

              return (
                <div key={index} className="relative flex flex-col items-center z-10">
                  <div
                    className={`w-8 h-8 flex items-center justify-center rounded-full font-bold transition-colors duration-300 ${
                      index <= currentStage
                        ? "bg-[#1E60ED] text-white shadow-md shadow-blue-500/20"
                        : "bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 text-slate-400"
                    }`}
                  >
                    <StepIcon className="h-4 w-4" />
                  </div>
                  <p
                    className={`text-[10px] mt-2 font-bold ${
                      index <= currentStage ? "text-[#1E60ED]" : "text-slate-400"
                    }`}
                  >
                    {step}
                  </p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
