import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[8px] text-[14px] font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:w-4 [&_svg]:h-4 outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
  {
    variants: {
      variant: {
        default:
          "bg-primary-color text-white shadow-custom hover:bg-[#6fa63c]",
        destructive:
          "bg-red-600 text-white shadow-custom hover:bg-red-700",
        outline:
          "border border-[#E4E4E4] bg-white text-black shadow-custom hover:bg-[#F8F8F8]",
        secondary:
          "bg-secondary-color text-black shadow-custom hover:bg-[#e3f0c6]",
        ghost:
          "bg-transparent text-black hover:bg-[#F8F8F8]",
        link: "text-primary-color underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4",
        sm: "h-8 px-3 text-sm",
        lg: "h-10 px-6 text-lg",
        icon: "h-9 w-9 p-2",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Button({ className, variant, size, asChild = false, ...props }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
