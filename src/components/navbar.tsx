"use client";

import { Menu, Moon, Search, ShoppingCart, Sun, X } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useCart } from "@/lib/queries";
import { useTheme } from "@/lib/themeContext";

export function Navbar() {
  const searchParams = useSearchParams();
  const search = searchParams.get("search");
  const { itemCount } = useCart();
  const { theme, toggleTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const [searchFocus, setSearchFocus] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleReset = () => {
    setSearchQuery("");
    setSearchFocus(false);
    router.push("/");
  };

  return (
    <>
      <nav className="fixed w-full top-0 z-50 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-4">
            <Link href="/" className="flex items-center font-bold text-xl">
              <span className="text-foreground/90"> Shop </span>
              <span className="bg-linear-to-br from-30% from-foreground/90 to-primary bg-clip-text text-transparent">
                Sense
              </span>
            </Link>

            <form
              onSubmit={handleSearch}
              className={
                "hidden mx-8 md:flex gap-2 items-center transition-all ease-[cubic-bezier(0.33,1.45,0.6,1)] duration-300 max-w-full min-w-10 " +
                (searchFocus || search ? "w-1/2" : "w-1/3")
              }
            >
              <InputGroup className="flex-1">
                <InputGroupInput
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => {
                    setSearchFocus(true);
                  }}
                  onBlur={() => {
                    setSearchFocus(false);
                  }}
                />
                {search && (
                  <InputGroupAddon align="inline-end">
                    <InputGroupButton
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      onClick={handleReset}
                      aria-label="Clear search and go home"
                    >
                      <X className="h-4 w-4" />
                    </InputGroupButton>
                  </InputGroupAddon>
                )}
              </InputGroup>
              <Button type="submit" variant="default">
                <Search className="h-4 w-4" />
              </Button>
            </form>

            <div className="flex items-center gap-4">
              <Button variant="outline" size="icon" onClick={toggleTheme}>
                {theme === "light" ? (
                  <Moon className="h-5 w-5" />
                ) : (
                  <Sun className="h-5 w-5" />
                )}
              </Button>
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon" className="md:hidden">
                    <Menu className="w-5 h-5 dark:text-foreground" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left">
                  <div className="flex flex-col gap-4 mt-8">
                    <form onSubmit={handleSearch} className="flex gap-2">
                      <InputGroup className="flex-1">
                        <InputGroupInput
                          placeholder="Search products..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        {searchQuery && (
                          <InputGroupAddon align="inline-end">
                            <InputGroupButton
                              type="button"
                              variant="ghost"
                              size="icon-xs"
                              onClick={handleReset}
                              aria-label="Clear search and go home"
                            >
                              <X className="h-4 w-4" />
                            </InputGroupButton>
                          </InputGroupAddon>
                        )}
                      </InputGroup>
                      <Button type="submit" className="w-full">
                        <Search className="h-4 w-4 mr-2" />
                        Search
                      </Button>
                    </form>
                  </div>
                </SheetContent>
              </Sheet>

              <Link href="/cart">
                <Button variant="outline" className="relative" data-cart-icon>
                  <ShoppingCart className="w-5 h-5" />
                  {itemCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-1 text-xs font-bold leading-none text-background transform translate-x-1/2 -translate-y-1/2 bg-destructive rounded-full">
                      {itemCount}
                    </span>
                  )}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>
      <div className="h-[4.1rem] bg-background"></div>
    </>
  );
}
