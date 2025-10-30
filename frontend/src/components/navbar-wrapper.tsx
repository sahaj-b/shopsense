"use client";

import { useEffect, useState } from "react";
import { Navbar } from "./navbar";

export function NavbarWrapper() {
  // using wrapper coz useTheme no context error
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return <Navbar />;
}
