"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { ProductCard } from "@/components/product-card";
import { searchProducts } from "@/lib/api";
import { useProducts } from "@/lib/queries";

export default function Home() {
  const searchParams = useSearchParams();
  const search = searchParams.get("search");
  const { data: products = [], isLoading, error } = useProducts();

  const filteredProducts = search ? searchProducts(products, search) : products;

  if (isLoading) {
    return (
      <main className="min-h-screen bg-background text-foreground py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold tracking-tight">Shop</h1>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-64 bg-muted rounded animate-pulse" />
            ))}
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-background text-foreground py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center py-12">
            <p className="text-lg text-red-500">Failed to load products</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight">
            {search ? `Search Results for "${search}"` : "Shop"}
          </h1>
          <p className="text-muted-foreground mt-2">
            {filteredProducts.length} products found
          </p>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <p className="text-lg text-muted-foreground">No products found.</p>
          </div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            <AnimatePresence mode="popLayout">
              {filteredProducts.map((product) => (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </main>
  );
}
