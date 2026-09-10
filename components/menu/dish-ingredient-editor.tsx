"use client";

import { Plus, Trash2 } from "lucide-react";
import { parseArithmeticExpression } from "@/lib/arithmetic";
import { formatQuantity } from "@/lib/utils";
import type { IngredientNorm } from "./menu-editor";
import { IngredientAutocomplete } from "./ingredient-autocomplete";

export function DishIngredientEditor({ dishName, tableType, servings, ingredients, ingredientNames, hasNormForAnotherTable, onChange }: {
  dishName: string;
  tableType: string;
  servings: number;
  ingredients: IngredientNorm[];
  ingredientNames: string[];
  hasNormForAnotherTable: boolean;
  onChange: (value: IngredientNorm[]) => void;
}) {
  const update = (id: string, changes: Partial<IngredientNorm>) => onChange(ingredients.map(item => item.id === id ? { ...item, ...changes } : item));
  const updateExpression = (id: string, normExpression: string) => {
    const parsed = parseArithmeticExpression(normExpression);
    update(id, { normExpression, normValue: parsed.valid ? parsed.value : null });
  };
  const add = () => onChange([...ingredients, { id: crypto.randomUUID(), dishId: dishName, tableType, name: "", normExpression: "", normValue: null, unit: "kg" }]);

  return <div className="border-t bg-[#f8faf8] p-3 sm:p-4">
    {!ingredients.length && <div className="mb-3 rounded-lg border border-dashed bg-white p-4 text-center font-medium text-amber-700">
      {hasNormForAnotherTable ? `Chưa có định mức cho mức ăn ${tableType}` : "Chưa có nguyên liệu / định mức"}
    </div>}
    {ingredients.length > 0 && <div className="overflow-x-auto"><div className="min-w-[700px]">
      <div className="mb-1 grid grid-cols-[minmax(180px,1.4fr)_minmax(145px,1fr)_120px_130px_48px] gap-2 px-1 text-sm font-extrabold text-slate-600"><span>Nguyên liệu</span><span>Định mức</span><span>Đơn vị</span><span>Tổng cần</span><span /></div>
      <div className="space-y-2">{ingredients.map(item => {
        const valid = item.normExpression.trim() !== "" && item.normValue !== null;
        return <div key={item.id} className="grid grid-cols-[minmax(180px,1.4fr)_minmax(145px,1fr)_120px_130px_48px] items-start gap-2">
          <IngredientAutocomplete value={item.name} names={ingredientNames} onChange={name => update(item.id, { name })} />
          <div><input aria-label={`Định mức ${item.name || "nguyên liệu"}`} inputMode="decimal" className={`field editable w-full font-bold ${item.normExpression && !valid ? "border-red-500" : ""}`} placeholder="Ví dụ: 0.5/6" value={item.normExpression} onChange={event => updateExpression(item.id, event.target.value)} />{item.normExpression && !valid ? <div className="mt-1 text-xs font-bold text-red-700">Định mức không hợp lệ</div> : valid ? <div className="mt-1 text-xs text-slate-500">≈ {formatQuantity(item.normValue!)} {item.unit}/suất</div> : null}</div>
          <div className="relative"><input aria-label={`Đơn vị ${item.name || "nguyên liệu"}`} className="field w-full pr-12" value={item.unit} onChange={event => update(item.id, { unit: event.target.value })} /><span className="pointer-events-none absolute right-2 top-3 text-xs text-slate-500">/suất</span></div>
          <div className="rounded-lg border bg-white px-3 py-2.5 text-center font-extrabold">{valid ? `${formatQuantity(servings * item.normValue!)} ${item.unit}` : "—"}</div>
          <button aria-label="Xóa nguyên liệu" title="Xóa nguyên liệu" className="btn px-2 text-red-700" onClick={() => onChange(ingredients.filter(candidate => candidate.id !== item.id))}><Trash2 size={18} /></button>
        </div>;
      })}</div>
    </div></div>}
    <button className="btn mt-3 text-[#176448]" onClick={add}><Plus size={18} /> Thêm nguyên liệu</button>
  </div>;
}
