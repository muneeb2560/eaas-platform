import React from "react";
import { cn } from "@/lib/utils/cn";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

export function Button({
  className,
  variant = "default",
  size = "md",
  children,
  ...props
}: ButtonProps) {
  const baseClasses = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50";
  
  const variants = {
    default: "bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-blue-500/25 transition-all duration-200",
    outline: "border border-gray-600 bg-gray-800/50 backdrop-blur-sm text-gray-200 hover:bg-gray-700/50 hover:border-gray-500 transition-all duration-200",
    ghost: "text-gray-300 hover:bg-gray-800/50 hover:text-white transition-all duration-200"
  };
  
  const sizes = {
    sm: "h-8 px-3 text-sm",
    md: "h-9 px-4",
    lg: "h-10 px-6 text-lg"
  };

  return (
    <button
      className={cn(baseClasses, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </button>
  );
}