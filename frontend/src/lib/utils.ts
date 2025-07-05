
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Helper function for course card hover transitions
export function courseCardHover(colorScheme: 'blue' | 'orange' = 'blue') {
  return colorScheme === 'blue' 
    ? "hover:border-eduBlue-500 hover:shadow-eduBlue-100/50" 
    : "hover:border-eduOrange-500 hover:shadow-eduOrange-100/50"
}
