"use client";

import { useEffect, useRef, useState } from "react";

interface AnimatingElement {
  id: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

function FlyingPlusOne({
  startX,
  startY,
  endX,
  endY,
  onEnd,
}: {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  onEnd: () => void;
}) {
  const elRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!elRef.current) return;

    const deltaX = endX - startX;
    const deltaY = endY - startY;

    elRef.current.animate(
      [
        { transform: "translate(0, 0)", opacity: 1 },
        {
          transform: `translate(${deltaX}px, ${deltaY}px) scale(0.8)`,
          opacity: 0.6,
          offset: 1,
        },
      ],
      {
        duration: 500,
        easing: "ease-out",
        fill: "forwards",
      },
    ).onfinish = onEnd;
  }, [startX, startY, endX, endY]);

  return (
    <span
      ref={elRef}
      className="fixed text-background rounded-full py-1 px-1.5 bg-primary/50 font-bold pointer-events-none z-3"
      style={{
        left: `${startX}px`,
        top: `${startY}px`,
        transform: "translate(-50%, -50%)",
      }}
    >
      +1
    </span>
  );
}

export function useFlyToCart() {
  const [animatingElements, setAnimatingElements] = useState<
    AnimatingElement[]
  >([]);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const triggerAnimation = () => {
    if (!buttonRef.current) return;

    const buttonRect = buttonRef.current.getBoundingClientRect();
    const buttonCenterX = buttonRect.left + buttonRect.width / 2;
    const buttonCenterY = buttonRect.top + buttonRect.height / 2;

    const cartBtn = document.querySelector("[data-cart-icon]") as HTMLElement;
    if (cartBtn) {
      const cartRect = cartBtn.getBoundingClientRect();
      const cartCenterX = cartRect.left + cartRect.width / 2;
      const cartCenterY = cartRect.top + cartRect.height / 2;

      setAnimatingElements((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          startX: buttonCenterX - 10,
          startY: buttonCenterY - 10,
          endX: cartCenterX - 10,
          endY: cartCenterY - 10,
        },
      ]);
    }
  };

  return {
    buttonRef,
    animatingElements,
    triggerAnimation,
    FlyingPlusOne,
    setAnimatingElements,
  };
}
