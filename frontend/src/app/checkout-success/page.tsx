import { CircleCheck } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CheckoutSuccessPage() {
  return (
    <main className="min-h-screen bg-background flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-green-100 dark:bg-green-900 p-4">
              <CircleCheck className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <CardTitle className="text-2xl">Order Confirmed!</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            Thank you for your purchase. Your order has been successfully
            placed.
          </p>
          <p className="text-sm text-muted-foreground">
            Order Number:{" "}
            <span className="font-mono font-semibold">
              #SHP{Math.floor(Math.random() * 1000000)}
            </span>
          </p>
          <p className="text-sm text-muted-foreground">
            We'll send you a confirmation email shortly with shipping details.
          </p>

          <div className="pt-4 space-y-2">
            <Link href="/" className="block">
              <Button className="w-full">Back to Shop</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
