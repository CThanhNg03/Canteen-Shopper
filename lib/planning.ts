import type { Counts } from "@/components/headcount/headcount-grid";
import type { ShoppingBreakdown, ShoppingItem } from "@/components/shopping/shopping-list";
import type { CanteenPlan } from "@/lib/canteens";

export const ingredientSuppliers: Record<string, string> = {
  "Thịt gà": "Thực phẩm An Phú",
  "Thịt vai": "Thực phẩm An Phú",
  "Thịt bò": "Thực phẩm An Phú",
  "Lá giang": "Rau củ Minh Tâm",
  "Rau muống": "Rau củ Minh Tâm",
  "Chuối": "Nông sản Hòa Bình",
};

export function getServingCount(counts: Counts, meal: string, table: string): number {
  return Object.entries(counts).reduce((total, [key, count]) => {
    const [, entryTable, entryMeal] = key.split("|");
    return entryTable === table && entryMeal === meal && Number.isFinite(count) ? total + count : total;
  }, 0);
}

/** Calculates every configured meal/table menu while preserving full precision. */
export function calculateShoppingItems(plan: Pick<CanteenPlan, "counts" | "menus" | "dishNorms">): ShoppingItem[] {
  const totals = new Map<string, { name: string; unit: string; required: number; breakdown: ShoppingBreakdown[] }>();

  for (const [key, menu] of Object.entries(plan.menus)) {
    const [meal, table] = key.split("|");
    if (!meal || !table || !Array.isArray(menu?.rows)) continue;
    const servings = getServingCount(plan.counts, meal, table);
    if (!servings) continue;
    for (const row of menu.rows) {
      for (const norm of plan.dishNorms[row.name]?.[table] ?? []) {
        if (!norm.name.trim() || norm.normValue === null || !Number.isFinite(norm.normValue) || norm.normValue < 0) continue;
        const mapKey = `${norm.name.trim().toLocaleLowerCase("vi")}|${norm.unit.trim().toLocaleLowerCase("vi")}`;
        const quantity = servings * norm.normValue;
        if (!Number.isFinite(quantity)) continue;
        const current = totals.get(mapKey) ?? { name: norm.name.trim(), unit: norm.unit.trim() || "kg", required: 0, breakdown: [] };
        current.required += quantity;
        const existing = current.breakdown.find(item => item.meal === meal && item.table === table);
        if (existing) existing.quantity += quantity;
        else current.breakdown.push({ meal, table, quantity });
        totals.set(mapKey, current);
      }
    }
  }

  return [...totals.values()].map(value => ({
    name: value.name,
    unit: value.unit,
    supplier: ingredientSuppliers[value.name] ?? "Chưa chọn nhà cung cấp",
    required: value.required,
    available: 0,
    final: value.required,
    breakdown: value.breakdown,
  }));
}

export function aggregateShoppingItems(entries: { canteenId: string; canteenName: string; items: ShoppingItem[] }[]): ShoppingItem[] {
  const totals = new Map<string, ShoppingItem>();
  for (const entry of entries) {
    for (const item of entry.items) {
      const key = `${item.name.toLocaleLowerCase("vi")}|${item.unit.toLocaleLowerCase("vi")}|${item.supplier ?? ""}`;
      const current = totals.get(key) ?? { ...item, required: 0, available: 0, final: 0, canteens: [], breakdown: [] };
      current.required += item.required;
      current.final += item.final;
      current.canteens = [...(current.canteens ?? []), { id: entry.canteenId, name: entry.canteenName, quantity: item.required }];
      current.breakdown = [...(current.breakdown ?? []), ...(item.breakdown ?? []).map(detail => ({ ...detail, canteenId: entry.canteenId, canteenName: entry.canteenName }))];
      totals.set(key, current);
    }
  }
  return [...totals.values()].sort((a, b) => (a.supplier ?? "").localeCompare(b.supplier ?? "", "vi") || a.name.localeCompare(b.name, "vi"));
}
