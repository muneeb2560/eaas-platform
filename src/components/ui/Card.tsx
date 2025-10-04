import React from "react";
import { cn } from "@/lib/utils/cn";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function Card({ className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-gray-700 bg-gray-800/50 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300 hover:bg-gray-800/60",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}