"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Store as StoreIcon,
  MessageSquare,
  UserPlus,
  UserCheck,
  ShoppingBag,
  Info,
  Calendar,
  Layers,
  MapPin,
  Phone,
  Mail,
  Globe,
  Clock,
  ArrowUpDown,
  AlertTriangle,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toggleFollow } from "../_action";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { useSession } from "next-auth/react";
import { addToCart } from "@/app/redux-store/Slice/CartSlice";

const DAYS_OF_WEEK = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

interface IProduct {
  id: string;
  name: string;
  photo: any;
  price: number;
  stock: number;
  createdAt: string;
  mrp?: number;
  sellerId?: string;
  seller?: any;
}

interface IStore {
  id: string;
  storeNameBn: string;
  storeNameEn: string;
  slug: string;
  description: string | null;
  phone: string;
  email: string;
  storeLogo: string | null;
  storeBanner: string | null;
  address: string | null;
  facebook: string | null;
  instagram: string | null;
  x: string | null;
  status: string;
  createdAt: Date | string;
  followerIds: string[];
  settings: {
    returnPolicy: string | null;
    shippingPolicy: string | null;
    warrantyPolicy: string | null;
    businessHours: any;
    vacationMode: boolean;
    vacationStart: string | null;
    vacationEnd: string | null;
  } | null;
  masterCategory: {
    name: string;
  };
}

interface StorePageClientProps {
  store: IStore;
  featuredProducts: IProduct[];
  allProducts: IProduct[];
  customerId: string | null;
  isInitiallyFollowing: boolean;
}

