import React from 'react';
import { Search, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import Logo from '../common/Logo';

const LazadaHeader = () => {
  return (
    <div className="w-full bg-white sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-8">
        {/* Logo */}
        <div className="flex-shrink-0">
          <Logo className="text-3xl text-[#f57224]" />
        </div>

        {/* Search Bar */}
        <div className="flex-1 flex items-center">
          <div className="flex-1 flex h-11">
            <input
              type="text"
              placeholder="Search in Bangla Bazar"
              className="flex-1 bg-[#eff0f5] px-4 py-2 outline-none rounded-l-sm text-sm"
            />
            <button className="bg-[#f57224] text-white px-5 rounded-r-sm hover:bg-[#d0611e] transition-colors">
              <Search className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Cart & Wallet */}
        <div className="flex items-center gap-8">
          <Link href="/cart" className="relative group">
            <ShoppingCart className="h-7 w-7 text-[#0f136d] group-hover:text-[#f57224] transition-colors" />
            <span className="absolute -top-2 -right-2 bg-[#f57224] text-white text-[10px] px-1.5 py-0.5 rounded-full border-2 border-white">
              0
            </span>
          </Link>
          <div className="hidden lg:block">
            <img 
              src="https://laz-img-cdn.alicdn.com/tfs/TB1_u_6p8v0gK0jSZKbXXbKpgXa-450-120.png" 
              alt="Lazada Wallet" 
              className="h-9"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LazadaHeader;
