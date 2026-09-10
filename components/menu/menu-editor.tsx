"use client";

import { Plus, RotateCcw, Trash2 } from "lucide-react";
import { DishAutocomplete } from "./dish-autocomplete";

export type MenuRow = { id: string; category: string; name: string; note: string };

const knownDishes = ["Gà nấu lá giang", "Bò xào hoa thiên lý", "Rau muống luộc", "Canh bí xanh thịt", "Chuối"];

export function MenuEditor({ rows, setRows }: { rows: MenuRow[]; setRows: (value: MenuRow[]) => void }) {
  const update = (id: string, key: "name" | "note", value: string) => setRows(rows.map(row => row.id === id ? { ...row, [key]: value } : row));
  const reusableRows = createReusableRows();

  return <div>
    <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
      <button className="btn w-full sm:w-auto" onClick={() => setRows(reusableRows)}><RotateCcw size={18} /> Dùng lại thực đơn gần đây</button>
      <button className="btn w-full sm:w-auto">Sao chép thực đơn hôm trước</button>
    </div>
    <div className="flex flex-col gap-2">
      {rows.map(row => <div key={row.id} className="grid gap-2 rounded-lg border border-slate-200 bg-slate-50/60 p-2 sm:grid-cols-[minmax(220px,1fr)_minmax(160px,.7fr)_44px] sm:items-start sm:border-0 sm:bg-transparent sm:p-0">
        <DishAutocomplete value={row.name} onChange={value => update(row.id, "name", value)} />
        <input aria-label="Ghi chú" className="field min-h-11 w-full" placeholder="Ghi chú (nếu có)" value={row.note} onChange={event => update(row.id, "note", event.target.value)} />
        <button aria-label="Xóa món" className="btn min-h-11 w-full px-2 text-red-700 sm:w-11" onClick={() => setRows(rows.filter(item => item.id !== row.id))}><Trash2 size={19} /><span className="sm:hidden">Xóa món</span></button>
        {row.name && !knownDishes.includes(row.name) && <div className="text-sm font-medium text-amber-700 sm:col-start-1 sm:col-span-2">Chưa có định mức — vẫn có thể lưu thực đơn</div>}
      </div>)}
    </div>
    <button className="btn mt-3 w-full text-[#176448] sm:w-auto" onClick={() => setRows([...rows, { id: crypto.randomUUID(), category: "Món chính", name: "", note: "" }])}><Plus size={18} /> Thêm món</button>
  </div>;
}

function createReusableRows() {
  return [
    { id: crypto.randomUUID(), category: "Món chính", name: "Gà nấu lá giang", note: "" },
    { id: crypto.randomUUID(), category: "Rau", name: "Rau muống luộc", note: "" },
    { id: crypto.randomUUID(), category: "Canh", name: "Canh bí xanh thịt", note: "" },
  ];
}

