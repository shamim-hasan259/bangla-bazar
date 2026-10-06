"use client";
import { Input } from "@/components/ui/input";
import { useSession } from "next-auth/react";

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
import { toast } from "sonner";
import { redirect, useRouter } from "next/navigation";
import { updateUser } from "./_action";

const FormSchema = z
  .object({
    name: z.string(),
    username: z
      .string()
      .min(5, {
        message: "Username must be at least 5 characters.",
      })
      .max(50, "max 50 characters"),
    email: z.union([z.string().email(), z.literal("")]),
    phone: z.string(),
    password: z
      .string()
      .min(1, "password is required")
      .min(6, "minimum 6 digit"),
    confirmPassword: z
      .string()
      .min(1, "password confirmation is required")
      .min(6, "minimum 6 digit"),
    warehouseId: z.string(),
    type: z.string(),
    status: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Password do not Match",
  });

function UserFormEdit({ user }: { user: any }) {
  const router = useRouter();
  const { data: session } = useSession();
  const isCurrentUserAdmin = session?.user?.type === "Admin";

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: user ? user.name : "",
      username: user ? user.username : "",
      email: user ? user.email : "",
      phone: user ? user.phone : "",
      password: "",
      confirmPassword: "",
      type: user ? user.type : "Assistant",
      status: user ? user.status : "Active",
    },
  });
  // z.infer<typeof FormSchema>
  async function onSubmit(data: any) {
    try {
      const id = user.id;

      //@ts-ignore
      const updateuser = await updateUser(id, data);
      if (!updateuser) {
        toast.error("User Update faield!");
      } else {
        toast.success("User Update Success");
        router.push("/dashboard/users");
      }
      // await axios.put(`/api/user/${user.id}`, data)
      // .then((res)=>{
      // //   (res)
      //   if(res.status === 200){
      //       toast.success("User Update Success")
      //       revalidatePath('/dashboard/users')
      //   }
      // }).catch(error=>{
      //      (error)
      //       toast.error("User Update Faild")
      // })
      // .finally(()=>{
      //     router.push('/dashboard/users')
      // })
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
            name="name"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="Full Name" {...field} />
                </FormControl>
                {/* <FormDescription>
                                This is your public display name.
                            </FormDescription> */}
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input placeholder="username" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone</FormLabel>
                <FormControl>
                  <Input placeholder="0168 XXXX XXX" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    placeholder="mail@example.com"
                    type="email"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input placeholder="Password" type="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Re-Password</FormLabel>
                <FormControl>
                  <Input placeholder="Password" type="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger disabled={!isCurrentUserAdmin} className="">
                      <SelectValue placeholder="Assistan" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {isCurrentUserAdmin && <SelectItem value="Admin">Admin</SelectItem>}
                    <SelectItem value="Manager">Manager</SelectItem>
                    <SelectItem value="Marketing">Marketing</SelectItem>
                    <SelectItem value="Sales">Sales</SelectItem>
                    <SelectItem value="Stuff">Stuff</SelectItem>
                  </SelectContent>
                </Select>

                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="">
                      <SelectValue placeholder="Active" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>

                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">Submit</Button>
        </form>
      </Form>
      <Toaster />
    </div>
  );
}

export default UserFormEdit;
