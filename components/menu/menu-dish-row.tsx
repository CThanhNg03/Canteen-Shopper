"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import { DishAutocomplete } from "./dish-autocomplete";
import { DishIngredientEditor } from "./dish-ingredient-editor";
import type { IngredientNorm, MenuRow } from "./menu-editor";

export function MenuDishRow({ row, tableType, servings, ingredients, ingredientNames, hasNormForAnotherTable, onChange, onDelete, onIngredientsChange }: {
  row: MenuRow;
  tableType: string;
  servings: number;
  ingredients: IngredientNorm[];
  ingredientNames: string[];
  hasNormForAnotherTable: boolean;
  onChange: (changes: Partial<MenuRow>) => void;
  onDelete: () => void;
  onIngredientsChange: (value: IngredientNorm[]) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  return <div className="overflow-visible rounded-xl border bg-white shadow-sm">
    <div className="grid grid-cols-[minmax(200px,1fr)_minmax(120px,.65fr)_48px_48px] gap-2 p-2">
      <DishAutocomplete value={row.name} onChange={name => onChange({ name })} />
      <input aria-label="Ghi chú" className="field" placeholder="Ghi chú (nếu có)" value={row.note} onChange={event => onChange({ note: event.target.value })} />
      <button aria-label={expanded ? "Thu gọn" : "Mở rộng"} title={expanded ? "Thu gọn" : "Mở rộng"} className="btn px-2 text-[#176448]" onClick={() => setExpanded(value => !value)}>{expanded ? <ChevronUp size={22} /> : <ChevronDown size={22} />}</button>
      <button aria-label="Xóa món" className="btn px-2 text-red-700" onClick={onDelete}><Trash2 size={19} /></button>
      {!expanded && row.name && !ingredients.length && <div className="col-span-full px-2 pb-1 text-sm font-medium text-amber-700">{hasNormForAnotherTable ? `Chưa có định mức cho mức ăn ${tableType}` : "Chưa có định mức"}</div>}
    </div>
    {expanded && <DishIngredientEditor dishName={row.name} tableType={tableType} servings={servings} ingredients={ingredients} ingredientNames={ingredientNames} hasNormForAnotherTable={hasNormForAnotherTable} onChange={onIngredientsChange} />}
  </div>;
}
