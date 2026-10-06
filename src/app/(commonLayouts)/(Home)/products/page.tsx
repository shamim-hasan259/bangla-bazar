import type { Metadata } from "next";
import React, { Suspense } from "react";
import prisma from "@/index";
import ProductCard from "@/components/home/ProductCard";
import Category from "./_components/Category";
import ProductsPagination from "./_components/ProductsPagination";
import ProductsToolbar from "./_components/ProductsToolbar";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}): Promise<Metadata> {
  const params = await searchParams;
  const search = typeof params.search === "string" ? params.search : undefined;
  const category = typeof params.category === "string" ? params.category : undefined;
  const brand = typeof params.brand === "string" ? params.brand : undefined;

  let title = "All Products | Bangla Bazar Online Shopping";
  let description = "Browse thousands of authentic products from verified sellers in Bangladesh. Electronics, fashion, groceries, and more.";

  if (search) {
    title = `Search Results for "${search}" | Bangla Bazar`;
    description = `Find the best deals and lowest prices for "${search}" on Bangla Bazar Bangladesh.`;
  } else if (category) {
    title = `Shop by Category | Bangla Bazar Online Shopping`;
    description = `Discover top deals in category products on Bangla Bazar. Fast cash on delivery across Bangladesh.`;
  } else if (brand) {
    title = `Authentic Brand Store | Bangla Bazar`;
    description = `Buy 100% original products from authorized brand sellers on Bangla Bazar.`;
  }

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

async function getCategoryWhereClause(categoryId?: string) {
  if (!categoryId) return null;

  // 1. If 24-character hexadecimal ObjectId: recursively include all child/grandchild category IDs
  if (categoryId.match(/^[0-9a-fA-F]{24}$/)) {
    const allCategoryIds = [categoryId];
    try {
      const level1 = await prisma.category.findMany({
        where: { parentId: categoryId },
        select: { id: true },
      });
      const level1Ids = level1.map((c) => c.id);
      allCategoryIds.push(...level1Ids);
      if (level1Ids.length > 0) {
        const level2 = await prisma.category.findMany({
          where: { parentId: { in: level1Ids } },
          select: { id: true },
        });
        allCategoryIds.push(...level2.map((c) => c.id));
      }
    } catch (_) {}
    return {
      OR: [
        { categoryId: { in: allCategoryIds } },
        { masterCategoryId: { in: allCategoryIds } },
      ],
    };
  }

  // 2. If it's a slug/name/key (e.g. "electronics", "fashion", "watches", "audio", "beauty", "laptops", "mens-tshirt", "mens-pant")
  try {
    const matchedCats = await prisma.category.findMany({
      where: {
        OR: [
          { id: categoryId },
          { code: { contains: categoryId, mode: "insensitive" } },
          { name: { contains: categoryId, mode: "insensitive" } },
        ],
      },
      select: { id: true },
    });
    if (matchedCats.length > 0) {
      const catIds = matchedCats.map((c) => c.id);
      const level1 = await prisma.category.findMany({
        where: { parentId: { in: catIds } },
        select: { id: true },
      });
      catIds.push(...level1.map((c) => c.id));
      return {
        OR: [
          { categoryId: { in: catIds } },
          { masterCategoryId: { in: catIds } },
          { category: { is: { name: { contains: categoryId, mode: "insensitive" } } } },
          { name: { contains: categoryId, mode: "insensitive" } },
        ],
      };
    }
  } catch (_) {}

  // 3. Fallback search by category name or product name/description
  return {
    OR: [
      { category: { is: { name: { contains: categoryId, mode: "insensitive" } } } },
      { name: { contains: categoryId, mode: "insensitive" } },
      { description: { contains: categoryId, mode: "insensitive" } },
    ],
  };
}

function buildProductWhere(categoryClause: any, search?: string) {
  const andConditions: any[] = [
    { status: "Active" },
  ];

  if (categoryClause) {
    andConditions.push(categoryClause);
  }

  if (search) {
    andConditions.push({
      OR: [
        ...(search.match(/^[0-9a-fA-F]{24}$/) ? [{ id: search }] : []),
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { category: { is: { name: { contains: search, mode: "insensitive" } } } },
      ],
    });
  }

  return { AND: andConditions };
}

async function ProductsList({
  categoryId,
  search,
  page,
  perPage,
}: {
  categoryId?: string;
  search?: string;
  page: number;
  perPage: number;
}) {
  const skip = (page - 1) * perPage;
  const categoryClause = await getCategoryWhereClause(categoryId);
  const where = buildProductWhere(categoryClause, search);

  const products = await prisma.product.findMany({
    where: where as any,
    include: {
      brand: true,
      category: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    skip,
    take: perPage,
  });

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center w-full bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 text-black dark:text-white flex items-center justify-center mb-4">
          <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <h2 className="text-xl sm:text-2xl font-black mb-2 text-slate-900 dark:text-slate-100">
          {search ? `No products found for "${search}"` : "No products found"}
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mb-6">
          We couldn&apos;t find any items matching your exact search. Try checking your spelling or explore other popular categories.
        </p>
        <div className="flex items-center gap-3">
          <a
            href="/products"
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-extrabold shadow-sm transition-all"
          >
            Browse All Products
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-3 md:gap-4">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product as any}
        />
      ))}
    </div>
  );
}

const AllProducts = async ({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; search?: string; page?: string; perPage?: string }>;
}) => {
  const params = await searchParams;
  const categoryId = params.category;
  const search = params.search;
  const page = parseInt(params.page || "1");
  const perPage = parseInt(params.perPage || "20");
  const categoryClause = await getCategoryWhereClause(categoryId);
  const where = buildProductWhere(categoryClause, search);

  // Get total count for pagination
  const totalCount = await prisma.product.count({
    where: where as any,
  });

  const totalPages = Math.ceil(totalCount / perPage);

  return (
    <div className="bg-slate-50 dark:bg-slate-950 min-h-screen py-4">
      <div className="container mx-auto px-4">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sidebar - Desktop */}
          <aside className="hidden lg:block lg:col-span-3 space-y-8 relative z-30">
            <div className="sticky top-24 space-y-8">
              <Category />
            </div>
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-9">
            {/* Toolbar */}
            <ProductsToolbar currentPerPage={perPage} categoryId={categoryId} />

            {/* List */}
            <Suspense
              key={`${categoryId || ""}-${search || ""}-${page}-${perPage}`}
              fallback={
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-3 md:gap-4">
                  {[...Array(8)].map((_, i) => (
                    <div
                      key={i}
                      className="bg-white dark:bg-slate-900 rounded-sm h-[320px] animate-pulse border border-slate-100 dark:border-slate-800"
                    />
                  ))}
                </div>
              }
            >
              <ProductsList categoryId={categoryId} search={search} page={page} perPage={perPage} />
            </Suspense>

            {/* Pagination */}
            <div className="mt-12">
              <ProductsPagination
                totalPages={totalPages}
                currentPage={page}
                perPage={perPage}
                categoryId={categoryId}
              />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default AllProducts;