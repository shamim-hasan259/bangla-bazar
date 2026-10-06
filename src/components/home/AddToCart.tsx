import React from "react";
import { Button } from "../ui/button";
import { IoCartOutline } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { addToCart } from "@/app/redux-store/Slice/CartSlice";
import { toast } from "sonner";
import { RootState } from "@/app/redux-store/store";

const AddToCart = ({ product }: { product: any }) => {
  const { data: session } = useSession();
  const router = useRouter();
  const dispatch = useDispatch();

  const cartItems = useSelector(
    (state: RootState) => state.cart.items
  );

  const handleAddToCart = () => {
    if (!session?.user) {
      toast.error("Please log in to add items to cart!");
      router.push("/auth/customer/login");
      return;
    }

    const userRole = String(
      (session?.user as any)?.role || (session?.user as any)?.type || ""
    ).toLowerCase();
    const isAdmin = ["admin", "manager", "stuff", "sales", "marketing"].includes(userRole);

    if (isAdmin) {
      toast.error("Admins cannot add products to cart! Please use a customer account.");
      return;
    }

    const currentUserId = (session.user as any).id;
    const currentUserEmail = session.user.email;
    const currentUserPhone = (session.user as any).phone;

    if (
      (product?.sellerId && product.sellerId === currentUserId) ||
      (product?.seller?.id && product.seller.id === currentUserId) ||
      (product?.store?.sellerId && product.store.sellerId === currentUserId) ||
      (currentUserEmail && (product?.seller?.email === currentUserEmail || product?.store?.email === currentUserEmail)) ||
      (currentUserPhone && (product?.seller?.phone === currentUserPhone || product?.store?.phone === currentUserPhone))
    ) {
      toast.error("You cannot order or add your own product to cart!");
      return;
    }
    const existingItem = cartItems.find(
      (item) => item.id === product?.id
    );

    // Extract valid image string
    let photoUrl = "/placeholder-product.png";
    if (Array.isArray(product?.photo) && product.photo.length > 0) {
      photoUrl = product.photo[0];
    } else if (typeof product?.photo === "string" && product.photo.trim() !== "") {
      photoUrl = product.photo;
    }

    dispatch(
      addToCart({
        id: product?.id,
        quantity: 1,
        name: product?.name,
        photo: photoUrl,
        price: product?.price,
        mrp: product?.mrp,
      })
    );

    if (existingItem) {
      toast("Product quantity updated");
    } else {
      toast.success("Product added to cart");
    }
  };

  return (
    <button
  onClick={handleAddToCart}
  className="
    group
    h-10
    px-4
    flex
    items-center
    gap-2
    rounded-md
    border
    border-primary
    text-primary
    bg-transparent
    text-sm
    font-medium
    transition-all
    duration-300
    ease-out
    hover:bg-primary
    hover:text-white
    hover:shadow-md
    active:scale-95
    focus:outline-none
    focus:ring-2
    focus:ring-primary/40
  "
>
  <IoCartOutline
    size={18}
    className="transition-transform duration-300 group-hover:scale-110"
  />
  Add to Cart
</button>


  );
};

export default AddToCart;
