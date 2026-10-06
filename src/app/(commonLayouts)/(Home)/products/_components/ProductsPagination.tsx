"use client";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

interface ProductsPaginationProps {
  totalPages: number;
  currentPage: number;
  perPage: number;
  categoryId?: string;
}

const ProductsPagination = ({
  totalPages = 1,
  currentPage = 1,
  perPage = 20,
  categoryId,
}: ProductsPaginationProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const safeTotalPages = Math.max(1, totalPages);

  const createPageUrl = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    params.set("perPage", perPage.toString());
    if (categoryId) {
      params.set("category", categoryId);
    }
    return `/products?${params.toString()}`;
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;

    if (safeTotalPages <= maxVisiblePages) {
      for (let i = 1; i <= safeTotalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (currentPage > 3) {
        pages.push("ellipsis-start");
      }

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(safeTotalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < safeTotalPages - 2) {
        pages.push("ellipsis-end");
      }

      pages.push(safeTotalPages);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="py-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200/80 dark:border-slate-800 pt-6">
      {/* Page Info Badge */}
      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
        <span>Showing page</span>
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-900 text-white dark:bg-white dark:text-slate-900 border border-slate-900 dark:border-white">
          {currentPage}
        </span>
        <span>of</span>
        <span className="font-bold text-slate-900 dark:text-slate-100">{safeTotalPages}</span>
      </div>

      {/* Pagination Controls */}
      <Pagination className="mx-0 w-auto">
        <PaginationContent className="gap-1.5 p-1 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          {/* Previous Page */}
          <PaginationItem>
            <PaginationPrevious
              href={currentPage > 1 ? createPageUrl(currentPage - 1) : "#"}
              onClick={(e) => {
                if (currentPage <= 1) {
                  e.preventDefault();
                }
              }}
              className={cn(
                "h-9 px-3.5 rounded-lg text-xs font-bold transition-all border",
                currentPage <= 1
                  ? "pointer-events-none opacity-40 border-transparent text-slate-400"
                  : "bg-white dark:bg-slate-900 text-black dark:text-white border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer shadow-2xs"
              )}
            />
          </PaginationItem>

          {/* Numbered Page Buttons */}
          {pageNumbers.map((page, index) => {
            if (typeof page === "string") {
              return (
                <PaginationItem key={`${page}-${index}`}>
                  <PaginationEllipsis className="h-9 w-9 text-slate-400" />
                </PaginationItem>
              );
            }

            const isActive = currentPage === page;

            return (
              <PaginationItem key={page}>
                <PaginationLink
                  href={createPageUrl(page)}
                  isActive={isActive}
                  className={cn(
                    "h-9 w-9 rounded-lg text-xs font-extrabold transition-all flex items-center justify-center cursor-pointer border",
                    isActive
                      ? "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white hover:bg-black hover:text-white shadow-xs"
                      : "bg-white text-black dark:bg-slate-900 dark:text-white border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 shadow-2xs"
                  )}
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            );
          })}

          {/* Next Page */}
          <PaginationItem>
            <PaginationNext
              href={currentPage < safeTotalPages ? createPageUrl(currentPage + 1) : "#"}
              onClick={(e) => {
                if (currentPage >= safeTotalPages) {
                  e.preventDefault();
                }
              }}
              className={cn(
                "h-9 px-3.5 rounded-lg text-xs font-bold transition-all border",
                currentPage >= safeTotalPages
                  ? "pointer-events-none opacity-40 border-transparent text-slate-400"
                  : "bg-white dark:bg-slate-900 text-black dark:text-white border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer shadow-2xs"
              )}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
};

export default ProductsPagination;
