"use client";

import { LogOut, Menu, Moon, Search, ShoppingCart, Sun, X } from "lucide-react";
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
import { useAuth } from "@/lib/authContext";
import { useCart } from "@/lib/cartContext";
import { useTheme } from "@/lib/themeContext";
import { LoginModal, RegisterModal } from "./auth-modals";

export function Navbar() {
  const searchParams = useSearchParams();
  const search = searchParams.get("search");
  const { itemCount } = useCart();
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const [searchFocus, setSearchFocus] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/?search=${encodeURIComponent(searchQuery)}`);
      setSheetOpen(false);
    }
  };

  const handleReset = () => {
    setSearchQuery("");
    setSearchFocus(false);
    router.push("/");
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.refresh();
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <>
      <nav className="fixed w-screen top-0 z-50 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-[1fr_auto_1fr] h-16 items-center gap-4">
            <Link href="/" className="flex items-center font-bold text-xl">
              <span className="text-foreground/90"> Shop </span>
              <span className="bg-linear-to-br from-30% from-foreground/90 to-primary bg-clip-text text-transparent">
                Sense
              </span>
            </Link>

            <form
              onSubmit={handleSearch}
              className={
                "hidden md:flex gap-2 items-center transition-all ease-[cubic-bezier(0.33,1.45,0.6,1)] duration-300 " +
                (searchFocus || search ? "w-xl" : "w-sm")
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

            <div className="flex items-center gap-4 justify-end">
              <Button variant="outline" size="icon" onClick={toggleTheme}>
                {theme === "light" ? (
                  <Moon className="h-5 w-5" />
                ) : (
                  <Sun className="h-5 w-5" />
                )}
              </Button>
              <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon" className="md:hidden">
                    <Menu className="w-5 h-5 dark:text-foreground" />
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side="left"
                  className={theme === "dark" ? "dark" : ""}
                >
                  <div className="flex flex-col gap-6">
                    <h2 className="text-lg font-semibold text-foreground">
                      Menu
                    </h2>
                    <form
                      onSubmit={handleSearch}
                      className="flex flex-col gap-3"
                    >
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
                    <div className="border-t pt-4 flex flex-col gap-2">
                      {user ? (
                        <>
                          <p className="text-sm text-muted-foreground">
                            Signed in as {user.name}
                          </p>
                          <Button
                            onClick={handleLogout}
                            variant="destructive"
                            className="w-full"
                          >
                            <LogOut className="h-4 w-4 mr-2" />
                            Logout
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            onClick={() => {
                              setLoginOpen(true);
                              setSheetOpen(false);
                            }}
                            className="w-full"
                          >
                            Login
                          </Button>
                          <Button
                            onClick={() => {
                              setRegisterOpen(true);
                              setSheetOpen(false);
                            }}
                            variant="outline"
                            className="w-full"
                          >
                            Sign Up
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </SheetContent>
              </Sheet>

              <Link href="/cart">
                <Button variant="outline" className="relative" data-cart-btn>
                  <ShoppingCart className="w-5 h-5" data-cart-icon />
                  {itemCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-[.38rem] py-1 text-xs font-bold leading-none text-background transform translate-x-1/2 -translate-y-1/2 bg-destructive rounded-full">
                      {itemCount}
                    </span>
                  )}
                </Button>
              </Link>

              {user ? (
                <Button
                  onClick={handleLogout}
                  variant="secondary"
                  size="sm"
                  className="hidden sm:flex gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden lg:inline">Logout</span>
                </Button>
              ) : (
                <div className="hidden sm:flex gap-2">
                  <Button
                    onClick={() => setLoginOpen(true)}
                    variant="secondary"
                    size="sm"
                  >
                    Login
                  </Button>
                  <Button
                    onClick={() => setRegisterOpen(true)}
                    variant="default"
                    size="sm"
                  >
                    Sign Up
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
      <div className="h-[4.1rem] bg-background"></div>
      <LoginModal open={loginOpen} onOpenChange={setLoginOpen} />
      <RegisterModal open={registerOpen} onOpenChange={setRegisterOpen} />
    </>
  );
}
