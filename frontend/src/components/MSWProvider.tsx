"use client";

import { useEffect, useState } from "react";

export function MSWProvider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [mswReady, setMswReady] = useState(false);

  useEffect(() => {
    const init = async () => {
      if (process.env.NEXT_PUBLIC_API_MOCKING === "enabled") {
        const { worker } = await import("../mocks/browser");
        await worker.start({
          onUnhandledRequest: "bypass",
        });
        setMswReady(true);
      } else {
        setMswReady(true);
      }
    };

    init();
  }, []);

  if (!mswReady) {
    return null;
  }

  return <>{children}</>;
}
