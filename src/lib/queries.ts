import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getCategories,
  getProductById,
  getProducts,
  getProductsByCategory,
  type Product,
} from "./api";

export function useProducts() {
  return useQuery({
    queryKey: ["products"],
    queryFn: getProducts,
    staleTime: 1000 * 60 * 60,
  });
}

export function useProductById(id: number) {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ["product", id],
    queryFn: () => {
      const productsCache = queryClient.getQueryData<Product[]>(["products"]);
      if (productsCache) {
        const product = productsCache.find((p) => p.id === id);
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
    queryKey: ["categories"],
    queryFn: getCategories,
    staleTime: 1000 * 60 * 60,
  });
}

export function useProductsByCategory(category: string) {
  return useQuery({
    queryKey: ["products", "category", category],
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
    queryKey: ["cart"],
    queryFn: () => {
      const stored = localStorage.getItem("cart");
      console.log("cartQuery queryFn running, stored:", stored);
      return stored ? JSON.parse(stored) : ([] as CartItem[]);
    },
    initialData: (() => {
      const stored = localStorage.getItem("cart");
      return stored ? JSON.parse(stored) : ([] as CartItem[]);
    })(),
    staleTime: Infinity,
  });

  const addItemMutation = useMutation({
    mutationFn: async (payload: {
      product: Omit<CartItem, "quantity">;
      quantity?: number;
    }) => {
      const quantity = payload.quantity || 1;
      console.log("addItemMutation called with payload:", payload);
      const current = queryClient.getQueryData<CartItem[]>(["cart"]) || [];
      console.log("current cart:", current);
      const existing = current.find((item) => item.id === payload.product.id);
      console.log("existing item:", existing);
      const updated = existing
        ? current.map((item) =>
            item.id === payload.product.id
              ? { ...item, quantity: item.quantity + quantity }
              : item,
          )
        : [...current, { ...payload.product, quantity }];
      console.log("updated cart:", updated);
      console.log("storing to localStorage");
      localStorage.setItem("cart", JSON.stringify(updated));
      console.log("localStorage after set:", localStorage.getItem("cart"));
      return updated;
    },
    onSuccess: (data) => {
      console.log("onSuccess called with data:", data);
      queryClient.setQueryData(["cart"], data);
    },
  });

  const removeItemMutation = useMutation({
    mutationFn: async (id: number) => {
      const current = queryClient.getQueryData<CartItem[]>(["cart"]) || [];
      const updated = current.filter((item) => item.id !== id);
      localStorage.setItem("cart", JSON.stringify(updated));
      return updated;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["cart"], data);
    },
  });

  const updateQuantityMutation = useMutation({
    mutationFn: async ({ id, quantity }: { id: number; quantity: number }) => {
      const current = queryClient.getQueryData<CartItem[]>(["cart"]) || [];
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
      queryClient.setQueryData(["cart"], data);
    },
  });

  const clearCartMutation = useMutation({
    mutationFn: async () => {
      localStorage.removeItem("cart");
      return [] as CartItem[];
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["cart"], data);
    },
  });

  const items = cartQuery.data || [];
  const total = items.reduce(
    (sum: number, item: CartItem) => sum + item.price * item.quantity,
    0,
  );
  const itemCount = items.reduce(
    (count: number, item: CartItem) => count + item.quantity,
    0,
  );

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
