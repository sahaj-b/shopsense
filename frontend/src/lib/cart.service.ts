import type { CartItem } from "./cartContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface ApiCartItem {
  ID: string;
  CartID: string;
  ProductID: number;
  Quantity: number;
  Product: {
    id: number;
    title: string;
    price: number;
    image: string;
    description?: string;
    category?: string;
    rating?: number;
    rateCount?: number;
  };
}

export async function getCartItemsApi(): Promise<CartItem[]> {
  const res = await fetch(`${API_URL}/cart`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to fetch cart items");
  const resJson = (await res.json()) as {
    cart: { CartItems: ApiCartItem[] } | null;
  };
  if (!resJson.cart) return [];

  const items = (resJson.cart.CartItems ?? []).map((item) => ({
    id: item.Product.id,
    title: item.Product.title,
    price: item.Product.price,
    image: item.Product.image,
    quantity: item.Quantity,
  }));

  return items;
}

export async function setCartItemsApi(items: CartItem[]) {
  const newItems = items.map((item) => ({
    productId: item.id,
    quantity: item.quantity,
  }));

  const payload = { cartItems: newItems };

  const res = await fetch(`${API_URL}/cart`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error("Backend rejected cart update:", errorText);
    throw new Error(res.statusText);
  }
}
