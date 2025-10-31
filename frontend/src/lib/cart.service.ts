import type { CartItem } from "./cartContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface ApiCartItem {
  ID: string;
  CartID: string;
  ProductID: number;
  Quantity: number;
  Product: {
    ID: number;
    Title: string;
    Price: number;
    Image: string;
    Description?: string;
    Category?: string;
    Rating?: string;
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

  return (resJson.cart.CartItems ?? []).map((item) => ({
    id: item.Product.ID,
    title: item.Product.Title,
    price: item.Product.Price,
    image: item.Product.Image,
    quantity: item.Quantity,
  }));
}

export async function setCartItemsApi(items: CartItem[]) {
  const newItems = items.map((item) => ({
    productId: item.id,
    quantity: item.quantity,
  }));
  const res = await fetch(`${API_URL}/cart`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ cartItems: newItems }),
  });
  if (!res.ok) throw new Error(res.statusText);
}
