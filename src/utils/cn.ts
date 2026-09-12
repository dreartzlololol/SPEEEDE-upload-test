import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatSalaryWithCurrency(salary: string | number): string {
  if (!salary && salary !== 0) return 'ค่าตอบแทน ฿0 บาท';
  const str = String(salary);
  if (str.includes('ค่าตอบแทน')) return str;
  const clean = str.replace(/[^0-9]/g, '');
  if (!clean) return `ค่าตอบแทน ${str}`;
  const numStr = parseInt(clean).toLocaleString();
  return `ค่าตอบแทน ฿${numStr} บาท`;
}
