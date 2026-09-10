"use client";

import { Plus, RotateCcw } from "lucide-react";
import { MenuDishRow } from "./menu-dish-row";

export type IngredientNorm = {
  id: string;
  dishId: string;
  tableType: string;
  name: string;
  normExpression: string;
  normValue: number | null;
  unit: string;
};
export type MenuRow = { id: string; category?: string; name: string; note: string };
export type MenuPlan = { rows: MenuRow[] };

type Props = {
  rows: MenuRow[];
  setRows: (value: MenuRow[]) => void;
  tableType: string;
  servings: number;
  dishNorms: Record<string, Record<string, IngredientNorm[]>>;
  setDishNorms: (value: Record<string, Record<string, IngredientNorm[]>>) => void;
};

const recentRows = (): MenuRow[] => [
  { id: crypto.randomUUID(), name: "Gà nấu lá giang", note: "" },
  { id: crypto.randomUUID(), name: "Rau muống luộc", note: "" },
  { id: crypto.randomUUID(), name: "Canh bí xanh thịt", note: "" },
];

export function MenuEditor({ rows, setRows, tableType, servings, dishNorms, setDishNorms }: Props) {
  const update = (id: string, changes: Partial<MenuRow>) => setRows(rows.map(row => row.id === id ? { ...row, ...changes } : row));
  const setIngredients = (dishName: string, ingredients: IngredientNorm[]) => {
    setDishNorms({
      ...dishNorms,
      [dishName]: { ...(dishNorms[dishName] ?? {}), [tableType]: ingredients },
    });
  };

  return <div>
    <div className="mb-3 flex flex-wrap gap-2">
      <button className="btn" onClick={() => setRows(recentRows())}><RotateCcw size={18} /> Dùng lại thực đơn gần đây</button>
      <button className="btn">Sao chép thực đơn hôm trước</button>
    </div>
    <div className="space-y-3">{rows.map(row => <MenuDishRow
      key={row.id}
      row={row}
      tableType={tableType}
      servings={servings}
      ingredients={dishNorms[row.name]?.[tableType] ?? []}
      hasNormForAnotherTable={Object.values(dishNorms[row.name] ?? {}).some(items => items.length > 0)}
      ingredientNames={[...new Set(Object.values(dishNorms).flatMap(tables => Object.values(tables).flatMap(items => items.map(item => item.name))))]}
      onChange={changes => update(row.id, changes)}
      onDelete={() => setRows(rows.filter(candidate => candidate.id !== row.id))}
      onIngredientsChange={ingredients => setIngredients(row.name, ingredients)}
    />)}</div>
    <button className="btn mt-3 text-[#176448]" onClick={() => setRows([...rows, { id: crypto.randomUUID(), name: "", note: "" }])}><Plus size={18} /> Thêm món</button>
  </div>;
}
