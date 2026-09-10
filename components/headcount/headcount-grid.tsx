"use client";

import { Copy, Plus, Trash2 } from "lucide-react";
import { ArithmeticInput } from "@/components/calculator/arithmetic-input";

export const defaultUnits = ["Phòng KT", "Trọng tài", "TCHCKT", "QD34", "C55"];
export const meals = ["Sáng", "Trưa", "Chiều"];
export const tables = ["128K", "72K"];
export type Counts = Record<string, number>;
export type UnitRow = { id: string; name: string };
export const countKey = (unitId: string, table: string, meal: string) => `${unitId}|${table}|${meal}`;

type HeadcountGridProps = {
  counts: Counts;
  setCounts: (value: Counts) => void;
  unitRows: UnitRow[];
  setUnitRows: (value: UnitRow[]) => void;
  unitHistory: string[];
};

export function HeadcountGrid({ counts, setCounts, unitRows, setUnitRows, unitHistory }: HeadcountGridProps) {
  const set = (key: string, count: number) => setCounts({ ...counts, [key]: count });
  const historyId = "unit-history";

  const updateUnit = (id: string, name: string) => {
    setUnitRows(unitRows.map(unit => unit.id === id ? { ...unit, name } : unit));
  };

  const addUnit = () => {
    setUnitRows([...unitRows, { id: crypto.randomUUID(), name: "" }]);
  };

  const removeUnit = (id: string) => {
    setUnitRows(unitRows.filter(unit => unit.id !== id));
    setCounts(Object.fromEntries(Object.entries(counts).filter(([key]) => !key.startsWith(`${id}|`))));
  };

  return <div>
    <div className="overflow-x-auto">
      <table className="w-full min-w-[850px] border-collapse text-center">
        <thead>
          <tr className="bg-[#eef3ef]">
            <th rowSpan={2} className="sticky left-0 z-10 w-52 border bg-[#eef3ef] p-3 text-left">Đơn vị</th>
            {tables.map(table => <th key={table} colSpan={3} className="border p-2 text-[#176448]">{table}</th>)}
            <th rowSpan={2} className="border p-2">Thao tác</th>
          </tr>
          <tr className="bg-[#f7f9f7]">{tables.flatMap(table => meals.map(meal => <th key={table + meal} className="border p-2">{meal}</th>))}</tr>
        </thead>
        <tbody>{unitRows.map(unit => <tr key={unit.id}>
          <th className="sticky left-0 z-10 border bg-white p-1.5 text-left">
            <input
              aria-label="Tên đơn vị"
              className="field w-full min-w-44 font-bold"
              list={historyId}
              onChange={event => updateUnit(unit.id, event.target.value)}
              placeholder="Chọn hoặc nhập đơn vị"
              value={unit.name}
            />
          </th>
          {tables.flatMap(table => meals.map(meal => {
            const key = countKey(unit.id, table, meal);
            return <td className="border p-1.5" key={key}><ArithmeticInput label={`${unit.name || "Đơn vị mới"}, ${table}, ${meal}`} value={counts[key] || 0} onChange={count => set(key, count)} /></td>;
          }))}
          <td className="border p-1">
            <div className="flex justify-center gap-1">
              <button title="Sao chép ô Sáng sang Trưa và Chiều" className="btn px-2 text-sm" onClick={() => {
                const next = { ...counts };
                tables.forEach(table => {
                  const count = counts[countKey(unit.id, table, "Sáng")] || 0;
                  if (count) {
                    next[countKey(unit.id, table, "Trưa")] = count;
                    next[countKey(unit.id, table, "Chiều")] = count;
                  }
                });
                setCounts(next);
              }}><Copy size={16} /> Sao chép</button>
              <button aria-label={`Xóa ${unit.name || "đơn vị mới"}`} title="Xóa dòng đơn vị" className="btn px-3 text-red-700" onClick={() => removeUnit(unit.id)}><Trash2 size={16} /></button>
            </div>
          </td>
        </tr>)}</tbody>
        <tfoot className="sticky bottom-0 bg-[#dcebe3] font-extrabold"><tr>
          <th className="sticky left-0 border bg-[#dcebe3] p-3 text-left">TỔNG</th>
          {tables.flatMap(table => meals.map(meal => <td className="border p-3 text-lg" key={table + meal}>{unitRows.reduce((total, unit) => total + (counts[countKey(unit.id, table, meal)] || 0), 0)}</td>))}
          <td className="border" />
        </tr></tfoot>
      </table>
      <datalist id={historyId}>{unitHistory.map(unit => <option key={unit} value={unit} />)}</datalist>
    </div>
    <div className="mt-3 flex flex-wrap items-center gap-3">
      <button className="btn" onClick={addUnit}><Plus size={18} /> Thêm đơn vị</button>
      <p className="text-sm text-slate-500">Chọn đơn vị từng dùng hoặc nhập tên mới. Thay đổi này chỉ áp dụng cho ngày đang lập kế hoạch.</p>
    </div>
    <p className="mt-2 text-sm text-slate-500">Mẹo: có thể nhập phép tính, ví dụ <b>150+5</b>, rồi nhấn Enter.</p>
  </div>;
}
