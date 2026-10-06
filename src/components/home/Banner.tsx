"use client";

import React, { useRef, useState, useEffect, useMemo } from "react";
import Autoplay from "embla-carousel-autoplay";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import Link from "next/link";
import Image from "next/image";
import {
  Menu,
  ChevronLeft,
  ChevronRight,
  Truck,
  Headphones,
  RefreshCw,
  ShieldCheck,
  DollarSign,
  Grid,
  ArrowRight,
} from "lucide-react";

import techBundleImg from "@/assets/banner/tech_bundle.png";
import headphoneImg from "@/assets/banner/headphone.png";
import watchesImg from "@/assets/banner/watches.png";
import electronicsImg from "@/assets/categories/electronics.png";
import laptopsImg from "@/assets/categories/laptops.png";
import watch__img from "@/assets/smart-watch.png";
import useCategory from "@/hooks/useCategory";
import { useLanguage } from "@/context/LanguageContext";

interface BannerProps {
  banners?: any[];
}

const DEFAULT_QUICK_LINKS = [
  { name: "Beauty & Skincare", href: "/products?category=beauty", hasIcon: false },
  { name: "Electronics & Gadgets", href: "/products?category=electronics", hasIcon: false },
  { name: "Fashion & Apparel", href: "/products?category=fashion", hasIcon: false },
  { name: "Watches & Jewelry", href: "/products?category=watches", hasIcon: false },
  { name: "Laptops & Tech", href: "/products?category=laptops", hasIcon: false },
  { name: "Headphones & Audio", href: "/products?category=audio", hasIcon: false },
  { name: "Home & Living", href: "/products?category=home", hasIcon: false },
  { name: "Footwear", href: "/products?category=footwear", hasIcon: false },
  { name: "Groceries", href: "/products?category=groceries", hasIcon: false },
  { name: "More Categories", href: "/products", hasIcon: true },
];

const TRUST_ITEMS = [
  { icon: Truck, title: "FREE DELIVERY", sub: "From $59.89" },
  { icon: Headphones, title: "SUPPORT 24/7", sub: "Online 24 Hours" },
  { icon: RefreshCw, title: "FREE RETURN", sub: "365 A Day" },
  { icon: ShieldCheck, title: "PAYMENT METHOD", sub: "Secure Payment" },
  { icon: DollarSign, title: "BIG SAVING", sub: "Weeken Sales" },
];

const DEFAULT_SLIDES = [
  {
    id: "slide-1",
    badge: "80% DISCOUNT ONLY THIS SUMMER",
    discount: "90%",
    title: "SUPER DISCOUNT",
    subtitle: "THIS SUMMER ONLY",
    link: "/products",
    bg: "linear-gradient(135deg, #f59e0b 0%, #fbbf24 50%, #facc15 100%)",
    fallbackImage: techBundleImg,
  },
  {
    id: "slide-2",
    badge: "EXCLUSIVE AUDIO SALE",
    discount: "40%",
    title: "STUDIO HEADSETS",
    subtitle: "HIGH-FIDELITY SOUND",
    link: "/products?category=audio",
    bg: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)",
    fallbackImage: headphoneImg,
  },
  {
    id: "slide-3",
    badge: "LIMITED EDITION",
    discount: "50%",
    title: "LUXURY SMART WATCHES",
    subtitle: "NEXT GEN HEALTH TRACKING",
    link: "/products?category=watches",
    bg: "linear-gradient(135deg, #059669 0%, #10b981 50%, #34d399 100%)",
    fallbackImage: watchesImg,
  },
];

function BannerSlideImage({
  src,
  fallback,
  alt,
}: {
  src?: string | null;
  fallback: any;
  alt: string;
}) {
  const [imgSrc, setImgSrc] = useState<any>(src || fallback);

  useEffect(() => {
    setImgSrc(src || fallback);
  }, [src, fallback]);

  if (!imgSrc) {
    return (
      <Image
        src={fallback}
        alt={alt}
        className="max-h-[300px] sm:max-h-[340px] w-auto object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-500"
        priority
      />
    );
  }

  if (typeof imgSrc === "string") {
    return (
      <img
        src={imgSrc}
        alt={alt}
        className="max-h-[300px] sm:max-h-[340px] w-auto object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-500"
        onError={() => setImgSrc(fallback)}
      />
    );
  }

  return (
    <Image
      src={imgSrc}
      alt={alt}
      className="max-h-[300px] sm:max-h-[340px] w-auto object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-500"
      onError={() => setImgSrc(fallback)}
    />
  );
}

