import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumberWithCommas(number: number): string {
  return new Intl.NumberFormat("vi-VN").format(number);
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("vi-VN").format(value);
}
