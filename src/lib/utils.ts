import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
}

export function formatMoney(value: number): string {
  return new Intl.NumberFormat('fr-FR').format(Math.round(value)) + ' FC';
}

export function formatUSD(value: number): string {
  return new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value) + ' $';
}

export function fcToUsd(fc: number, rate: number): number {
  return rate > 0 ? fc / rate : 0;
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('fr-FR').format(value);
}
