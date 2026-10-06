"use client";
import { Input } from "@/components/ui/input";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Toaster } from "@/components/ui/sonner";
import axios from "axios";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { useEffect, useState } from "react";
import { addOrder } from "@/order-create-actions";
import { OrderFormSchema } from "./OrderFormSchema";

type Offer = {
  id: string;
  name: string;
  description: string;
  offerId: string;
  price: string;
  status: string;
  photo: string;
};

type Customer = {
  id: string;
  name: string;
  phone: string;
  customerId: string;
};

function OrderForm() {
  const router = useRouter();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectCustomer, setSelectCustomer] = useState("");
  const [selectOffer, setSelectOffer] = useState("");

  const getOffer = async () => {
    await axios.get("/api/offer").then((res) => {
      //  (res.data)
      setOffers(res.data);
    });
  };
  const getCustomer = async () => {
    await axios.get("/api/customer").then((res) => {
      //  (res.data);
      setCustomers(res.data.customer);
    });
  };

  useEffect(() => {
    getCustomer();
    getOffer();
  }, []);

  const form = useForm<z.infer<typeof OrderFormSchema>>({
    resolver: zodResolver(OrderFormSchema),
    defaultValues: {
      customerId: "",
      userId: "",
      offerId: "",
      amount: "",
      paymentMethod: "Cash",
      status: "Active",
    },
  });

  async function onSubmit(data: z.infer<typeof OrderFormSchema>) {
    try {
      //  await addOrder(data)
      data;
    } catch (error) {
      console.error(error);
    }
  }
  return (
    <div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-5/6 space-y-4"
        >
          <FormField
            control={form.control}
            name="offerId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Select Offer</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="">
                      <SelectValue placeholder="Select Offer" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {offers?.length > 0 &&
                      offers.map((offer) => (
                        <SelectItem
                          key={offer.id}
                          value={offer.id}
                        >{`[${offer.offerId}]-${offer.name}`}</SelectItem>
                      ))}
                  </SelectContent>
                </Select>

                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="customerId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Select Customer</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="">
                      <SelectValue placeholder="Select Customer" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {customers?.length > 0 &&
                      customers.map((customer) => (
                        <SelectItem
                          key={customer.id}
                          value={customer.id}
                        >{`[${customer.customerId}]-${customer.name}`}</SelectItem>
                      ))}
                  </SelectContent>
                </Select>

                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="userId"
            render={({ field }) => (
              <FormItem>
                {/* <FormLabel>Select Customer</FormLabel> */}
                <FormControl>
                  <Input
                    type="hidden"
                    onVolumeChange={field.onChange}
                    defaultValue={field.value}
                  />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                {/* <FormLabel>Select Customer</FormLabel> */}
                <FormControl>
                  <Input
                    type="hidden"
                    onVolumeChange={field.onChange}
                    defaultValue={field.value}
                  />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                {/* <FormLabel>Select Customer</FormLabel> */}
                <FormControl>
                  <Input
                    type="hidden"
                    onVolumeChange={field.onChange}
                    defaultValue={field.value}
                  />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="paymentMethod"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Payment Method</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="">
                      <SelectValue placeholder="Cash" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Cash">Cash</SelectItem>
                    <SelectItem value="Card">Card</SelectItem>
                    <SelectItem value="Mfs">Mfs</SelectItem>
                  </SelectContent>
                </Select>

                <FormMessage />
              </FormItem>
            )}
          />
          <br />
          <div>
            <h2 className="text-md text-bold mb-2">Order Details</h2>
            <hr />
            <div className="mt-2 space-y-2">
              {/* <div className="w-[300px] overflow-hidden">
                            <AspectRatio ratio={16 / 9}>
                                <Image src="https://picsum.photos/id/237/200/300" width="300" height="120" alt="Image" className="rounded-md object-cover" />
                            </AspectRatio>
                        </div> */}
              <p>
                <b>Offer:</b>
              </p>
              <p>
                <b>Details:</b>
              </p>
              <p>
                <b>price:</b>
              </p>
              <p>
                <b>Customer:</b>
              </p>
            </div>
          </div>
          <Button type="submit" className="w-full">
            Place Order
          </Button>
        </form>
      </Form>
      <Toaster />
    </div>
  );
}

export default OrderForm;