const HeroBannerSection = ({ banners = [] }: BannerProps) => {
  const { t } = useLanguage();
  const plugin = useRef(Autoplay({ delay: 4500, stopOnInteraction: false }));
  const [api, setApi] = useState<any>(null);
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);
  const { categories } = useCategory();

  const trustItems = [
    { icon: Truck, title: t("free_delivery"), sub: t("from_min") },
    { icon: Headphones, title: t("support_24_7"), sub: t("online_24_hours") },
    { icon: RefreshCw, title: t("free_return"), sub: t("return_policy") },
    { icon: ShieldCheck, title: t("payment_method"), sub: t("secure_payment") },
    { icon: DollarSign, title: t("big_saving"), sub: t("weekend_sales") },
  ];

  // Dynamic Category Links from Database
  const quickLinksToRender = useMemo(() => {
    if (categories && categories.length > 0) {
      const topList = categories.slice(0, 9).map((cat) => ({
        name: cat.name,
        href: `/products?category=${cat.id}`,
        hasIcon: false,
      }));
      return [
        ...topList,
        { name: t("more_categories", "More Categories"), href: "/products", hasIcon: true },
      ];
    }
    return DEFAULT_QUICK_LINKS.map(item => ({
      ...item,
      name: t(item.name)
    }));
  }, [categories, t]);

  const sliderBanners =
    banners?.filter(
      (b) => (b.type === "MainSlider" || !b.type) && (b.status === "Active" || !b.status)
    ) || [];

  const rightBanners =
    banners?.filter(
      (b) => b.type === "RightPromo" && (b.status === "Active" || !b.status)
    ) || [];

  const slidesToRender = sliderBanners.map((b, i) => ({
    id: b.id || ("slide-" + i),
    badge: b.badge || null,
    discount: b.discount || null,
    title: b.title || b.name || null,
    subtitle: b.subtitle || null,
    link: b.link || b.slug || "/products",
    image: b.imageUrl || b.photo || null,
    bg: i % 3 === 1
      ? "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)"
      : i % 3 === 2
      ? "linear-gradient(135deg, #059669 0%, #10b981 50%, #34d399 100%)"
      : "linear-gradient(135deg, #f59e0b 0%, #fbbf24 50%, #facc15 100%)",
    fallbackImage: i % 3 === 1 ? headphoneImg : i % 3 === 2 ? watchesImg : techBundleImg,
  }));

  useEffect(() => {
    if (!api) return;
    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap());
    const onSelect = () => setCurrent(api.selectedScrollSnap());
    api.on("select", onSelect);
    api.on("reInit", onSelect);
    return () => {
      api.off("select", onSelect);
      api.off("reInit", onSelect);
    };
  }, [api]);

  return (
    <div className="w-full bg-[#f8fafc] dark:bg-slate-950 py-4 sm:py-6">
      <div className="w-full max-w-[1200px] mx-auto px-4 xl:px-0 flex flex-col gap-6">

        {/* Top 3-Column Layout: Left Quicklink + Center Auto Slider + Right 3 Promo Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">

          {/* Left Column: QUICKLINK Category Menu */}
          <div className="hidden lg:block lg:col-span-3 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded overflow-hidden shadow-xs flex flex-col justify-between">
            <div className="bg-slate-900 dark:bg-slate-800 text-white font-extrabold text-xs px-4 py-3.5 uppercase tracking-wider flex items-center gap-2 rounded-t">
              <Menu className="w-4 h-4 text-amber-400" />
              <span>{t("all_categories")}</span>
            </div>
            <div className="flex-1 divide-y divide-slate-100 dark:divide-slate-800/60">
              {quickLinksToRender.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center justify-between px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-black dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <span className="truncate mr-2">{t(item.name)}</span>
                  {item.hasIcon && <Grid className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
                </Link>
              ))}
            </div>
          </div>

          {/* Center Column: Big Auto-playing Main Banner Slider */}
          <div className="lg:col-span-6 relative w-full overflow-hidden border border-slate-200/60 dark:border-slate-800 shadow-xs flex min-h-[380px] sm:min-h-[415px]">
            {slidesToRender.length > 0 ? (
              <>
                <Carousel
                  setApi={setApi}
                  plugins={[plugin.current]}
                  className="w-full flex-1"
                  onMouseEnter={plugin.current.stop}
                  onMouseLeave={plugin.current.reset}
                >
                  <CarouselContent>
                    {slidesToRender.map((slide) => (
                      <CarouselItem key={slide.id}>
                        <div
                          className="w-full h-[380px] sm:h-[415px] p-6 sm:p-8 flex flex-row items-center justify-between relative overflow-hidden text-white"
                          style={{ background: slide.bg }}
                        >
                          {/* Left Promo Text & Badges (Dynamic from Database/API) */}
                          <div className="flex flex-col justify-center max-w-[240px] sm:max-w-[280px] z-10 space-y-2">
                            {/* Dynamic Curved Badge */}
                            {slide.badge && (
                              <div className="bg-rose-600/90 text-white font-extrabold text-[9px] sm:text-[10px] px-2.5 py-1 rounded w-fit uppercase tracking-wider shadow-xs">
                                {slide.badge}
                              </div>
                            )}

                            {/* Dynamic Discount & Title */}
                            {(slide.discount || slide.title) && (
                              <div className="relative my-1">
                                {slide.discount && (
                                  <div className="text-5xl sm:text-6xl font-black tracking-tighter leading-none text-white drop-shadow-md">
                                    {slide.discount.includes("%")
                                      ? slide.discount.replace("%", "")
                                      : slide.discount}
                                    <span className="text-xl sm:text-2xl font-bold align-top ml-1">% off</span>
                                  </div>
                                )}
                                {slide.title && (
                                  <div className="bg-purple-900/80 text-amber-300 font-extrabold text-[10px] sm:text-xs px-2 py-0.5 rounded uppercase tracking-widest w-fit mt-1">
                                    {t(slide.title)}
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Dynamic Subtitle */}
                            {slide.subtitle && (
                              <p className="text-[11px] sm:text-xs font-semibold text-white/90 uppercase tracking-wide">
                                {slide.subtitle}
                              </p>
                            )}

                            {/* Persistent Shop Now Button */}
                            <Link
                              href={slide.link}
                              className="mt-3 inline-flex items-center gap-1.5 bg-white text-slate-900 hover:bg-slate-100 font-black text-xs px-4 py-2.5 rounded shadow-md transition-transform active:scale-95 w-fit uppercase cursor-pointer"
                            >
                              <span>{t("shop_now", "SHOP NOW")}</span>
                              <ArrowRight className="w-3.5 h-3.5 text-slate-900" />
                            </Link>
                          </div>

                          {/* Right Big Product Graphic */}
                          <div className="flex-1 h-full flex items-end justify-end z-10 pl-2">
                            <BannerSlideImage
                              src={(slide as any).image}
                              fallback={slide.fallbackImage || techBundleImg}
                              alt={slide.title}
                            />
                          </div>
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                </Carousel>

                {/* Slider Dots */}
                {count > 1 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20">
                    {Array.from({ length: count }).map((_, index) => (
                      <button
                        key={index}
                        onClick={() => api?.scrollTo(index)}
                        className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                          index === current
                            ? "w-6 bg-white shadow-sm"
                            : "w-2 bg-white/50 hover:bg-white/80"
                        }`}
                        aria-label={`Go to slide ${index + 1}`}
                      />
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="w-full h-full p-8 sm:p-10 flex flex-col justify-center items-start bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white">
                <span className="bg-primary/30 text-primary-200 border border-primary/40 text-[11px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider mb-3">
                  Bangla Bazar Online Shopping
                </span>
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight mb-2">
                  Welcome to Bangla Bazar
                </h2>
                <p className="text-slate-300 text-xs sm:text-sm max-w-sm mb-6">
                  Browse thousands of verified products from top sellers across Bangladesh.
                </p>
                <Link
                  href="/products"
                  className="bg-primary hover:bg-blue-600 text-white font-bold px-5 py-2.5 rounded-lg shadow-md transition-all text-xs inline-flex items-center gap-2"
                >
                  <span>{t("shop_now", "Shop Now")}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>

          {/* Right Column: Dynamic Right Promo Banner or 3 Fallback Promo Cards */}
          {rightBanners.length > 0 ? (
            <div className="lg:col-span-3 flex flex-col justify-between gap-3 h-full">
              {rightBanners.slice(0, 3).map((rb, idx) => {
                const bg =
                  idx % 3 === 0
                    ? "bg-[#e11d48] text-white"
                    : idx % 3 === 1
                    ? "bg-[#1e293b] text-white"
                    : "bg-[#eab308] text-slate-900";

                const btnClass =
                  idx % 3 === 2
                    ? "bg-black/20 hover:bg-black/30 text-white"
                    : "bg-white/20 hover:bg-white/30 text-white";

                const subtitleClass =
                  idx % 3 === 2 ? "text-slate-800" : "text-white/80";

                const fallbackImg =
                  idx % 3 === 0 ? laptopsImg : headphoneImg;

                return (
                  <div
                    key={rb.id || idx}
                    className={`${bg} p-4 rounded flex items-center justify-between overflow-hidden shadow-xs hover:shadow-md transition-all group flex-1 min-h-[110px]`}
                  >
                    <div className="space-y-1 z-10 max-w-[140px] sm:max-w-[150px]">
                      {rb.title && (
                        <h4 className="text-[11px] font-black tracking-tight uppercase leading-tight truncate">
                          {rb.title}
                        </h4>
                      )}
                      {rb.subtitle && (
                        <p className={`text-[10px] ${subtitleClass} font-medium leading-tight truncate`}>
                          {rb.subtitle}
                        </p>
                      )}
                      <Link
                        href={rb.link || "/products"}
                        className={`inline-block text-[10px] font-bold ${btnClass} px-2.5 py-1 rounded transition-colors mt-1`}
                      >
                        {t("shop_collection", "Shop Collection")}
                      </Link>
                    </div>

                    <div className="relative w-20 h-20 shrink-0 flex items-center justify-center">
                      {rb.imageUrl || rb.photo ? (
                        <img
                          src={rb.imageUrl || rb.photo}
                          alt={rb.title || "Promo banner"}
                          className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300 drop-shadow-md"
                        />
                      ) : (
                        <Image
                          src={fallbackImg}
                          alt={rb.title || "Promo banner"}
                          className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300 drop-shadow-md"
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="lg:col-span-3 flex flex-col justify-between gap-3 h-full">
              {/* Card 1: SONY TELEVISION */}
              <div className="bg-[#e11d48] text-white p-4 rounded flex items-center justify-between overflow-hidden shadow-xs hover:shadow-md transition-all group flex-1">
                <div className="space-y-1 z-10">
                  <h4 className="text-[11px] font-black tracking-tight uppercase">SONY TELEVISION</h4>
                  <p className="text-[10px] text-white/80 font-medium">Start from ৳2,999</p>
                  <Link
                    href="/products?category=electronics"
                    className="inline-block text-[10px] font-bold bg-white/20 hover:bg-white/30 text-white px-2.5 py-1 rounded transition-colors mt-1"
                  >
                    {t("shop_collection")}
                  </Link>
                </div>
                <div className="relative w-20 h-20 shrink-0 flex items-center justify-center">
                  <Image
                    src={laptopsImg}
                    alt="Sony Television"
                    className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300 drop-shadow-md"
                  />
                </div>
              </div>

              {/* Card 2: SAMSUNG MOBILE */}
              <div className="bg-[#1e293b] text-white p-4 rounded flex items-center justify-between overflow-hidden shadow-xs hover:shadow-md transition-all group flex-1">
                <div className="space-y-1 z-10">
                  <h4 className="text-[11px] font-black tracking-tight uppercase">SAMSUNG MOBILE</h4>
                  <p className="text-[10px] text-white/80 font-medium">Start from ৳5,000</p>
                  <Link
                    href="/products?category=smartphones"
                    className="inline-block text-[10px] font-bold bg-white/20 hover:bg-white/30 text-white px-2.5 py-1 rounded transition-colors mt-1"
                  >
                    {t("shop_collection")}
                  </Link>
                </div>
                <div className="relative w-20 h-20 shrink-0 flex items-center justify-center">
                  <Image
                    src={headphoneImg}
                    alt="Samsung Mobile"
                    className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300 drop-shadow-md"
                  />
                </div>
              </div>

              {/* Card 3: BEATS PHONE */}
              <div className="bg-[#eab308] text-slate-900 p-4 rounded flex items-center justify-between overflow-hidden shadow-xs hover:shadow-md transition-all group flex-1">
                <div className="space-y-1 z-10">
                  <h4 className="text-[11px] font-black tracking-tight uppercase text-slate-950">BEATS AUDIO</h4>
                  <p className="text-[10px] text-slate-800 font-medium">Start from ৳3,999</p>
                  <Link
                    href="/products?category=audio"
                    className="inline-block text-[10px] font-bold bg-black/20 hover:bg-black/30 text-white px-2.5 py-1 rounded transition-colors mt-1"
                  >
                    {t("shop_collection")}
                  </Link>
                </div>
                <div className="relative w-20 h-20 shrink-0 flex items-center justify-center">
                  <Image
                    src={headphoneImg}
                    alt="Beats Audio"
                    className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300 drop-shadow-md"
                  />
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Bottom Horizontal Service/Trust Badges Bar */}
        <div className="w-full bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded p-4 shadow-xs">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 dark:divide-slate-800">
            {trustItems.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className={`flex items-center gap-3 ${idx !== 0 ? "pt-3 sm:pt-0 sm:pl-4" : ""}`}>
                  <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center shrink-0 border border-slate-100 dark:border-slate-700">
                    <Icon className="w-5 h-5 text-amber-500" />
                  </div>
                  <div>
                    <h5 className="text-[11px] font-black text-slate-800 dark:text-slate-100 tracking-tight">{item.title}</h5>
                    <p className="text-[10px] text-slate-400 font-medium">{item.sub}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};

export default HeroBannerSection;