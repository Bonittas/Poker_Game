// components/ui/card.tsx
import * as React from "react";
import clsx from "clsx";

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={clsx("rounded-lg border bg-card text-red text-card-foreground shadow-sm", className)}
    {...props}
  />
));
Card.displayName = "Card";

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={clsx("p-4", className)}
    {...props}
  />
));
CardContent.displayName = "CardContent";

export { Card, CardContent };
