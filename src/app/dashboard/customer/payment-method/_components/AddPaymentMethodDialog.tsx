"use client";

import React, { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { addPaymentMethod } from "../_action";

const AddPaymentMethodDialog = ({ customerId }: { customerId: string }) => {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const [formData, setFormData] = useState({
        type: "Card",
        provider: "",
        lastFour: "",
        expiry: "",
        isDefault: false,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.provider) {
            toast({ title: "Validation Error", description: "Provider is required.", variant: "destructive" });
            return;
        }

        try {
            setLoading(true);
            const res = await addPaymentMethod(customerId, formData);
            if (res.success) {
                toast({ title: "Success", description: "Payment method added successfully." });
                setOpen(false);
                setFormData({
                    type: "Card",
                    provider: "",
                    lastFour: "",
                    expiry: "",
                    isDefault: false,
                });
                window.location.reload(); // Refresh to show new data
            } else {
                toast({ title: "Error", description: res.error, variant: "destructive" });
            }
        } catch (error) {
            toast({ title: "Error", description: "Something went wrong.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm">
                    <Plus className="mr-2 size-4" /> Add Method
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Add Payment Method</DialogTitle>
                        <DialogDescription>
                            Save a new payment method for faster checkout.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="type" className="text-right">
                                Type
                            </Label>
                            <Select
                                value={formData.type}
                                onValueChange={(val) => setFormData({ ...formData, type: val })}
                            >
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Card">Credit/Debit Card</SelectItem>
                                    <SelectItem value="MFS">Mobile Financial Service (MFS)</SelectItem>
                                    <SelectItem value="COD">Cash on Delivery (COD)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="provider" className="text-right">
                                Provider
                            </Label>
                            <Input
                                id="provider"
                                placeholder={formData.type === "Card" ? "Visa, Master, etc." : "Bkash, Nagad, etc."}
                                className="col-span-3"
                                value={formData.provider}
                                onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                            />
                        </div>

                        {formData.type === "Card" && (
                            <>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="lastFour" className="text-right">
                                        Last 4
                                    </Label>
                                    <Input
                                        id="lastFour"
                                        maxLength={4}
                                        placeholder="1234"
                                        className="col-span-3"
                                        value={formData.lastFour}
                                        onChange={(e) => setFormData({ ...formData, lastFour: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="expiry" className="text-right">
                                        Expiry
                                    </Label>
                                    <Input
                                        id="expiry"
                                        placeholder="MM/YY"
                                        className="col-span-3"
                                        value={formData.expiry}
                                        onChange={(e) => setFormData({ ...formData, expiry: e.target.value })}
                                    />
                                </div>
                            </>
                        )}

                        <div className="flex items-center space-x-2 pl-24">
                            <Checkbox
                                id="isDefault"
                                checked={formData.isDefault}
                                onCheckedChange={(checked) =>
                                    setFormData({ ...formData, isDefault: checked as boolean })
                                }
                            />
                            <Label htmlFor="isDefault" className="text-sm font-medium leading-none">
                                Set as default payment method
                            </Label>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Method
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default AddPaymentMethodDialog;
