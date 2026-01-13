import * as React from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "default" | "ghost" | "icon";
    size?: "default" | "sm" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "default", size = "default", ...props }, ref) => {
        return (
            <button
                ref={ref}
                className={cn(
                    "inline-flex items-center justify-center rounded-full font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
                    {
                        "bg-white/10 text-white hover:bg-white/20": variant === "default",
                        "hover:bg-white/10 text-gray-400 hover:text-white": variant === "ghost",
                        "hover:bg-white/10 text-white": variant === "icon",
                        "h-9 px-4 py-2": size === "default",
                        "h-8 rounded-md px-3 text-xs": size === "sm",
                        "h-10 w-10 p-2": size === "icon",
                    },
                    className
                )}
                {...props}
            />
        );
    }
);
Button.displayName = "Button";

export { Button };
