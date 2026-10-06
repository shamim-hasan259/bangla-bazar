import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { useDispatch } from "react-redux";
import { removeFromCart, updateQuantity } from "@/app/redux-store/Slice/CartSlice";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCartProps } from "@/types/interface";

const ShoppingCart: React.FC<ShoppingCartProps> = ({
  cartProducts,
}) => {
  const dispatch = useDispatch();

  const handleUpdateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity >= 1) {
      dispatch(updateQuantity({ id, quantity: newQuantity }));
    }
  };

  const handleRemove = (id: string) => {
    dispatch(removeFromCart(id));
  };

  if (!cartProducts || (cartProducts as any).length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
        <div className="bg-white p-6 rounded-full shadow-sm mb-6">
          <ShoppingBag className="h-12 w-12 text-slate-400 font-light" />
        </div>
        <h3 className="text-2xl font-bold text-slate-700 mb-2">Your cart is empty</h3>
        <p className="text-slate-500 mb-8 max-w-xs text-center">
          Looks like you haven't added anything to your cart yet.
        </p>
        <Link href="/products">
          <Button size="lg" className="rounded-full px-8">
            Start Shopping
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {(cartProducts as any).map((product: any) => {
        // Image handling logic
        const img = Array.isArray(product.photo) && product.photo.length > 0
          ? product.photo[0]
          : typeof product.photo === 'string' ? product.photo : "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?q=80&w=2070&auto=format&fit=crop";

        return (
          <div
            key={product.id}
            className="flex flex-col sm:flex-row gap-6 p-4 sm:p-6 bg-white rounded-2x border border-slate-100 shadow-sm hover:shadow-md transition-shadow active:scale-[0.99]"
          >
            {/* Product Image */}
            <div className="relative w-full sm:w-32 h-40 sm:h-32 bg-slate-50 dark:bg-slate-800 rounded-xl overflow-hidden shrink-0 border border-slate-100 dark:border-slate-800">
              <Image
                src={img}
                fill
                alt={product.name}
                className="object-contain p-2"
              />
            </div>

            {/* Product Info */}
            <div className="flex-1 flex flex-col justify-between py-1">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <Link href={`/products/${product.id.split("_")[0]}`} className="hover:text-primary transition-colors">
                    <h4 className="text-lg font-extrabold leading-tight text-slate-800 dark:text-slate-100">{product.name}</h4>
                  </Link>
                  <Badge variant="secondary" className="mt-2 bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 hover:bg-green-50 border-none font-bold">
                    In Stock
                  </Badge>
                </div>
                <div className="text-right">
                  <p className="text-xl font-black text-primary">${(product.price || 0).toFixed(2)}</p>
                  {product.mrp && product.mrp > product.price && (
                    <p className="text-sm text-slate-400 line-through">${(product.mrp || 0).toFixed(2)}</p>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-end mt-6">
                {/* Quantity Controls */}
                <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-1 border border-slate-200 dark:border-slate-700">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 rounded-lg hover:bg-white dark:hover:bg-slate-700 shadow-none"
                    onClick={() => handleUpdateQuantity(product.id, product.quantity - 1)}
                    disabled={product.quantity <= 1}
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </Button>
                  <span className="w-10 text-center font-black text-slate-700 dark:text-slate-200 text-sm">{product.quantity}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 rounded-lg hover:bg-white dark:hover:bg-slate-700 shadow-none"
                    onClick={() => handleUpdateQuantity(product.id, product.quantity + 1)}
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                </div>

                {/* Subtotal & Delete */}
                <div className="flex items-center gap-6">
                  <div className="text-right hidden sm:block">
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black">Item Total</p>
                    <p className="text-lg font-black text-slate-800 dark:text-slate-100">${((product.price || 0) * (product.quantity || 0)).toFixed(2)}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-all h-10 w-10"
                    onClick={() => handleRemove(product.id)}
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ShoppingCart;
