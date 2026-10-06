"use client";

import {
  Card,
  CardContent,
  CardFooter,
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
import axios from "axios";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useDispatch } from "react-redux";
import { clearCart } from "@/app/redux-store/Slice/CartSlice";
import { useParams, useSearchParams } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import ReturnOrderDialog from "./ReturnOrderDialog";

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
  invoiceId: string; // Add invoiceId
  userId: string;
  deliveryAddress: DeliveryAddress;
  createdAt: string;
  soldProducts: SoldProduct[]; // Changed from products to soldProducts
  total: number;
  grossTotal: number;
  status: string;
  paidAmount: PaidAmount;
};

const OrderTrack = () => {
  const [order, setOrder] = useState<Order | null>(null);
  const routeParams = useParams();
  const id = (routeParams?.id as string) || "";
  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const clearCartParam = searchParams.get('clear_cart');
  const paymentStatus = searchParams.get('payment');

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

  useEffect(() => {
    if (clearCartParam === 'true') {
      // Delay clearing cart to allow redux-persist to rehydrate first
      const timer = setTimeout(() => {
        dispatch(clearCart());
        if (paymentStatus === 'success') {
          toast({
            title: "Payment Successful",
            description: "Your payment has been verified and order placed.",
            variant: "default",
            className: "bg-green-600 text-white border-none"
          });
        }
      }, 1000); // 1 second delay

      return () => clearTimeout(timer);
    }
  }, [clearCartParam, paymentStatus, dispatch]);

  if (!order) {
    return <div className="p-10 text-center">Loading Order Details...</div>;
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
    <Card className="mt-14 container mx-auto mb-10">
      <CardHeader>
        <CardTitle>Order Details - {order.invoiceId || order.id}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Billing and Shipping Addresses */}
          <div className="border rounded-md col-span-2 overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="p-4 border-b md:border-b-0 md:border-r">
                <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-2">BILLING ADDRESS</h3>
                <p className="font-semibold">{order.deliveryAddress?.name}</p>
                <p className="text-sm">{order.deliveryAddress?.streetAddress}</p>
                <p className="text-sm">{order.deliveryAddress?.city}{order.deliveryAddress?.district ? `, ${order.deliveryAddress?.district}` : ""}</p>
                <p className="text-sm">{order.deliveryAddress?.country}</p>

                <div className="mt-4">
                  <p className="text-xs font-bold text-muted-foreground">EMAIL</p>
                  <p>{order.deliveryAddress?.email}</p>
                </div>
                <div className="mt-2">
                  <p className="text-xs font-bold text-muted-foreground">PHONE</p>
                  <p>{order.deliveryAddress?.phone}</p>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-2">SHIPPING ADDRESS</h3>
                <p className="font-semibold">{order.deliveryAddress?.name}</p>
                <p className="text-sm">{order.deliveryAddress?.streetAddress}</p>
                <p className="text-sm">{order.deliveryAddress?.city}{order.deliveryAddress?.district ? `, ${order.deliveryAddress?.district}` : ""}</p>
                <p className="text-sm">{order.deliveryAddress?.country}</p>

                <div className="mt-4">
                  <p className="text-xs font-bold text-muted-foreground">EMAIL</p>
                  <p>{order.deliveryAddress?.email}</p>
                </div>
                <div className="mt-2">
                  <p className="text-xs font-bold text-muted-foreground">PHONE</p>
                  <p>{order.deliveryAddress?.phone}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="border rounded-md h-fit">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead colSpan={2}>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-xs font-bold">ORDER ID</p>
                        <p className="text-gray-800 font-medium">#{order.invoiceId || order.id}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold">PAYMENT METHOD</p>
                        <p className="text-gray-800 font-medium">{paymentMethodName} {order.paidAmount?.mfs?.senderNo ? `(${order.paidAmount.mfs.senderNo})` : ""}</p>
                      </div>
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.soldProducts && order.soldProducts.map((product, idx) => (
                  <TableRow key={idx}>
                    <TableCell>
                      <span className="font-medium">{product.name}</span> <span className="text-muted-foreground text-xs">x {product.qty || product.quantity}</span>
                    </TableCell>
                    <TableCell className="text-right">
                      ${(product.total).toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}

                <TableRow>
                  <TableCell className="font-bold">Subtotal:</TableCell>
                  <TableCell className="text-right">
                    ${(order.grossTotal || order.total).toFixed(2)}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Discount</TableCell>
                  <TableCell className="text-right">0%</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Shipping</TableCell>
                  <TableCell className="text-right">Free</TableCell>
                </TableRow>
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell>Total</TableCell>
                  <TableCell className="text-right font-bold text-lg">
                    ${(order.grossTotal || order.total).toFixed(2)}
                  </TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </div>

          <div className="col-span-1 lg:col-span-3 flex justify-end">
            <ReturnOrderDialog orderId={order.id} status={order.status} />
          </div>
        </div>

        {/* Shipping Progress Bar */}
        <div className="mt-8 mb-4">
          <div className="relative flex items-center justify-between lg:gap-0 px-4 py-4">
            <div className="absolute w-full h-1 bg-gray-200 top-8 left-0 -z-0">
              {/* Background line */}
            </div>
            <div className="absolute h-1 bg-primary-customer top-8 left-0 transition-all duration-500 -z-0"
              style={{ width: `${(currentStage / 3) * 100}%` }}>
            </div>

            {["Order Placed", "Processing", "Shipped", "Delivered"].map(
              (step, index) => (
                <div
                  key={index}
                  className="relative flex flex-col items-center z-10"
                >
                  <div
                    className={`w-8 h-8 flex items-center justify-center rounded-full font-bold transition-colors duration-300 ${index <= currentStage
                      ? "bg-primary-customer text-white shadow-lg shadow-primary-customer/30"
                      : "bg-white border-2 border-gray-300 text-gray-400"
                      }`}
                  >
                    {index + 1}
                  </div>
                  <p
                    className={`text-sm mt-2 font-medium ${index <= currentStage
                      ? "text-primary-customer"
                      : "text-gray-400"
                      }`}
                  >
                    {step}
                  </p>
                </div>
              )
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter />
    </Card>
  );
};

export default OrderTrack;
