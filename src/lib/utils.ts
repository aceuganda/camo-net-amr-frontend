import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function checkPasswordStrength(password: string){
  if (password.length < 8) return "Too short";
  if (!/[A-Z]/.test(password)) return "Add an uppercase letter";
  if (!/[0-9]/.test(password)) return "Add a number";
  if (!/[!@#$%^&*]/.test(password)) return "Add a special character";
  return "Strong";
};