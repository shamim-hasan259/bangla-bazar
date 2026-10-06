"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Star, Loader2 } from "lucide-react";

interface FlashSaleSidebarProps {
  products?: any[];
}

const FlashSaleSidebar: React.FC<FlashSaleSidebarProps> = ({ products: initialProducts = [] }) => {
  const [products, setProducts] = useState<any[]>(initialProducts);
  const [loading, setLoading] = useState<boolean>(initialProducts.length === 0);
  const [targetDate, setTargetDate] = useState<Date | null>(null);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  // Fetch real flash sale products from API
  useEffect(() => {
    let isMounted = true;

    const fetchFlashSaleData = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/flash-sale");
        if (res.ok) {
          const data = await res.json();
          if (data && data.products && data.products.length > 0) {
            const mapped = data.products
              .map((p: any) => {
                const prod = p.product || p;
                return {
                  id: prod.id || prod._id,
                  name: prod.name,
                  price: p.discountPrice || prod.promoPrice || prod.price,
                  mrp: prod.price || prod.mrp,
                  discount: p.discountPercentage || (prod.mrp && prod.mrp > prod.price ? Math.round(((prod.mrp - prod.price) / prod.mrp) * 100) : 10),
                  rating: 5,
                  photo: prod.photo,
                };
              })
              .filter(Boolean);

            if (isMounted && mapped.length > 0) {
              setProducts(mapped);
              if (data.endDate) {
                setTargetDate(new Date(data.endDate));
              }
              setLoading(false);
              return;
            }
          }
        }

        // Fallback: Fetch latest active products via API
        const fallbackRes = await fetch("/api/products?limit=4");
        if (fallbackRes.ok) {
          const fallbackData = await fallbackRes.json();
          const items = Array.isArray(fallbackData)
            ? fallbackData
            : fallbackData.products || [];

          if (isMounted) {
            setProducts(items);
            // Default 3 days countdown if no fixed flash sale date
            const futureDate = new Date();
            futureDate.setDate(futureDate.getDate() + 3);
            setTargetDate(futureDate);
          }
        }
      } catch (err) {
        console.error("Error fetching flash sale products via API:", err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchFlashSaleData();

    return () => {
      isMounted = false;
    };
  }, []);

  // Timer calculation based on targetDate
  useEffect(() => {
    if (!targetDate) return;

    const calculateTime = () => {
      const difference = targetDate.getTime() - new Date().getTime();
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  const pad = (n: number) => n.toString().padStart(2, "0");

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <span className="text-[#e11d48] font-bold">»</span> Flash Sale
          </h3>
        </div>
        <div className="py-8 flex flex-col items-center justify-center text-slate-400 gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-[#e11d48]" />
          <span className="text-[11px]">Loading products...</span>
        </div>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
        <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
          <span className="text-[#e11d48] font-bold">»</span> Flash Sale
        </h3>
        <Link
          href="/products"
          className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#fed700] hover:bg-[#facc15] text-slate-900 transition-colors shadow-2xs"
        >
          Check all
        </Link>
      </div>

      {/* Countdown Timer */}
      <div className="flex items-center justify-center gap-1.5">
        <div className="bg-[#e11d48] text-white text-center rounded-lg px-2 py-1 min-w-[42px] shadow-2xs">
          <div className="text-xs font-extrabold">{pad(timeLeft.days)}</div>
          <div className="text-[8px] uppercase tracking-tighter opacity-90">Days</div>
        </div>
        <span className="text-[#e11d48] font-bold text-xs">:</span>
        <div className="bg-[#e11d48] text-white text-center rounded-lg px-2 py-1 min-w-[42px] shadow-2xs">
          <div className="text-xs font-extrabold">{pad(timeLeft.hours)}</div>
          <div className="text-[8px] uppercase tracking-tighter opacity-90">Hours</div>
        </div>
        <span className="text-[#e11d48] font-bold text-xs">:</span>
        <div className="bg-[#e11d48] text-white text-center rounded-lg px-2 py-1 min-w-[42px] shadow-2xs">
          <div className="text-xs font-extrabold">{pad(timeLeft.minutes)}</div>
          <div className="text-[8px] uppercase tracking-tighter opacity-90">Mins</div>
        </div>
        <span className="text-[#e11d48] font-bold text-xs">:</span>
        <div className="bg-[#e11d48] text-white text-center rounded-lg px-2 py-1 min-w-[42px] shadow-2xs">
          <div className="text-xs font-extrabold">{pad(timeLeft.seconds)}</div>
          <div className="text-[8px] uppercase tracking-tighter opacity-90">Sec</div>
        </div>
      </div>

      {/* Flash Sale Product Items (Pure API Data) */}
      <div className="space-y-3 pt-1">
        {products.slice(0, 3).map((item, idx) => {
          const photoUrl = Array.isArray(item.photo) && item.photo.length > 0
            ? item.photo[0]
            : typeof item.photo === "string" && item.photo.trim() !== ""
            ? item.photo
            : "/placeholder-product.png";

          const discount = item.mrp && item.mrp > item.price
            ? Math.round(((item.mrp - item.price) / item.mrp) * 100)
            : item.discount || 0;

          return (
            <Link
              key={item.id || idx}
              href={`/products/${item.id || ""}`}
              className="group block rounded-xl border border-slate-100 dark:border-slate-800 p-2 hover:border-slate-300 dark:hover:border-slate-700 transition-all hover:shadow-xs bg-slate-50/50 dark:bg-slate-800/40"
            >
              <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-white dark:bg-slate-900 mb-2">
                <Image
                  src={photoUrl}
                  alt={item.name || "Flash sale product"}
                  fill
                  sizes="240px"
                  className="object-contain p-2 group-hover:scale-105 transition-transform duration-200"
                />
              </div>

              <h4 className="text-xs font-medium text-slate-800 dark:text-slate-200 line-clamp-2 group-hover:text-[#e11d48] transition-colors leading-snug">
                {item.name}
              </h4>

              <div className="flex items-baseline gap-2 mt-1.5">
                <span className="text-xs font-extrabold text-[#e11d48]">
                  ৳ {item.price}
                </span>
                {item.mrp && item.mrp > item.price && (
                  <span className="text-[11px] text-slate-400 line-through">
                    ৳{item.mrp}
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between mt-1.5">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-2.5 h-2.5 ${
                        i < (item.rating || 4)
                          ? "fill-amber-400 text-amber-400"
                          : "fill-slate-200 text-slate-200 dark:fill-slate-700 dark:text-slate-700"
                      }`}
                    />
                  ))}
                </div>
                {discount > 0 && (
                  <span className="text-[10px] font-bold text-[#e11d48] bg-rose-50 dark:bg-rose-950/60 px-1.5 py-0.5 rounded border border-rose-200 dark:border-rose-900/40">
                    Save : {discount}%
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default FlashSaleSidebar;
