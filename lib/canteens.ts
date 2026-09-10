import type { Counts, UnitRow } from "@/components/headcount/headcount-grid";
import type { IngredientNorm, MenuPlan, MenuRow } from "@/components/menu/menu-editor";
import type { ShoppingItem } from "@/components/shopping/shopping-list";
import { parseArithmeticExpression } from "@/lib/arithmetic";

export type Canteen = { id: string; name: string; location: string };
export type CanteenPlan = {
  counts: Counts;
  unitRows: UnitRow[];
  menus: Record<string, MenuPlan>;
  dishNorms: Record<string, Record<string, IngredientNorm[]>>;
  items: ShoppingItem[];
  meal: string;
  table: string;
};
export type MultiCanteenPlan = { version: 2; canteens: Record<string, CanteenPlan> };

export const menuKey = (meal: string, table: string) => `${meal}|${table}`;

const seedNorm = (dishId: string, tableType: string, name: string, normValue: number, unit = "kg"): IngredientNorm => ({
  id: `seed:${dishId}:${tableType}:${name}`,
  dishId,
  tableType,
  name,
  normExpression: String(normValue),
  normValue,
  unit,
});
export const makeDefaultDishNorms = (): CanteenPlan["dishNorms"] => ({
  "Gà nấu lá giang": {
    "72K": [seedNorm("Gà nấu lá giang", "72K", "Thịt gà", 0.09), seedNorm("Gà nấu lá giang", "72K", "Lá giang", 0.0025)],
    "128K": [seedNorm("Gà nấu lá giang", "128K", "Thịt gà", 0.11), seedNorm("Gà nấu lá giang", "128K", "Lá giang", 0.003)],
  },
  "Rau muống luộc": {
    "72K": [seedNorm("Rau muống luộc", "72K", "Rau muống", 0.05)],
    "128K": [seedNorm("Rau muống luộc", "128K", "Rau muống", 0.06)],
  },
  "Canh bí xanh thịt": {
    "72K": [seedNorm("Canh bí xanh thịt", "72K", "Thịt vai", 0.035)],
    "128K": [seedNorm("Canh bí xanh thịt", "128K", "Thịt vai", 0.045)],
  },
  "Bò xào hoa thiên lý": {
    "72K": [seedNorm("Bò xào hoa thiên lý", "72K", "Thịt bò", 0.07)],
    "128K": [seedNorm("Bò xào hoa thiên lý", "128K", "Thịt bò", 0.09)],
  },
  "Chuối": {
    "72K": [seedNorm("Chuối", "72K", "Chuối", 0.12)],
    "128K": [seedNorm("Chuối", "128K", "Chuối", 0.12)],
  },
});

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
    return Array.isArray(value) && value.length ? value : defaultCanteens;
  } catch {
    return defaultCanteens;
  }
}

const migrateIngredient = (value: Partial<IngredientNorm>, dishName: string, table: string): IngredientNorm | null => {
  if (typeof value.name !== "string") return null;
  const legacy = value as Partial<IngredientNorm> & { quantityPerServing?: number };
  const expression = typeof value.normExpression === "string"
    ? value.normExpression
    : String(value.normValue ?? legacy.quantityPerServing ?? "");
  const parsed = parseArithmeticExpression(expression);
  return {
    id: typeof value.id === "string" ? value.id : crypto.randomUUID(),
    dishId: dishName,
    tableType: table,
    name: value.name,
    normExpression: expression,
    normValue: parsed.valid ? parsed.value : null,
    unit: typeof value.unit === "string" ? value.unit.replace("/suất", "") : "kg",
  };
};

function migrateCanteenPlan(input: unknown): CanteenPlan | null {
  if (!input || typeof input !== "object") return null;
  const old = input as Partial<CanteenPlan> & { rows?: MenuRow[] };
  const meal = typeof old.meal === "string" ? old.meal : "Trưa";
  const table = typeof old.table === "string" ? old.table : "72K";
  const menus = old.menus && typeof old.menus === "object" ? old.menus : {};
  if (Array.isArray(old.rows) && !menus[menuKey(meal, table)]) menus[menuKey(meal, table)] = { rows: old.rows };
  const dishNorms: CanteenPlan["dishNorms"] = makeDefaultDishNorms();
  if (old.dishNorms && typeof old.dishNorms === "object") {
    for (const [dish, tables] of Object.entries(old.dishNorms)) {
      if (!tables || typeof tables !== "object") continue;
      dishNorms[dish] = {};
      for (const [tableType, ingredients] of Object.entries(tables)) {
        if (!Array.isArray(ingredients)) continue;
        dishNorms[dish][tableType] = ingredients.flatMap(value => {
          const migrated = migrateIngredient(value, dish, tableType);
          return migrated ? [migrated] : [];
        });
      }
    }
  }
  return {
    counts: old.counts && typeof old.counts === "object" ? old.counts : {},
    unitRows: Array.isArray(old.unitRows) ? old.unitRows : [],
    menus,
    dishNorms,
    items: Array.isArray(old.items) ? old.items : [],
    meal,
    table,
  };
}

export function readPlan(date: string): MultiCanteenPlan {
  const raw = localStorage.getItem(planStorageKey(date));
  if (!raw) return { version: 2, canteens: {} };
  try {
    const value = JSON.parse(raw) as { canteens?: Record<string, unknown> } & Record<string, unknown>;
    const source = value.canteens && typeof value.canteens === "object"
      ? value.canteens
      : value.counts ? { [defaultCanteens[0].id]: value } : {};
    const canteens = Object.fromEntries(Object.entries(source).flatMap(([id, plan]) => {
      const migrated = migrateCanteenPlan(plan);
      return migrated ? [[id, migrated]] : [];
    }));
    return { version: 2, canteens };
  } catch {
    return { version: 2, canteens: {} };
  }
}
