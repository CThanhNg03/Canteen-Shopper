"use client";
import { Printer } from "lucide-react";
import { ArithmeticInput } from "@/components/calculator/arithmetic-input";
import { formatNumber } from "@/lib/utils";

export type ShoppingItem = {
  name: string;
  unit: string;
  supplier?: string;
  required: number;
  available: number;
  final: number;
  canteens?: { id: string; name: string; quantity: number }[];
};

export const initialShopping: ShoppingItem[] = [
  { name: "Thịt gà", unit: "kg", supplier: "Thực phẩm An Phú", required: 45.8, available: 0, final: 45.8 },
  { name: "Lá giang", unit: "kg", supplier: "Rau củ Minh Tâm", required: 1.22, available: 0.2, final: 1.02 },
  { name: "Rau muống", unit: "kg", supplier: "Rau củ Minh Tâm", required: 24.066, available: 2, final: 22.066 },
];

export function ShoppingList({ items, setItems, print = true, showBreakdown = false, editable = true }: {
  items: ShoppingItem[];
  setItems: (value: ShoppingItem[]) => void;
  print?: boolean;
  showBreakdown?: boolean;
  editable?: boolean;
}) {
  const update = (index: number, key: "available" | "final", value: number) => setItems(items.map((item, itemIndex) => itemIndex === index ? { ...item, [key]: value } : item));

  return <div>
    {print && <div className="no-print mb-4 flex justify-end"><button className="btn btn-primary" onClick={() => window.print()}><Printer size={19} /> In danh sách</button></div>}
    {!items.length ? <div className="rounded-lg border border-dashed p-8 text-center text-slate-500">Chưa có nguyên liệu từ các căng tin đã chọn.</div> : <div className="overflow-x-auto"><table className="w-full min-w-[760px] border-collapse">
      <thead><tr className="bg-[#176448] text-white"><th className="border p-3 text-left">Nguyên liệu / Nhà cung cấp</th><th className="border p-3">Tổng cần</th><th className="border p-3">Hiện có</th><th className="border p-3">Đề xuất</th><th className="border p-3">Cần mua</th></tr></thead>
      <tbody>{items.map((item, index) => {
        const suggested = Math.max(item.required - item.available, 0);
        return <tr key={`${item.name}-${item.supplier ?? ""}`}>
          <th className="border p-3 text-left"><div>{item.name}</div><div className="mt-1 text-xs font-medium text-slate-500">{item.supplier ?? "Chưa chọn nhà cung cấp"}</div>{showBreakdown && item.canteens?.length ? <div className="mt-2 flex flex-wrap gap-1">{item.canteens.map(canteen => <span key={canteen.id} className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-800">{canteen.name}: {formatNumber(canteen.quantity)} {item.unit}</span>)}</div> : null}</th>
          <td className="border bg-slate-50 p-3 text-center font-extrabold">{formatNumber(item.required)} {item.unit}</td>
          <td className="border p-2">{editable ? <ArithmeticInput value={item.available} onChange={value => update(index, "available", value)} /> : <div className="p-2 text-center">{formatNumber(item.available)} {item.unit}</div>}</td>
          <td className="border bg-slate-50 p-3 text-center font-bold">{formatNumber(suggested)} {item.unit}</td>
          <td className="border p-2">{editable ? <><ArithmeticInput value={item.final} onChange={value => update(index, "final", value)} /><div className="no-print mt-1 flex justify-center gap-1">{[Math.round(suggested * 10) / 10, Math.ceil(suggested)].filter((value, valueIndex, values) => values.indexOf(value) === valueIndex).map(value => <button key={value} className="rounded border bg-white px-2 py-1 text-xs" onClick={() => update(index, "final", value)}>{formatNumber(value)}</button>)}</div></> : <div className="p-2 text-center font-bold">{formatNumber(item.final)} {item.unit}</div>}</td>
        </tr>;
      })}</tbody>
    </table></div>}
  </div>;
}
