import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getCategories, getProductById, getProducts, getProductsByCategory, type Product } from "./api";

export const PRODUCTS_QUERY_KEY = ["products"];
export const PRODUCT_DETAIL_QUERY_KEY = (id: number) => ["product", id];
export const CATEGORIES_QUERY_KEY = ["categories"];
export const PRODUCTS_BY_CATEGORY_QUERY_KEY = (category: string) => ["products", "category", category];
export const CART_QUERY_KEY = ["cart"];

export function useProducts() {
  return useQuery({
    queryKey: PRODUCTS_QUERY_KEY,
    queryFn: getProducts,
    staleTime: 1000 * 60 * 60,
  });
}

export function useProductById(id: number) {
  const queryClient = useQueryClient();
  
  return useQuery({
    queryKey: PRODUCT_DETAIL_QUERY_KEY(id),
    queryFn: () => {
      const productsCache = queryClient.getQueryData<Product[]>(PRODUCTS_QUERY_KEY);
      if (productsCache) {
        const product = productsCache.find(p => p.id === id);
        if (product) return product;
      }
      return getProductById(id);
    },
    staleTime: 1000 * 60 * 60,
    enabled: id > 0,
  });
}

export function useCategories() {
  return useQuery({
    queryKey: CATEGORIES_QUERY_KEY,
    queryFn: getCategories,
    staleTime: 1000 * 60 * 60,
  });
}

export function useProductsByCategory(category: string) {
  return useQuery({
    queryKey: PRODUCTS_BY_CATEGORY_QUERY_KEY(category),
    queryFn: () => getProductsByCategory(category),
    staleTime: 1000 * 60 * 60,
    enabled: Boolean(category),
  });
}

export interface CartItem {
  id: number;
  title: string;
  price: number;
  image: string;
  quantity: number;
}

export function useCart() {
  const queryClient = useQueryClient();

  const cartQuery = useQuery({
    queryKey: CART_QUERY_KEY,
    queryFn: () => {
      const stored = localStorage.getItem("cart");
      return stored ? JSON.parse(stored) : ([] as CartItem[]);
    },
    initialData: [] as CartItem[],
    staleTime: Infinity,
  });

  const addItemMutation = useMutation({
    mutationFn: async (product: Omit<CartItem, "quantity">) => {
      const current = queryClient.getQueryData<CartItem[]>(CART_QUERY_KEY) || [];
      const existing = current.find((item) => item.id === product.id);
      const updated = existing
        ? current.map((item) =>
            item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item,
          )
        : [...current, { ...product, quantity: 1 }];
      localStorage.setItem("cart", JSON.stringify(updated));
      return updated;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(CART_QUERY_KEY, data);
    },
  });

  const removeItemMutation = useMutation({
    mutationFn: async (id: number) => {
      const current = queryClient.getQueryData<CartItem[]>(CART_QUERY_KEY) || [];
      const updated = current.filter((item) => item.id !== id);
      localStorage.setItem("cart", JSON.stringify(updated));
      return updated;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(CART_QUERY_KEY, data);
    },
  });

  const updateQuantityMutation = useMutation({
    mutationFn: async ({ id, quantity }: { id: number; quantity: number }) => {
      const current = queryClient.getQueryData<CartItem[]>(CART_QUERY_KEY) || [];
      if (quantity <= 0) {
        const updated = current.filter((item) => item.id !== id);
        localStorage.setItem("cart", JSON.stringify(updated));
        return updated;
      }
      const updated = current.map((item) =>
        item.id === id ? { ...item, quantity } : item,
      );
      localStorage.setItem("cart", JSON.stringify(updated));
      return updated;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(CART_QUERY_KEY, data);
    },
  });

  const clearCartMutation = useMutation({
    mutationFn: async () => {
      localStorage.removeItem("cart");
      return [] as CartItem[];
    },
    onSuccess: (data) => {
      queryClient.setQueryData(CART_QUERY_KEY, data);
    },
  });

  const items = cartQuery.data || [];
  const total = items.reduce((sum: number, item: CartItem) => sum + item.price * item.quantity, 0);
  const itemCount = items.reduce((count: number, item: CartItem) => count + item.quantity, 0);

  return {
    items,
    total,
    itemCount,
    addItem: addItemMutation.mutate,
    removeItem: removeItemMutation.mutate,
    updateQuantity: (id: number, quantity: number) =>
      updateQuantityMutation.mutate({ id, quantity }),
    clearCart: clearCartMutation.mutate,
    isLoading:
      addItemMutation.isPending ||
      removeItemMutation.isPending ||
      updateQuantityMutation.isPending ||
      clearCartMutation.isPending,
  };
}
