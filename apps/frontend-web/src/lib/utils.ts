import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8080";

export function getImageUrl(imagePath: string): string {
  if (!imagePath) return "/placeholder-product.jpg";
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }
  if (imagePath.startsWith("/assets/") || imagePath.startsWith("/")) {
    return `${BACKEND_URL}${imagePath}`;
  }
  return imagePath;
}

export function isBackendImage(imagePath: string): boolean {
  if (!imagePath) return false;
  const url = getImageUrl(imagePath);
  return url.includes("localhost") || url.includes("127.0.0.1") || url.includes(BACKEND_URL);
}
