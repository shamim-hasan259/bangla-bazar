"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import axios from "axios";

interface StoreData {
  id: string;
  storeNameBn: string;
  storeNameEn: string;
  storeName: string;
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
}

interface SellerStoreContextType {
  storeId: string | null;
  storeData: StoreData | null;
  loading: boolean;
  error: string | null;
}

const SellerStoreContext = createContext<SellerStoreContextType | undefined>(undefined);

export function SellerStoreProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [storeData, setStoreData] = useState<StoreData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Extract storeId if in store-dashboard route context
  // e.g., /dashboard/seller/store-dashboard/[storeId]/...
  const pathParts = pathname?.split("/") || [];
  const storeIdx = pathParts.findIndex((part) => part === "store-dashboard");
  const storeId = storeIdx !== -1 ? pathParts[storeIdx + 1] : null;

  useEffect(() => {
    // If there is no store ID in the path, clear any previous store data
    if (!storeId) {
      setStoreData(null);
      setError(null);
      setLoading(false);
      return;
    }

    // Check if the storeId is a valid 24-character hexadecimal MongoDB ObjectId
    const isMongoId = /^[0-9a-fA-F]{24}$/.test(storeId);
    if (!isMongoId) {
      return;
    }

    // Fetch store details if the active storeId changed or was not loaded
    if (storeData?.id === storeId) {
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError(null);

    axios
      .get(`/api/store/${storeId}`)
      .then((res) => {
        if (!isMounted) return;
        if (res.data?.success) {
          setStoreData(res.data.data);
        } else {
          setError(res.data?.error || "Failed to load store information");
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error("Error fetching store info in context:", err);
        setError(err.message || "Failed to fetch store details");
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [storeId, storeData?.id]);

  return (
    <SellerStoreContext.Provider value={{ storeId, storeData, loading, error }}>
      {children}
    </SellerStoreContext.Provider>
  );
}

export function useSellerStore() {
  const context = useContext(SellerStoreContext);
  if (context === undefined) {
    throw new Error("useSellerStore must be used within a SellerStoreProvider");
  }
  return context;
}
