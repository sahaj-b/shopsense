"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { ProductCard } from "@/components/product-card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StarRating } from "@/components/ui/star-rating";
import { searchProducts } from "@/lib/api";
import { useCategories, useProducts } from "@/lib/queries";

export default function Home() {
  const searchParams = useSearchParams();
  const search = searchParams.get("search");
  const category = searchParams.get("category");
  const minRating = parseFloat(searchParams.get("minRating") || "0");
  const minReviews = parseInt(searchParams.get("minReviews") || "0", 10);
  const sortBy = searchParams.get("sortBy") || "default";
  const router = useRouter();
  const { data: products = [], isLoading, error } = useProducts();
  const { data: categories = [] } = useCategories();

  const filteredProducts = useMemo(() => {
    let result = search ? searchProducts(products, search) : products;

    if (category) {
      result = result.filter(
        (p) => p.category.toLowerCase() === category.toLowerCase(),
      );
    }

    if (minRating > 0) {
      result = result.filter((p) => p.rating && p.rating.rate >= minRating);
    }

    if (minReviews > 0) {
      result = result.filter((p) => p.rating && p.rating.count >= minReviews);
    }

    switch (sortBy) {
      case "price-asc":
        result = [...result].sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        result = [...result].sort((a, b) => b.price - a.price);
        break;
      case "rating":
        result = [...result].sort(
          (a, b) => (b.rating?.rate || 0) - (a.rating?.rate || 0),
        );
        break;
      case "reviews":
        result = [...result].sort(
          (a, b) => (b.rating?.count || 0) - (a.rating?.count || 0),
        );
        break;
      default:
        break;
    }

    return result;
  }, [products, search, category, minRating, minReviews, sortBy]);

  const updateParams = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value && value !== "0" && value !== "default") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/?${params.toString()}`);
  };

  const handleCategoryChange = (selectedCategory: string) => {
    const params = new URLSearchParams(searchParams);
    if (selectedCategory !== "all") {
      params.set("category", selectedCategory);
      params.delete("search");
    } else {
      params.delete("category");
    }
    router.push(`/?${params.toString()}`);
  };

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
        <div className="mb-5 flex flex-wrap gap-3 items-center justify-start">
          <Select
            value={category || "all"}
            onValueChange={handleCategoryChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="h-6 w-px bg-border mr-2 ml-3" />
          <div className="flex gap-2 items-center justify-center">
            <label className="text-sm text-muted-foreground">Min Rating</label>
            <StarRating
              value={minRating}
              onChange={(value) => updateParams("minRating", value.toString())}
            />
          </div>
          <div className="h-6 w-px bg-border ml-1 mr-2" />
          <div className="flex gap-2 items-center justify-center">
            <label className="text-sm text-muted-foreground">Min Reviews</label>
            <Select
              value={minReviews.toString()}
              onValueChange={(value) => updateParams("minReviews", value)}
            >
              <SelectTrigger id="min-reviews">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Any</SelectItem>
                <SelectItem value="10">10+</SelectItem>
                <SelectItem value="50">50+</SelectItem>
                <SelectItem value="100">100+</SelectItem>
                <SelectItem value="200">200+</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="h-6 w-px bg-border ml-3 mr-2" />

          <div className="flex gap-2 items-center justify-center">
            <label className="text-sm text-muted-foreground">Sort By</label>
            <Select
              value={sortBy}
              onValueChange={(value) => updateParams("sortBy", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent align="start">
                <SelectItem value="default">Default</SelectItem>
                <SelectItem value="price-asc">Price: Low to High</SelectItem>
                <SelectItem value="price-desc">Price: High to Low</SelectItem>
                <SelectItem value="rating">Rating: High to Low</SelectItem>
                <SelectItem value="reviews">Reviews: High to Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
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
