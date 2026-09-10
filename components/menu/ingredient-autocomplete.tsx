"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { normalizeVietnamese } from "@/lib/utils";

const defaults = ["Thịt gà", "Lá giang", "Thịt vai", "Thịt vai sấn", "Thịt viên", "Thịt bò", "Rau muống", "Chuối"];

export function IngredientAutocomplete({ value, onChange, names }: { value: string; onChange: (value: string) => void; names: string[] }) {
  const [focused, setFocused] = useState(false);
  const allNames = [...new Set([...defaults, ...names])];
  const query = normalizeVietnamese(value);
  const matches = allNames.filter(name => normalizeVietnamese(name).includes(query)).slice(0, 6);
  const exact = allNames.some(name => normalizeVietnamese(name) === query);

  return <div className="relative">
    <input aria-label="Tên nguyên liệu" className="field w-full" value={value} placeholder="Tên nguyên liệu" onFocus={() => setFocused(true)} onBlur={() => setTimeout(() => setFocused(false), 150)} onChange={event => onChange(event.target.value)} />
    {focused && value && <div className="absolute z-30 mt-1 w-full min-w-52 overflow-hidden rounded-lg border bg-white shadow-xl">
      {matches.map(name => <button key={name} type="button" className="block w-full px-3 py-3 text-left hover:bg-[#edf5f0]" onMouseDown={() => onChange(name)}>{name}</button>)}
      {!exact && <button type="button" className="flex w-full items-center gap-2 border-t px-3 py-3 text-left font-bold text-[#176448]" onMouseDown={() => { onChange(value.trim()); setFocused(false); }}><Plus size={18} /> Dùng “{value.trim()}”</button>}
    </div>}
  </div>;
}
