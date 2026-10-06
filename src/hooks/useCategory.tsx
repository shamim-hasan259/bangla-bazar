"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { ProductCategory } from "@/types/interface";

const useCategory = () => {
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const { data } = await axios.get("/api/category");
        setCategories(data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategory();
  }, []);

  return { categories, error, loading };
};

export default useCategory;
