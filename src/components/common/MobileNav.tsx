"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, ChevronDown, ChevronRight, Home, ShoppingBag, Percent, Zap, Flame, MapPin } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import Logo from "./Logo";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/context/LanguageContext";

interface Category {
  id: string;
  name: string;
  subcategories?: Category[];
}

const MobileNav = ({ categories = [] }: { categories?: any[] }) => {
  const [open, setOpen] = useState(false);
  const { t } = useLanguage();
  
  const navLinks = [
    { label: t("home"), path: "/", icon: Home },
    { label: t("all_products", "All Products"), path: "/products", icon: ShoppingBag },
    { label: t("deals", "Deals"), path: "/deals", icon: Zap },
    { label: t("offers", "Offers"), path: "/offers", icon: Percent },
    { label: t("trending", "Trending"), path: "/trending", icon: Flame }
  ];

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] sm:w-[350px] p-0 flex flex-col">
        <SheetHeader className="p-4 border-b">
           <div className="flex items-center gap-2">
            <Logo />
           </div>
        </SheetHeader>
        
        <ScrollArea className="flex-1">
          <div className="flex flex-col gap-6 p-4">
            {/* Main Navigation Links */}
            <div className="flex flex-col gap-1">
               <h3 className="text-sm font-medium text-muted-foreground mb-2 px-2">{t("menu", "Menu")}</h3>
               {navLinks.map((link, index) => (
                 <Link 
                   key={index} 
                   href={link.path}
                   onClick={() => setOpen(false)}
                   className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-medium transition-colors"
                 >
                    <link.icon className="h-4  text-primary" />
                    {link.label}
                 </Link>
               ))}
            </div>

             {/* Categories Section */}
            <div className="flex flex-col gap-1">
              <h3 className="text-sm font-medium text-muted-foreground mb-2 px-2">{t("all_categories", "Categories")}</h3>
              {categories.map((category) => (
                <Collapsible key={category.id} className="w-full">
                  <CollapsibleTrigger className="flex items-center justify-between w-full px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-medium transition-colors group">
                    <span className="flex items-center gap-2">
                      {t(category.name, category.name)}
                    </span>
                    {category.subcategories && category.subcategories.length > 0 && (
                      <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
                    )}
                  </CollapsibleTrigger>
                  
                  {category.subcategories && category.subcategories.length > 0 && (
                    <CollapsibleContent className="pl-4 space-y-1 mt-1">
                      {category.subcategories.map((sub: any) => (
                        <Link
                          key={sub.id}
                          href={`/products?category=${sub.id}`}
                          onClick={() => setOpen(false)}
                          className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-sm text-slate-600 dark:text-slate-400 font-normal transition-colors"
                        >
                          {t(sub.name, sub.name)}
                          <ChevronRight className="h-3 w-3 opacity-50" />
                        </Link>
                      ))}
                    </CollapsibleContent>
                  )}
                   {(!category.subcategories || category.subcategories.length === 0) && (
                       // Link for categories without subcategories (if logic desired)
                       <></>
                   )}
                </Collapsible>
              ))}
              <Link
                href="/products"
                onClick={() => setOpen(false)}
                 className="flex items-center justify-center py-2.5 px-3 rounded-lg bg-primary/5 hover:bg-primary/10 cursor-pointer text-primary text-sm font-bold mt-2"
              >
                {t("view_all_categories", "View All Categories")}
              </Link>
            </div>
            
            {/* Store Location */}
            <div className="mt-auto border-t pt-4">
                <div className="flex items-center gap-3 px-2">
                    <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <MapPin size={18} className="text-green-600" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Outlet</p>
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-200">Dhaka Main Store</p>
                    </div>
                </div>
            </div>

          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export default MobileNav;
