import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function shortenAddress(address: string | null): string {
  const firstPart = address?.substring(0, 4);
  const lastPart = address?.substring(address.length - 5);

  return `${firstPart}...${lastPart}`;
}