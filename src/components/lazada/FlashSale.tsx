import React from 'react';
import ProductCard from './ProductCard';

interface FlashSaleProps {
  products: any[];
}

const FlashSale = ({ products }: FlashSaleProps) => {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="bg-white p-4 rounded-sm">
        <div className="flex items-center justify-between mb-4 border-b pb-3">
          <div className="flex items-center gap-6">
            <h2 className="text-[#f57224] text-[18px] font-medium uppercase">Flash Sale</h2>
            <div className="flex items-center gap-2">
              <span className="text-[14px] text-gray-800">Ending in</span>
              <div className="flex gap-1">
                <span className="bg-[#f57224] text-white px-1.5 py-0.5 rounded-sm font-bold text-[14px]">12</span>
                <span className="text-[#f57224]">:</span>
                <span className="bg-[#f57224] text-white px-1.5 py-0.5 rounded-sm font-bold text-[14px]">45</span>
                <span className="text-[#f57224]">:</span>
                <span className="bg-[#f57224] text-white px-1.5 py-0.5 rounded-sm font-bold text-[14px]">08</span>
              </div>
            </div>
          </div>
          <button className="text-[#f57224] border border-[#f57224] px-4 py-1.5 text-[14px] font-medium uppercase hover:bg-[#f57224] hover:text-white transition-colors">
            Shop All Products
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {products.slice(0, 6).map((product) => (
            <ProductCard 
              key={product.id} 
              product={product} 
              showProgress={true} 
              soldCount={Math.floor(Math.random() * 10)} 
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default FlashSale;