export default function StorePageClient({
  store,
  featuredProducts,
  allProducts,
  customerId,
  isInitiallyFollowing,
}: StorePageClientProps) {
  const [activeTab, setActiveTab] = useState<"featured" | "catalog" | "profile">("featured");
  const [isFollowing, setIsFollowing] = useState(isInitiallyFollowing);
  const [followerCount, setFollowerCount] = useState(store.followerIds.length);
  const [sortBy, setSortBy] = useState<"newest" | "price-asc" | "price-desc">("newest");
  const [followLoading, setFollowLoading] = useState(false);
  const [search, setSearch] = useState("");

  // Determine offline state
  const isOffline = store.status === "Disabled" || (store.settings?.vacationMode ?? false);

  const handleFollowToggle = async () => {
    if (!customerId) {
      toast.error("Please login to follow this store.");
      return;
    }
    try {
      setFollowLoading(true);
      const res = await toggleFollow(store.id, customerId);
      if (res.success) {
        setIsFollowing(res.isFollowing ?? false);
        setFollowerCount(res.count ?? 0);
        toast.success(res.isFollowing ? "Store followed!" : "Store unfollowed!");
      } else {
        toast.error(res.error || "Operation failed");
      }
    } catch {
      toast.error("Failed to follow store");
    } finally {
      setFollowLoading(false);
    }
  };

  // Sort catalog products
  const sortedProducts = [...allProducts].sort((a, b) => {
    if (sortBy === "newest") {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    if (sortBy === "price-asc") {
      return a.price - b.price;
    }
    if (sortBy === "price-desc") {
      return b.price - a.price;
    }
    return 0;
  });

  const filteredProducts = sortedProducts.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 space-y-8 animate-in fade-in duration-300">

      {/* ── Offline/Vacation Banner ── */}
      {isOffline && (
        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 p-4 rounded-2xl flex items-start gap-3 text-amber-700 dark:text-amber-400">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider">Store Offline</h4>
            <p className="text-[11px] mt-0.5 leading-relaxed font-medium">
              {store.settings?.vacationMode
                ? "This store is currently on vacation. You can view the catalog, but online checkouts/ordering are temporarily disabled."
                : "This storefront is temporarily offline. Catalog browsing is allowed, but ordering is disabled."}
            </p>
          </div>
        </div>
      )}

      {/* ── Store Header Banner ── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs">

        {/* Banner Frame */}
        <div className="relative h-48 md:h-64 w-full bg-slate-100 flex items-center justify-center">
          {store.storeBanner ? (
            <Image src={store.storeBanner} alt="" fill className="object-cover" />
          ) : (
            <StoreIcon className="w-16 h-16 text-slate-300" />
          )}
        </div>

        {/* Profile Overlay details */}
        <div className="p-6 md:p-8 pt-12 md:pt-14 relative flex flex-col md:flex-row md:items-center justify-between gap-6">

          {/* Logo overlay offset */}
          <div className="absolute -top-12 md:-top-16 left-6 md:left-8 w-24 h-24 md:w-32 md:h-32 rounded-3xl border-4 border-white dark:border-slate-900 bg-white shadow-md overflow-hidden flex items-center justify-center">
            {store.storeLogo ? (
              <Image src={store.storeLogo} alt="" fill className="object-cover" />
            ) : (
              <StoreIcon className="w-10 h-10 md:w-14 md:h-14 text-slate-400" />
            )}
          </div>

          {/* Titles & Follows */}
          <div className="space-y-2 md:pl-28">
            <h1 className="text-xl md:text-2xl font-black text-slate-800 dark:text-white leading-tight">
              {store.storeNameEn}
            </h1>
            <p className="text-xs text-slate-400 font-semibold">{store.storeNameBn}</p>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-500 font-medium">
              <span className="flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-slate-450" /> {store.masterCategory.name}
              </span>
              <span className="h-3 w-px bg-slate-200"></span>
              <span>{followerCount} Followers</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Message Launcher */}
            <Link
              href={
                customerId
                  ? `/dashboard/customer/chat?storeId=${store.id}`
                  : `/auth/login?callbackUrl=/store/${store.slug}`
              }
            >
              <Button
                variant="outline"
                className="rounded-2xl border-slate-200 hover:text-[#1E60ED] hover:border-[#1E60ED] text-xs py-5 px-5 font-bold flex items-center gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Message Store</span>
              </Button>
            </Link>

            {/* Follow Toggle */}
            <Button
              onClick={handleFollowToggle}
              disabled={followLoading}
              className={`rounded-2xl font-bold text-xs py-5 px-6 flex items-center gap-2 shadow-md ${isFollowing
                  ? "bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-white shadow-none"
                  : "bg-[#1E60ED] hover:bg-blue-600 active:bg-blue-700 text-white shadow-blue-500/10"
                }`}
            >
              {isFollowing ? (
                <>
                  <UserCheck className="w-4 h-4" />
                  <span>Following</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Follow</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* ── Horizontal Navigation Topbar ── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Horizontal Tabs */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => setActiveTab("featured")}
            className={`pb-2 text-sm font-bold transition-all border-b-2 ${activeTab === "featured"
                ? "border-[#1E60ED] text-[#1E60ED]"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
          >
            Store
          </button>
          <button
            onClick={() => setActiveTab("catalog")}
            className={`pb-2 text-sm font-bold transition-all border-b-2 ${activeTab === "catalog"
                ? "border-[#1E60ED] text-[#1E60ED]"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
          >
            Products
          </button>
          <button
            onClick={() => setActiveTab("profile")}
            className={`pb-2 text-sm font-bold transition-all border-b-2 ${activeTab === "profile"
                ? "border-[#1E60ED] text-[#1E60ED]"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
          >
            Profile
          </button>
        </div>

        {/* Right aligned Search Bar (Search In Store) */}
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Search In Store"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setActiveTab("catalog");
            }}
            className="w-full bg-slate-50 dark:bg-slate-950/20 border border-slate-200 dark:border-slate-800 rounded-xl pl-4 pr-10 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#1E60ED]/10 focus:border-[#1E60ED] transition-all"
          />
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-450 w-4 h-4" />
        </div>
      </div>

      {/* ── Main content (Full Width) ── */}
      <div className="w-full">

        {/* TAB 1: FEATURED */}
        {activeTab === "featured" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex justify-between items-center border-b pb-4">
              <h2 className="text-base font-bold text-slate-850 dark:text-white">Featured Products</h2>
              <span className="text-xs text-slate-400 font-semibold">{featuredProducts.length} Items</span>
            </div>

            {featuredProducts.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-slate-900 border rounded-3xl p-6 text-slate-400">
                <ShoppingBag className="w-10 h-10 mx-auto mb-2 opacity-40 text-slate-400" />
                <p className="text-sm">No featured items highlighted yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {featuredProducts.map((p) => (
                  <ProductCard key={p.id} product={p} isOffline={isOffline} storeId={store.id} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: CATALOG */}
        {activeTab === "catalog" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
              <h2 className="text-base font-bold text-slate-850 dark:text-white">All Products</h2>

              {/* Sorting options */}
              <div className="flex items-center gap-2 max-w-xs w-full sm:w-auto shrink-0">
                <ArrowUpDown className="w-4 h-4 text-slate-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="newest">Sort by: Newest</option>
                  <option value="price-asc">Sort by: Price: Low to High</option>
                  <option value="price-desc">Sort by: Price: High to Low</option>
                </select>
              </div>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-slate-900 border rounded-3xl p-6 text-slate-400">
                <ShoppingBag className="w-10 h-10 mx-auto mb-2 opacity-40 text-slate-400" />
                <p className="text-sm">No products matched your search or listed yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {filteredProducts.map((p) => (
                  <ProductCard key={p.id} product={p} isOffline={isOffline} storeId={store.id} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: PROFILE */}
        {activeTab === "profile" && (
          <div className="space-y-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-xs animate-in fade-in duration-200">

            {/* Profile Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 border-b pb-6 border-slate-100 dark:border-slate-800">
              {/* Join Date */}
              <div className="bg-slate-50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-800 rounded-2xl p-4">
                <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Store Join Date</span>
                <span className="text-xs font-bold text-slate-800 dark:text-white mt-1.5 block">
                  {new Date(store.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                </span>
              </div>
              {/* Shipped On Time */}
              <div className="bg-slate-50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-800 rounded-2xl p-4">
                <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Shipped On Time</span>
                <span className="text-xs font-bold text-slate-800 dark:text-white mt-1.5 block">95%</span>
              </div>
              {/* Response Rate */}
              <div className="bg-slate-50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-800 rounded-2xl p-4">
                <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Response Rate</span>
                <span className="text-xs font-bold text-slate-800 dark:text-white mt-1.5 block">98%</span>
              </div>
              {/* Total Products */}
              <div className="bg-slate-50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-800 rounded-2xl p-4">
                <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Total Products</span>
                <span className="text-xs font-bold text-slate-800 dark:text-white mt-1.5 block">{allProducts.length}</span>
              </div>
              {/* Followers */}
              <div className="bg-slate-50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-800 rounded-2xl p-4">
                <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Followers</span>
                <span className="text-xs font-bold text-slate-800 dark:text-white mt-1.5 block">{followerCount}</span>
              </div>
              {/* Store Rating */}
              <div className="bg-slate-50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-800 rounded-2xl p-4">
                <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Store Rating</span>
                <span className="text-xs font-bold text-slate-800 dark:text-white mt-1.5 block">4.8 / 5.0</span>
              </div>
            </div>

            {/* About description */}
            {store.description && (
              <div className="space-y-2">
                <h3 className="text-sm font-extrabold text-slate-800 dark:text-white uppercase tracking-wider">About Store</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                  {store.description}
                </p>
              </div>
            )}

            {/* Policies Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-t pt-6 text-xs">
              {/* Shipping */}
              <div className="space-y-2 bg-slate-50/50 dark:bg-slate-950/20 p-4 border border-slate-100/50 dark:border-slate-850 rounded-2xl">
                <h4 className="font-extrabold text-slate-800 dark:text-white flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
                  <ShoppingBag className="w-3.5 h-3.5 text-[#1E60ED]" /> Shipping Terms
                </h4>
                <p className="text-slate-500 leading-relaxed font-medium">
                  {store.settings?.shippingPolicy || "Standard marketplace shipping terms apply."}
                </p>
              </div>

              {/* Returns */}
              <div className="space-y-2 bg-slate-50/50 dark:bg-slate-950/20 p-4 border border-slate-100/50 dark:border-slate-850 rounded-2xl">
                <h4 className="font-extrabold text-slate-800 dark:text-white flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
                  <Info className="w-3.5 h-3.5 text-amber-500" /> Return Terms
                </h4>
                <p className="text-slate-500 leading-relaxed font-medium">
                  {store.settings?.returnPolicy || "Standard return terms apply."}
                </p>
              </div>

              {/* Warranty */}
              <div className="space-y-2 bg-slate-50/50 dark:bg-slate-950/20 p-4 border border-slate-100/50 dark:border-slate-850 rounded-2xl">
                <h4 className="font-extrabold text-slate-800 dark:text-white flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
                  <Clock className="w-3.5 h-3.5 text-emerald-500" /> Warranty Details
                </h4>
                <p className="text-slate-500 leading-relaxed font-medium">
                  {store.settings?.warrantyPolicy || "No warranty terms declared."}
                </p>
              </div>
            </div>

            {/* Timing details */}
            {store.settings?.businessHours && (
              <div className="border-t pt-6 space-y-4">
                <h3 className="text-sm font-extrabold text-slate-800 dark:text-white uppercase tracking-wider">Business Timing</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                  {DAYS_OF_WEEK.map((day) => {
                    const dayHours = store.settings?.businessHours[day] || { closed: true };

                    return (
                      <div key={day} className="flex justify-between items-center bg-slate-50 dark:bg-slate-950/20 px-4 py-2.5 rounded-xl border">
                        <span className="font-bold capitalize text-slate-700 dark:text-slate-350">{day}</span>
                        <span className={`font-semibold ${dayHours.closed ? "text-rose-500" : "text-slate-500"}`}>
                          {dayHours.closed ? "Closed" : `${dayHours.open} - ${dayHours.close}`}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Contacts */}
            <div className="border-t pt-6 space-y-4 text-xs">
              <h3 className="text-sm font-extrabold text-slate-800 dark:text-white uppercase tracking-wider">Address & Contacts</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {store.address && (
                  <div className="flex items-start gap-2.5 text-slate-550">
                    <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-700 dark:text-white block">Street Address</span>
                      <span className="font-semibold block mt-0.5">{store.address}</span>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-slate-550 font-semibold">
                    <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>{store.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-550 font-semibold">
                    <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>{store.email}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Subcomponent: Custom storefront Product Card
function ProductCard({ product, isOffline, storeId }: { product: IProduct; isOffline: boolean; storeId: string }) {
  const router = useRouter();
  const dispatch = useDispatch();
  const { data: session } = useSession();

  let imgUrl = "";
  if (product.photo) {
    if (Array.isArray(product.photo)) {
      const first = product.photo[0];
      imgUrl = typeof first === "string" ? first : (first?.productImg || "");
    } else if (typeof product.photo === "string") {
      imgUrl = product.photo;
    }
  }

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!session?.user) {
      toast.error("Please log in to proceed to checkout!");
      router.push("/auth/customer/login");
      return;
    }

    const currentUserId = (session.user as any).id;
    const currentUserEmail = session.user.email;
    const currentUserPhone = (session.user as any).phone;

    if (
      (product?.sellerId && product.sellerId === currentUserId) ||
      (product?.seller?.id && product.seller.id === currentUserId) ||
      (currentUserEmail && product?.seller?.email === currentUserEmail) ||
      (currentUserPhone && product?.seller?.phone === currentUserPhone)
    ) {
      toast.error("You cannot order your own product!");
      return;
    }

    const photoUrl = imgUrl || "/placeholder-product.png";
    dispatch(
      addToCart({
        id: product.id,
        quantity: 1,
        name: product.name,
        photo: photoUrl,
        price: product.price,
        mrp: product.mrp || product.price,
      })
    );

    router.push("/checkout");
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs hover:shadow-md hover:border-slate-200 dark:hover:border-slate-750 transition-all flex flex-col justify-between h-full group relative">

      {/* Product Image Frame */}
      <Link href={`/products/${product.id}`} className="block relative h-48 w-full bg-slate-50 overflow-hidden shrink-0">
        {imgUrl ? (
          <img
            src={imgUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ShoppingBag className="w-10 h-10 text-slate-300" />
          </div>
        )}
      </Link>

      {/* Info context */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <Link href={`/products/${product.id}`} className="block">
            <h3 className="text-xs font-bold text-slate-800 dark:text-white group-hover:text-[#1E60ED] transition-colors leading-tight line-clamp-2">
              {product.name}
            </h3>
          </Link>
          <div className="text-xs font-black text-[#1E60ED] mt-2">৳ {product.price}</div>
        </div>

        {/* Buttons / Actions */}
        <div className="space-y-2">
          {/* Inquiry Launcher */}
          <Link href={`/dashboard/customer/chat?storeId=${storeId}&productId=${product.id}`}>
            <Button
              variant="outline"
              className="w-full rounded-xl border-slate-200 group-hover:border-[#1E60ED] text-[10px] py-1.5 h-8 font-bold flex items-center justify-center gap-1 hover:text-[#1E60ED]"
            >
              <MessageSquare className="w-3.5 h-3.5" /> Inquiry
            </Button>
          </Link>

          {/* Checkout triggers (Disabled if offline) */}
          <Button
            onClick={handleBuyNow}
            disabled={isOffline || product.stock === 0}
            className="w-full rounded-xl bg-[#1E60ED] hover:bg-blue-600 text-white text-[10px] py-1.5 h-8 font-bold shadow-xs hover:shadow-md disabled:opacity-50 disabled:shadow-none cursor-pointer"
          >
            {product.stock === 0 ? "Out of Stock" : "Buy Now"}
          </Button>
        </div>
      </div>
    </div>
  );
}
