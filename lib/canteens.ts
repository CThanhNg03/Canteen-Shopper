import type { Counts, UnitRow } from "@/components/headcount/headcount-grid";
import type { MenuRow } from "@/components/menu/menu-editor";
import type { ShoppingItem } from "@/components/shopping/shopping-list";

export type Canteen = { id: string; name: string; location: string };
export type CanteenPlan = {
  counts: Counts;
  unitRows: UnitRow[];
  rows: MenuRow[];
  items: ShoppingItem[];
  meal: string;
  table: string;
};
export type MultiCanteenPlan = { canteens: Record<string, CanteenPlan> };

export const defaultCanteens: Canteen[] = [
  { id: "trung-tam", name: "Căng tin Trung tâm", location: "Tòa nhà chính" },
  { id: "khu-a", name: "Căng tin Khu A", location: "Khu hành chính" },
  { id: "nha-thi-dau", name: "Căng tin Nhà thi đấu", location: "Khu thể thao" },
];

export const canteenDirectoryKey = "bep-canteens";
export const planStorageKey = (date: string) => `bep-plan:${date}`;

export function readCanteens(): Canteen[] {
  const raw = localStorage.getItem(canteenDirectoryKey);
  if (!raw) return defaultCanteens;
  try {
    const value = JSON.parse(raw) as Canteen[];
    return value.length ? value : defaultCanteens;
  } catch {
    return defaultCanteens;
  }
}

export function readPlan(date: string): MultiCanteenPlan {
  const raw = localStorage.getItem(planStorageKey(date));
  if (!raw) return { canteens: {} };
  try {
    const value = JSON.parse(raw) as MultiCanteenPlan & Partial<CanteenPlan>;
    if (value.canteens) return value;
    // Keep plans created by the original single-canteen version usable.
    if (value.counts && value.rows) {
      return { canteens: { [defaultCanteens[0].id]: value as CanteenPlan } };
    }
  } catch {
    localStorage.removeItem(planStorageKey(date));
  }
  return { canteens: {} };
}
