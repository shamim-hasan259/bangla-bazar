import React from "react";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { removeFromCart } from "@/app/redux-store/Slice/CartSlice";
import { useDispatch } from "react-redux";
import { CartProductTypes } from "@/types/interface";

const RemoveItemFromCart = ({ product }: { product: any }) => {
  const dispatch = useDispatch();

  const handleRemoveItemFromCart = (id: string) => {
    dispatch(removeFromCart(id));
  };

  return (
    <Button
      onClick={() => handleRemoveItemFromCart(product.id || product.productId)}
      variant="outline"
      className={cn("rounded-full px-2 py-2")}
    >
      <X className="h-4 w-4" />
    </Button>
  );
};

export default RemoveItemFromCart;
