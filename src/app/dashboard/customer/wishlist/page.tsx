import React from "react";
import WishlistGrid from "./_components/WishlistGrid";

const DashboardWishlist = () => {
  return (
    <div className="container mx-auto py-10 pt-14 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">My Wishlist</h1>
        <p className="text-muted-foreground mt-1">Products you've saved for later.</p>
      </div>

      <WishlistGrid />
    </div>
  );
};

export default DashboardWishlist;
