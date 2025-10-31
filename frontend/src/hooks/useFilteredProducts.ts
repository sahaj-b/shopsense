import type { Product } from "@/lib/query";

export function useFilteredProducts(
  products: Product[],
  searchParams: URLSearchParams,
) {
  const search = searchParams.get("search");
  const category = searchParams.get("category");
  const minRating = parseFloat(searchParams.get("minRating") || "0");
  const minReviews = parseInt(searchParams.get("minReviews") || "0", 10);
  const sortBy = searchParams.get("sortBy") || "default";

  function searchProducts(products: Product[], query: string): Product[] {
    const q = query.toLowerCase();
    return products.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q),
    );
  }
  let filteredProducts = search ? searchProducts(products, search) : products;
  if (category) {
    filteredProducts = filteredProducts.filter(
      (p) => p.category.toLowerCase() === category.toLowerCase(),
    );
  }
  if (minRating > 0) {
    filteredProducts = filteredProducts.filter(
      (p) => p.rating && p.rating >= minRating,
    );
  }
  if (minReviews > 0) {
    filteredProducts = filteredProducts.filter(
      (p) => p.rating && p.rateCount >= minReviews,
    );
  }
  switch (sortBy) {
    case "price-asc":
      filteredProducts = [...filteredProducts].sort(
        (a, b) => a.price - b.price,
      );
      break;
    case "price-desc":
      filteredProducts = [...filteredProducts].sort(
        (a, b) => b.price - a.price,
      );
      break;
    case "rating":
      filteredProducts = [...filteredProducts].sort(
        (a, b) => (b.rating || 0) - (a.rating || 0),
      );
      break;
    case "reviews":
      filteredProducts = [...filteredProducts].sort(
        (a, b) => (b.rateCount || 0) - (a.rateCount || 0),
      );
      break;
    default:
      break;
  }

  return {
    filteredProducts,
    search,
    category,
    minRating,
    minReviews,
    sortBy,
  };
}
