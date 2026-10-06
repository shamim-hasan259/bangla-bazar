"use client";


import Image from "next/image";

const Loading = () => {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white dark:bg-slate-950 select-none">
      <div className="relative flex items-center justify-center w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36">
        {/* 360 Degree Rotating Loading Ring */}
        <div className="absolute inset-0 rounded-full border-[3px] border-slate-100 dark:border-slate-850 border-t-[#36d7b7] border-r-[#36d7b7] animate-spin" />

        {/* Bag Logo */}
        <div className="relative w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 animate-pulse">
          <Image
            src="/loading-logo.png"
            alt="Bangla Bazar"
            fill
            className="object-contain"
            priority
          />
        </div>
      </div>
    </div>
  );
};

export default Loading;
