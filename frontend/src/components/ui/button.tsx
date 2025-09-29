import React from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "destructive";
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
  const baseStyles = "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-300 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover-glow";
  
  const variants = {
    default: "bg-gradient-to-r from-[#A7C7E7] to-[#89B5E3] text-white hover:from-[#89B5E3] hover:to-[#6BA3DA] hover:scale-105 hover:shadow-lg shadow-md border border-white/20",
    outline: "border-2 border-[#A7C7E7] text-[#A7C7E7] hover:bg-[#A7C7E7] hover:text-white hover:scale-105 hover:shadow-lg transition-all duration-300",
    ghost: "text-[#A7C7E7] hover:bg-[#A7C7E7]/10 hover:text-[#6BA3DA] hover:scale-105",
    destructive: "bg-gradient-to-r from-red-400 to-red-500 text-white hover:from-red-500 hover:to-red-600 hover:scale-105 hover:shadow-lg"
  };
  
  const sizes = {
    sm: "h-8 px-3 text-sm",
    md: "h-10 px-4 text-sm",
    lg: "h-12 px-6 text-base"
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </button>
  );
}