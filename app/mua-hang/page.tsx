"use client";

import { useEffect, useMemo, useState } from "react";
import { Building2, CalendarDays, PackageCheck } from "lucide-react";
import { ShoppingList, type ShoppingItem } from "@/components/shopping/shopping-list";
import { aggregateShoppingItems } from "@/lib/planning";
import { defaultCanteens, readCanteens, readPlan, type Canteen, type MultiCanteenPlan } from "@/lib/canteens";
import { formatNumber } from "@/lib/utils";

const today = new Date().toISOString().slice(0, 10);

export default function ShoppingPage() {
  const [date, setDate] = useState(today);
  const [canteens, setCanteens] = useState<Canteen[]>(defaultCanteens);
  const [plan, setPlan] = useState<MultiCanteenPlan>({ canteens: {} });
  const [selectedIds, setSelectedIds] = useState<string[]>(defaultCanteens.map(canteen => canteen.id));
  const [adjustments, setAdjustments] = useState<Record<string, Pick<ShoppingItem, "available" | "final">>>({});

  useEffect(() => {
    const directory = readCanteens();
    // Local storage is the external persistence layer for this client-only MVP.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCanteens(directory);
    setSelectedIds(directory.map(canteen => canteen.id));
    setPlan(readPlan(date));
    setAdjustments({});
  }, [date]);

  const calculated = useMemo(() => aggregateShoppingItems(selectedIds.flatMap(canteenId => {
    const canteen = canteens.find(candidate => candidate.id === canteenId);
    const canteenPlan = plan.canteens[canteenId];
    return canteen && canteenPlan ? [{ canteenId, canteenName: canteen.name, items: canteenPlan.items }] : [];
  })), [canteens, plan, selectedIds]);

  const items = calculated.map(item => ({ ...item, ...(adjustments[`${item.name}|${item.supplier}`] ?? {}) }));
  const updateItems = (next: ShoppingItem[]) => setAdjustments(Object.fromEntries(next.map(item => [`${item.name}|${item.supplier}`, { available: item.available, final: item.final }])));
  const supplierCount = new Set(items.map(item => item.supplier)).size;
  const selectedCount = selectedIds.filter(id => plan.canteens[id]).length;

  return <div className="print-area space-y-5">
    <div className="flex flex-wrap items-center gap-3"><div><h1 className="text-2xl font-extrabold">Danh sách mua hàng tổng hợp</h1><p className="text-slate-500">Gộp nhu cầu của nhiều căng tin theo nguyên liệu và nhà cung cấp</p></div><label className="field no-print ml-auto flex items-center gap-2 font-bold"><CalendarDays size={19} /><input aria-label="Ngày mua hàng" type="date" value={date} onChange={event => setDate(event.target.value)} className="outline-none" /></label></div>

    <section className="section no-print p-4"><div className="mb-3 flex items-center gap-2"><Building2 className="text-[#176448]" /><div><h2 className="font-extrabold">Căng tin cần mua</h2><p className="text-sm text-slate-500">Bỏ chọn một nơi để loại số lượng của nơi đó khỏi tổng.</p></div><button className="btn ml-auto" onClick={() => setSelectedIds(selectedIds.length === canteens.length ? [] : canteens.map(canteen => canteen.id))}>{selectedIds.length === canteens.length ? "Bỏ chọn tất cả" : "Chọn tất cả"}</button></div><div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{canteens.map(canteen => { const hasPlan = Boolean(plan.canteens[canteen.id]); return <label key={canteen.id} className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 ${selectedIds.includes(canteen.id) ? "border-emerald-700 bg-emerald-50" : "bg-white"}`}><input type="checkbox" checked={selectedIds.includes(canteen.id)} onChange={() => setSelectedIds(current => current.includes(canteen.id) ? current.filter(id => id !== canteen.id) : [...current, canteen.id])} /><span><b className="block">{canteen.name}</b><span className="text-xs text-slate-500">{hasPlan ? "Đã có kế hoạch" : "Chưa có kế hoạch"}</span></span></label>; })}</div></section>

    <div className="grid gap-3 sm:grid-cols-3"><div className="section p-4"><div className="text-sm text-slate-500">Căng tin đã chọn</div><div className="text-2xl font-extrabold text-[#176448]">{selectedCount}</div></div><div className="section p-4"><div className="text-sm text-slate-500">Nhà cung cấp</div><div className="text-2xl font-extrabold text-[#176448]">{supplierCount}</div></div><div className="section p-4"><div className="text-sm text-slate-500">Mặt hàng</div><div className="text-2xl font-extrabold text-[#176448]">{items.length}</div></div></div>

    <section className="section p-4 sm:p-6"><div className="mb-4 flex items-center gap-2"><PackageCheck className="text-[#176448]" /><div><h2 className="text-lg font-extrabold">Tổng cần mua</h2><p className="text-sm text-slate-500">Số lớn là tổng; các nhãn bên dưới cho biết phần của từng căng tin.</p></div></div><ShoppingList items={items} setItems={updateItems} showBreakdown /></section>

    {items.length > 0 && <section className="section p-4"><h2 className="mb-3 font-extrabold">Tổng theo nhà cung cấp</h2><div className="grid gap-3 md:grid-cols-2">{[...new Set(items.map(item => item.supplier))].map(supplier => <div key={supplier} className="rounded-lg border p-3"><div className="font-extrabold text-[#176448]">{supplier}</div><div className="mt-2 space-y-1 text-sm">{items.filter(item => item.supplier === supplier).map(item => <div key={item.name} className="flex justify-between"><span>{item.name}</span><b>{formatNumber(item.final)} {item.unit}</b></div>)}</div></div>)}</div></section>}
  </div>;
}
