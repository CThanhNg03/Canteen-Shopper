import type { Counts } from "@/components/headcount/headcount-grid";
import type { MenuRow } from "@/components/menu/menu-editor";
import type { ShoppingItem } from "@/components/shopping/shopping-list";

type IngredientNorm = { name: string; unit: string; quantityPerServing: number };

export const ingredientSuppliers: Record<string, string> = {
  "Thịt gà": "Thực phẩm An Phú",
  "Thịt vai": "Thực phẩm An Phú",
  "Thịt bò": "Thực phẩm An Phú",
  "Lá giang": "Rau củ Minh Tâm",
  "Rau muống": "Rau củ Minh Tâm",
  "Chuối": "Nông sản Hòa Bình",
};

// MVP norms are kept client-side until the database-backed dish editor is wired up.
const dishNorms: Record<string, Record<string, IngredientNorm[]>> = {
  "Gà nấu lá giang": {
    "72K": [
      { name: "Thịt gà", unit: "kg", quantityPerServing: 0.09 },
      { name: "Lá giang", unit: "kg", quantityPerServing: 0.0025 },
    ],
    "128K": [
      { name: "Thịt gà", unit: "kg", quantityPerServing: 0.11 },
      { name: "Lá giang", unit: "kg", quantityPerServing: 0.003 },
    ],
  },
  "Rau muống luộc": {
    "72K": [{ name: "Rau muống", unit: "kg", quantityPerServing: 0.05 }],
    "128K": [{ name: "Rau muống", unit: "kg", quantityPerServing: 0.06 }],
  },
  "Canh bí xanh thịt": {
    "72K": [{ name: "Thịt vai", unit: "kg", quantityPerServing: 0.035 }],
    "128K": [{ name: "Thịt vai", unit: "kg", quantityPerServing: 0.045 }],
  },
  "Bò xào hoa thiên lý": {
    "72K": [{ name: "Thịt bò", unit: "kg", quantityPerServing: 0.07 }],
    "128K": [{ name: "Thịt bò", unit: "kg", quantityPerServing: 0.09 }],
  },
  Chuối: {
    "72K": [{ name: "Chuối", unit: "kg", quantityPerServing: 0.12 }],
    "128K": [{ name: "Chuối", unit: "kg", quantityPerServing: 0.12 }],
  },
};

export function calculateShoppingItems(
  counts: Counts,
  rows: MenuRow[],
  table: string,
  meal: string,
): ShoppingItem[] {
  const servings = Object.entries(counts).reduce((total, [key, count]) => {
    const [, entryTable, entryMeal] = key.split("|");
    return entryTable === table && entryMeal === meal ? total + count : total;
  }, 0);
  const totals = new Map<string, { unit: string; required: number }>();

  for (const row of rows) {
    for (const norm of dishNorms[row.name]?.[table] ?? []) {
      const current = totals.get(norm.name) ?? { unit: norm.unit, required: 0 };
      current.required += servings * norm.quantityPerServing;
      totals.set(norm.name, current);
    }
  }

  return [...totals.entries()].map(([name, value]) => ({
    name,
    unit: value.unit,
    supplier: ingredientSuppliers[name] ?? "Chưa chọn nhà cung cấp",
    required: Math.round(value.required * 1000) / 1000,
    available: 0,
    final: Math.round(value.required * 1000) / 1000,
  }));
}

export function aggregateShoppingItems(
  entries: { canteenId: string; canteenName: string; items: ShoppingItem[] }[],
): ShoppingItem[] {
  const totals = new Map<string, ShoppingItem>();

  for (const entry of entries) {
    for (const item of entry.items) {
      const key = `${item.name}|${item.unit}|${item.supplier ?? ""}`;
      const current = totals.get(key) ?? {
        name: item.name,
        unit: item.unit,
        supplier: item.supplier ?? ingredientSuppliers[item.name] ?? "Chưa chọn nhà cung cấp",
        required: 0,
        available: 0,
        final: 0,
        canteens: [],
      };
      current.required += item.required;
      current.final += item.final;
      current.canteens = [
        ...(current.canteens ?? []),
        { id: entry.canteenId, name: entry.canteenName, quantity: item.required },
      ];
      totals.set(key, current);
    }
  }

  return [...totals.values()]
    .map(item => ({
      ...item,
      required: Math.round(item.required * 1000) / 1000,
      final: Math.round(item.final * 1000) / 1000,
    }))
    .sort((a, b) => (a.supplier ?? "").localeCompare(b.supplier ?? "", "vi") || a.name.localeCompare(b.name, "vi"));
}
