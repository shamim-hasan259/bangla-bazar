"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import defaultImage from "../../../public/img/demoFan.jpg";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import ProductCard from "./ProductCard";

function ProductList({ productData }: { productData: any[] }) {
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(12);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  useEffect(() => {
    // Fetch wishlist from localStorage on component mount
    const storedWishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");
    setWishlist(storedWishlist);
  }, []);

  const addToWishlist = (product: any) => {
    const newWishlist = [...wishlist, product];
    setWishlist(newWishlist);
    localStorage.setItem("wishlist", JSON.stringify(newWishlist));
    console.log("Product added to wishlist", product);
  };

  const removeFromWishlist = (product: any) => {
    const updatedWishlist = wishlist.filter(
      (item) => item.name !== product.name
    );
    setWishlist(updatedWishlist);
    localStorage.setItem("wishlist", JSON.stringify(updatedWishlist));
    console.log("Product removed from wishlist", product);
  };

  const isProductInWishlist = (product: any) => {
    return wishlist.some((item) => item.name === product.name);
  };

  const toggleWishlist = (product: any) => {
    if (isProductInWishlist(product)) {
      removeFromWishlist(product);
    } else {
      addToWishlist(product);
    }
  };

  // Get unique categories from product data
  const categories = Array.from(
    new Set(productData.map((product) => product.category.name))
  );

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const filteredItems = productData
    .filter((product) => {
      const matchesSearch = product.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory
        ? product.category.name === selectedCategory
        : true;
      return matchesSearch && matchesCategory;
    })
    .slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1); // Reset to first page when selecting category
  };

  return (
    <div className="flex flex-col items-center">
      <div className="container flex flex-col items-center">
        {/* Search and Category Filter */}
        <div className="flex w-full mb-4 items-center space-x-2 mt-4 justify-between">
          <input
            type="text"
            placeholder="Search by product name"
            value={searchTerm}
            onChange={handleSearch}
            className="w-full max-w-lg p-2 border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          />
          <div>
            {categories.map((category) => (
              <Button
                key={category}
                onClick={() => handleCategoryClick(category)}
                className={`mx-1 px-3 py-1 rounded ${selectedCategory === category
                  ? "bg-primary text-white"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                  }`}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* Product List Section */}
        <div className="w-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 gap-y-10">
          {filteredItems.length > 0 ? (
            filteredItems.map((product, index) => (
              <div key={index} className="h-full">
                <ProductCard product={product} />
              </div>
            ))
          ) : (
            <div>No products match your search</div>
          )}
        </div>

        {/* Pagination */}
        {productData.length > itemsPerPage && (
          <div className="flex justify-center mt-4">
            {Array.from(
              { length: Math.ceil(productData.length / itemsPerPage) },
              (_, index) => (
                <Button
                  key={index}
                  onClick={() => paginate(index + 1)}
                  className={`mx-1 px-3 py-1 rounded ${currentPage === index + 1
                    ? "bg-primary text-white"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                    }`}
                >
                  {index + 1}
                </Button>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductList;
