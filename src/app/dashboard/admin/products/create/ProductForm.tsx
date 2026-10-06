"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Loader2, Save } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import { cn } from "@/lib/utils";
import SelectSupplier from "@/components/ui/SelectSupplier";
import SelectMc from "@/components/ui/SelectMc";
import SelectCategory from "@/components/ui/SelectCategory";
import SelectBrand from "@/components/ui/SelectBrand";
import SelectUnit from "@/components/ui/SelectUnit";
import ImageUpload from "@/components/ui/ImageUpload";

import { saveProduct } from "../_action";
import { ProductFormSchema } from "./ProductFormSchema";
import { categoryDw, categoryMCDw } from "../../category/_action";
import { SupplierDw } from "../../supplier/_action";
import { getUnitDw } from "../../unit/_action";
import { useRouter } from "next/navigation";

// Helper function to safely parse dates
const parseSafeDate = (date: any): Date | undefined => {
  if (!date) return undefined;
  if (date instanceof Date) return date;
  const parsed = new Date(date);
  return isNaN(parsed.getTime()) ? undefined : parsed;
};

interface ProductFormEditProps {
  entry?: any;
}

export default function ProductForm({ entry }: ProductFormEditProps) {
  const router = useRouter();
  const [id, setId] = useState<string>("");
  const [mcId, setMcId] = useState<string>("");
  const [loading, setLoading] = useState(false);

  // Dropdown Data States
  const [mcDW, setMcDW] = useState<any>([{ value: "", label: "Select Master Category" }]);
  const [catDW, setCatDW] = useState<any>([{ value: "", label: "Select Category" }]);
  const [supplierDw, setSupplierDw] = useState<any>([{ value: "", label: "Select Supplier" }]);
  const [unitDw, setUnitDw] = useState<any>([{ value: "", label: "Select Unit" }]);

  const form = useForm<z.infer<typeof ProductFormSchema>>({
    resolver: zodResolver(ProductFormSchema),
    defaultValues: {
      name: "",
      salesType: "Standerd",
      articleCode: "",
      ean: "",
      masterCategoryId: "",
      categoryId: "",
      unitId: "",
      brandId: "",
      vat: 0,
      vatMethod: false,
      hsCode: "",
      type: "Standerd",
      shipping: "",
      featured: "false",
      website: true,
      slug: "",
      description: "",
      specification: "",
      price: 0,
      promoPrice: "",
      photo: "",
      supplierId: "",
      openingQty: 0,
      soldQty: 0,
      returnQty: 0,
      damageQty: 0,
      closingQty: 0,
      mrp: 0,
      tp: 0,
      cogs: 0,
      picsInPackage: 0,
      status: "Active",
    },
  });

  // Load Entry Data
  useEffect(() => {
    if (entry?.id) {
      setId(entry.id);
      form.reset({
        name: entry.name || "",
        salesType: entry.salesType || "",
        articleCode: entry.articleCode || "",
        ean: entry.ean || "",
        masterCategoryId: entry.masterCategoryId || "",
        categoryId: entry.categoryId || "",
        unitId: entry.unitId || "",
        brandId: entry.brandId || "",
        vat: entry.vat || 0,
        vatMethod: entry.vatMethod === "true" || entry.vatMethod === true,
        hsCode: entry.hsCode || "",
        type: entry.type || "Standerd",
        shipping: entry.shipping || "",
        featured: entry.featured || "false",
        website: entry.website === "true" || entry.website === true || entry.website === undefined || entry.website === null,
        slug: entry.slug || "",
        description: entry.description || "",
        specification: entry.specification || "",
        price: entry.price || 0,
        promoPrice: entry.promoPrice ? String(entry.promoPrice) : "",
        promoStart: parseSafeDate(entry.promoStart),
        promoEnd: parseSafeDate(entry.promoEnd),
        photo: entry.photo || "",
        supplierId: entry.supplierId || "",
        openingQty: entry.openingQty || 0,
        soldQty: entry.soldQty || 0,
        returnQty: entry.returnQty || 0,
        damageQty: entry.damageQty || 0,
        closingQty: entry.closingQty || 0,
        mrp: entry.mrp || 0,
        tp: entry.tp || 0,
        cogs: entry.cogs || 0,
        picsInPackage: entry.picsInPackage || 0,
        status: entry.status || "Active",
      });
      if (entry.masterCategoryId) setMcId(entry.masterCategoryId);
    }
  }, [entry, form]);

  // Fetch Dropdown Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [mcData, catData, supplierData, unitData] = await Promise.all([
          categoryMCDw(),
          categoryDw(),
          SupplierDw(),
          getUnitDw(),
        ]);
        setMcDW(mcData);
        setCatDW(catData);
        setSupplierDw(supplierData);
        setUnitDw(unitData);
      } catch (error) {
        console.error("Error fetching dropdown data:", error);
        toast.error("Failed to load form data");
      }
    };
    fetchData();
  }, []);

  // Handlers
  const handleSlug = (name: string) => {
    const slug = name.toLowerCase().split(" ").join("-");
    form.setValue("slug", slug);
  };

  const handleMcId = (id: string) => {
    form.setValue("masterCategoryId", id);
    setMcId(id);
  };

  async function onSubmit(data: any) {
    setLoading(true);
    try {
      const product = await saveProduct(id, data);
      if (product) {
        toast.success(id ? "Product updated successfully" : "Product created successfully");
        if (!id) form.reset();
        router.push("/dashboard/admin/products");
        router.refresh();
      } else {
        toast.error(id ? "Failed to update product" : "Failed to create product");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while saving");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* LEFT COLUMN - MAIN CONTENT */}
          <div className="lg:col-span-8 space-y-6">

            {/* General Information */}
            <Card>
              <CardHeader>
                <CardTitle>General Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Name <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. Wireless Headphones"
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            if (!id) handleSlug(e.target.value);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="slug"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Slug</FormLabel>
                        <FormControl>
                          <Input placeholder="wireless-headphones" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="articleCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Article Code <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <Input placeholder="ART-001" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="ean"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>EAN Code</FormLabel>
                        <FormControl>
                          <Input placeholder="Bar Code" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="hsCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>HS Code</FormLabel>
                        <FormControl>
                          <Input placeholder="HS Code" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Detailed product description..."
                          className="min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="specification"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Specification</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Product specifications..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Pricing */}
            <Card>
              <CardHeader>
                <CardTitle>Pricing & Financials</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Selling Price</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            placeholder="0"
                            {...field}
                            onChange={(e) => field.onChange(e.target.value === "" ? 0 : Number(e.target.value))}
                            onFocus={(e) => e.target.select()}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="mrp"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>MRP</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            placeholder="0"
                            {...field}
                            onChange={(e) => field.onChange(e.target.value === "" ? 0 : Number(e.target.value))}
                            onFocus={(e) => e.target.select()}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="tp"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Trade Price (TP)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            placeholder="0"
                            {...field}
                            onChange={(e) => field.onChange(e.target.value === "" ? 0 : Number(e.target.value))}
                            onFocus={(e) => e.target.select()}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="vat"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>VAT Amount</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            placeholder="0"
                            {...field}
                            onChange={(e) => field.onChange(e.target.value === "" ? 0 : Number(e.target.value))}
                            onFocus={(e) => e.target.select()}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex items-center pt-8">
                    <FormField
                      control={form.control}
                      name="vatMethod"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>
                              VAT Included?
                            </FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="promoPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Promo Price</FormLabel>
                        <FormControl>
                          <Input placeholder="Optional" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="promoStart"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Promo Start</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) => date < new Date()}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="promoEnd"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Promo End</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) => date < new Date()}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Inventory */}
            <Card>
              <CardHeader>
                <CardTitle>Inventory</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <FormField
                    control={form.control}
                    name="openingQty"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Opening Qty</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            placeholder="0"
                            {...field}
                            onChange={(e) => field.onChange(e.target.value === "" ? 0 : Number(e.target.value))}
                            onFocus={(e) => e.target.select()}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="picsInPackage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pcs/Package</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            placeholder="1"
                            {...field}
                            onChange={(e) => field.onChange(e.target.value === "" ? 1 : Number(e.target.value))}
                            onFocus={(e) => e.target.select()}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

          </div>

          {/* RIGHT COLUMN - SIDEBAR */}
          <div className="lg:col-span-4 space-y-6">

            {/* Categorization */}
            <Card>
              <CardHeader>
                <CardTitle>Organization</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="masterCategoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Master Category</FormLabel>
                      <FormControl>
                        <SelectMc
                          handleSelect={handleMcId}
                          selectedValue={field.value}
                          data={mcDW}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <FormControl>
                        <SelectCategory
                          handleSelect={(id: string) => form.setValue("categoryId", id)}
                          mcId={mcId}
                          selectedValue={field.value}
                          data={catDW}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="brandId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Brand</FormLabel>
                      <FormControl>
                        <SelectBrand
                          handleSelect={(id: string) => form.setValue("brandId", id)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="supplierId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Supplier</FormLabel>
                      <FormControl>
                        <SelectSupplier
                          handleSelect={(id: string) => form.setValue("supplierId", id)}
                          selectedValue={field.value}
                          data={supplierDw}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="unitId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unit</FormLabel>
                      <FormControl>
                        <SelectUnit
                          handleSelect={(id: string) => form.setValue("unitId", id)}
                          selectedValue={field.value}
                          data={unitDw}
                        />
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
                      <FormLabel>Product Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ""}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Standerd">Standard</SelectItem>
                          <SelectItem value="Combo">Combo</SelectItem>
                          <SelectItem value="Offer">Offer</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>


            {/* Media */}
            <Card>
              <CardHeader>
                <CardTitle>Product Image</CardTitle>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="photo"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <ImageUpload
                          value={field.value || ""}
                          onChange={field.onChange}
                          disabled={loading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Status & Visibility */}
            <Card>
              <CardHeader>
                <CardTitle>Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Status</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || "Active"}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Status" />
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
                <FormField
                  control={form.control}
                  name="website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Website Visibility</FormLabel>
                      <Select
                        onValueChange={(val) => field.onChange(val === "true")}
                        value={field.value ? "true" : "false"}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Visibility" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="true">Visible</SelectItem>
                          <SelectItem value="false">Hidden</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="featured"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Featured Product</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || "false"}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="true">Yes</SelectItem>
                          <SelectItem value="false">No</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Product
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>



          </div>

        </div>
      </form>
    </Form>
  );
}
