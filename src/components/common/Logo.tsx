import { cn } from "@/lib/utils";
import Link from "next/link";
import React from "react";
import BanglaBazarLogoSvg from "./BanglaBazarLogoSvg";

export interface LogoProps {
  className?: string;
  imageClassName?: string;
  variant?: "default" | "light" | "white";
  showTagline?: boolean;
  showIcon?: boolean;
  subtitle?: string;
  href?: string;
  hideBackground?: boolean;
}

const Logo: React.FC<LogoProps> = ({
  className,
  imageClassName,
  subtitle,
  href = "/",
  hideBackground = true,
}) => {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex flex-col justify-center items-start select-none shrink-0",
        className
      )}
      aria-label="Bangla Bazar Home"
    >
      <div
        className={cn(
          "relative flex items-center justify-start h-[36px] sm:h-[40px] md:h-[44px] w-auto max-w-[220px] shrink-0",
          imageClassName
        )}
      >
        <BanglaBazarLogoSvg
          className="h-full w-auto max-w-full object-contain"
          hideBackground={hideBackground}
        />
      </div>

      {subtitle && (
        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium leading-none pl-1 tracking-wider mt-1.5">
          {subtitle}
        </span>
      )}
    </Link>
  );
};

export default Logo;