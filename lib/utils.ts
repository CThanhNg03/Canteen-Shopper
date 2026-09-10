import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }
export function normalizeVietnamese(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D").toLowerCase().replace(/\s+/g, " ").trim();
}
export function formatNumber(value: number) { return new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 2 }).format(value); }
export function formatQuantity(value: number) {
  const maximumFractionDigits = Math.abs(value) >= 10 ? 2 : Math.abs(value) >= 1 ? 3 : 4;
  return new Intl.NumberFormat("vi-VN", { maximumFractionDigits }).format(value);
}
