import React from 'react';

const TopPromoBar = () => {
  return (
    <div className="w-full bg-[#f8f8f8] border-b border-gray-200">
      <div className="container mx-auto px-4 py-1 flex justify-end items-center gap-6 text-[12px] text-gray-600">
        <a href="#" className="hover:text-[#f57224]">SAVE MORE ON APP</a>
        <a href="#" className="hover:text-[#f57224]">SELL ON Bangla Bazar</a>
        <a href="#" className="hover:text-[#f57224]">CUSTOMER CARE</a>
        <a href="#" className="hover:text-[#f57224]">TRACK MY ORDER</a>
        <a href="#" className="hover:text-[#f57224]">LOGIN</a>
        <a href="#" className="hover:text-[#f57224]">SIGNUP</a>
        <a href="#" className="hover:text-[#f57224]">ভাষা</a>
      </div>
    </div>
  );
};

export default TopPromoBar;
