"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Trash2, CheckCircle2, MoreVertical, Plus } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { deletePaymentMethod, setDefaultPaymentMethod } from "../_action";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import AddPaymentMethodDialog from "./AddPaymentMethodDialog";

type PaymentMethod = {
  id: string;
  type: string;
  provider: string;
  lastFour?: string | null;
  expiry?: string | null;
  isDefault: boolean;
};

interface PaymentMethodListProps {
  initialMethods: PaymentMethod[];
  customerId: string;
}

const PaymentMethodList: React.FC<PaymentMethodListProps> = ({
  initialMethods,
  customerId,
}) => {
  const [methods, setMethods] = useState(initialMethods);
  const { toast } = useToast();

  const handleDelete = async (id: string) => {
    try {
      const res = await deletePaymentMethod(id);
      if (res.success) {
        setMethods(methods.filter((m) => m.id !== id));
        toast({ title: "Success", description: "Payment method deleted." });
      } else {
        toast({ title: "Error", description: res.error, variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Something went wrong.", variant: "destructive" });
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      const res = await setDefaultPaymentMethod(customerId, id);
      if (res.success) {
        setMethods(
          methods.map((m) => ({
            ...m,
            isDefault: m.id === id,
          }))
        );
        toast({ title: "Success", description: "Default payment method updated." });
      } else {
        toast({ title: "Error", description: res.error, variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Something went wrong.", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Saved Payment Methods</h3>
        <AddPaymentMethodDialog customerId={customerId} />
      </div>

      {methods.length === 0 ? (
        <Card className="border-dashed py-10">
          <CardContent className="flex flex-col items-center justify-center text-center">
            <CreditCard className="size-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No saved payment methods found.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {methods.map((method) => (
            <Card key={method.id} className={method.isDefault ? "border-primary" : ""}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-4">
                    <div className="bg-muted p-2 rounded-md">
                      <CreditCard className="size-6" />
                    </div>
                    <div>
                      <p className="font-medium">
                        {method.provider} {method.lastFour && `•••• ${method.lastFour}`}
                      </p>
                      <p className="text-sm text-muted-foreground capitalize">
                        {method.type} {method.expiry && `| Exp: ${method.expiry}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {method.isDefault && (
                      <Badge variant="secondary" className="bg-primary/10 text-primary border-none">
                        Default
                      </Badge>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-8">
                          <MoreVertical className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {!method.isDefault && (
                          <DropdownMenuItem onClick={() => handleSetDefault(method.id)}>
                            Set as Default
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => handleDelete(method.id)}
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default PaymentMethodList;
