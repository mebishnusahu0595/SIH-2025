import React from "react";
import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ className, label, error, ...props }: InputProps) {
  const inputStyles = "flex h-10 w-full rounded-md border border-black/20 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-black/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/20 dark:bg-black dark:ring-offset-black dark:placeholder:text-white/50 dark:focus-visible:ring-white";

  return (
    <div className="space-y-1">
      {label && (
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          {label}
        </label>
      )}
      <input className={cn(inputStyles, error && "border-red-500", className)} {...props} />
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function Textarea({ className, label, error, ...props }: TextareaProps) {
  const textareaStyles = "flex min-h-[80px] w-full rounded-md border border-black/20 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-black/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/20 dark:bg-black dark:ring-offset-black dark:placeholder:text-white/50 dark:focus-visible:ring-white";

  return (
    <div className="space-y-1">
      {label && (
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          {label}
        </label>
      )}
      <textarea className={cn(textareaStyles, error && "border-red-500", className)} {...props} />
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}