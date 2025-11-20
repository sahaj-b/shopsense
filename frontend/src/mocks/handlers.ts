import { http, HttpResponse } from "msw";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const products = Array.from({ length: 20 }).map((_, i) => ({
  id: i + 1,
  title: `Product ${i + 1}`,
  description: `This is a description for Product ${i + 1}`,
  price: Number((Math.random() * 100).toFixed(2)),
  image: `https://picsum.photos/seed/${i + 1}/400/400`,
  category: i % 2 === 0 ? "Electronics" : "Clothing",
  rating: 4.5,
  rateCount: 10,
}));

export const handlers = [
  // Products
  http.get(`${API_URL}/products`, () => {
    return HttpResponse.json(products);
  }),

  http.get(`${API_URL}/products/:id`, ({ params }) => {
    const { id } = params;
    const product = products.find((p) => p.id === Number(id));
    if (!product) {
      return new HttpResponse(null, { status: 404 });
    }
    return HttpResponse.json(product);
  }),

  // Auth
  http.get(`${API_URL}/me`, () => {
    return HttpResponse.json({
      id: 1,
      email: "user@example.com",
      name: "Test User",
    });
  }),

  http.post(`${API_URL}/auth/login`, () => {
    return HttpResponse.json({
      token: "fake-jwt-token",
      user: {
        id: 1,
        email: "user@example.com",
        name: "Test User",
      },
    });
  }),

  http.post(`${API_URL}/auth/register`, () => {
    return HttpResponse.json({
      token: "fake-jwt-token",
      user: {
        id: 1,
        email: "user@example.com",
        name: "Test User",
      },
    });
  }),

  http.post(`${API_URL}/auth/logout`, () => {
    return new HttpResponse(null, { status: 200 });
  }),

  // Cart
  http.get(`${API_URL}/cart`, () => {
    return HttpResponse.json([
      {
        id: 1,
        productId: 1,
        quantity: 1,
        product: products[0],
      },
    ]);
  }),

  http.post(`${API_URL}/cart`, () => {
    return HttpResponse.json({
      id: 2,
      productId: 2,
      quantity: 1,
      product: products[1],
    });
  }),
];
