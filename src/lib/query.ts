import { QueryClient, useQuery } from "@tanstack/react-query";

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 60 * 1000,
      },
    },
  });
}

export interface Product {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
  rating?: {
    rate: number;
    count: number;
  };
}

const API_URL = "https://fakestoreapi.com";

export function useProducts() {
  return useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/products`);
      if (!res.ok) throw new Error("Failed to fetch products");
      return res.json();
    },
  });
}

export function useProductById(id: number) {
  return useQuery<Product>({
    queryKey: ["product", id],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/products/${id}`);
      if (!res.ok) throw new Error("Failed to fetch product");
      return res.json();
    },
  });
}

export function useCategories() {
  return useQuery<string[]>({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/products/categories`);
      if (!res.ok) throw new Error("Failed to fetch categories");
      return res.json();
    },
  });
}

export function useProductsByCategory(category: string) {
  return useQuery<Product[]>({
    queryKey: ["products", category],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/products/category/${category}`);
      if (!res.ok) throw new Error("Failed to fetch products by category");
      return res.json();
    },
  });
}
