"use client";

import { useEffect, useMemo, useState } from "react";
import { Building2, Calendar, Check, Copy, Save, ShoppingBasket, Users, Utensils } from "lucide-react";
import { defaultUnits, HeadcountGrid, type UnitRow } from "@/components/headcount/headcount-grid";
import { MenuEditor, type MenuRow } from "@/components/menu/menu-editor";
import { ShoppingList } from "@/components/shopping/shopping-list";
import { aggregateShoppingItems, calculateShoppingItems, getServingCount } from "@/lib/planning";
import { defaultCanteens, makeDefaultDishNorms, menuKey, planStorageKey, readCanteens, readPlan, type Canteen, type CanteenPlan } from "@/lib/canteens";

const today = new Date().toISOString().slice(0, 10);
const defaultRows: MenuRow[] = [
  { id: "1", name: "Gà nấu lá giang", note: "" },
  { id: "2", name: "Rau muống luộc", note: "" },
  { id: "3", name: "Canh bí xanh thịt", note: "" },
];
const makeDefaultUnitRows = (): UnitRow[] => defaultUnits.map(name => ({ id: `unit:${name}`, name }));
const emptyPlan = (): CanteenPlan => ({
  counts: {},
  unitRows: makeDefaultUnitRows(),
  menus: { [menuKey("Trưa", "72K")]: { rows: defaultRows.map(row => ({ ...row, id: crypto.randomUUID() })) } },
  dishNorms: makeDefaultDishNorms(),
  items: [],
  meal: "Trưa",
  table: "72K",
});

export default function TodayPage() {
  const [date, setDate] = useState(today);
  const [canteens, setCanteens] = useState<Canteen[]>(defaultCanteens);
  const [activeId, setActiveId] = useState(defaultCanteens[0].id);
  const [plans, setPlans] = useState<Record<string, CanteenPlan>>({});
  const [selectedIds, setSelectedIds] = useState<string[]>(defaultCanteens.map(canteen => canteen.id));
  const [saved, setSaved] = useState(false);
  const [loadedDate, setLoadedDate] = useState<string | null>(null);

  useEffect(() => {
    const directory = readCanteens();
    const stored = readPlan(date);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCanteens(directory);
    setActiveId(current => directory.some(canteen => canteen.id === current) ? current : directory[0].id);
    setSelectedIds(directory.map(canteen => canteen.id));
    setPlans(stored.canteens);
    setSaved(false);
    setLoadedDate(date);
  }, [date]);

  const activePlan = plans[activeId];
  const ensurePlan = () => activePlan ?? emptyPlan();
  const updateActive = (changes: Partial<CanteenPlan>) => setPlans(current => ({ ...current, [activeId]: { ...(current[activeId] ?? emptyPlan()), ...changes } }));

  useEffect(() => {
    if (loadedDate !== date || !activePlan) return;
    const calculated = calculateShoppingItems(activePlan);
    const nextItems = calculated.map(item => {
      const old = activePlan.items.find(candidate => candidate.name === item.name && candidate.unit === item.unit);
      if (!old) return item;
      const adjustment = old.final - Math.max(old.required - old.available, 0);
      return { ...item, available: old.available, final: Math.max(item.required - old.available + adjustment, 0) };
    });
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (JSON.stringify(nextItems) !== JSON.stringify(activePlan.items)) updateActive({ items: nextItems });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activePlan?.counts, activePlan?.menus, activePlan?.dishNorms, loadedDate, date, activeId]);

  const combinedItems = useMemo(() => aggregateShoppingItems(selectedIds.flatMap(canteenId => {
    const canteen = canteens.find(candidate => candidate.id === canteenId);
    const plan = plans[canteenId];
    return canteen && plan ? [{ canteenId, canteenName: canteen.name, items: plan.items }] : [];
  })), [canteens, plans, selectedIds]);

  const copyPreviousDay = () => {
    const previous = new Date(`${date}T00:00:00Z`);
    previous.setUTCDate(previous.getUTCDate() - 1);
    const copied = readPlan(previous.toISOString().slice(0, 10)).canteens[activeId];
    if (copied) updateActive(copied);
  };
  const save = () => {
    localStorage.setItem(planStorageKey(date), JSON.stringify({ version: 2, canteens: plans }));
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2000);
  };

  const plan = ensurePlan();
  const selectedMenuKey = menuKey(plan.meal, plan.table);
  const rows = plan.menus[selectedMenuKey]?.rows ?? [];
  const servings = getServingCount(plan.counts, plan.meal, plan.table);
  const setRows = (nextRows: MenuRow[]) => updateActive({ menus: { ...plan.menus, [selectedMenuKey]: { rows: nextRows } } });
  const activeCanteen = canteens.find(canteen => canteen.id === activeId);

  return <div className="space-y-5">
    <div className="flex flex-wrap items-center gap-3"><div><h1 className="text-2xl font-extrabold">Kế hoạch hôm nay</h1><p className="text-slate-500">Quản lý quân số và thực đơn riêng cho từng căng tin</p></div><div className="ml-auto flex flex-wrap gap-2"><label className="field flex items-center gap-2 font-bold"><Calendar size={19} /><input aria-label="Ngày lập kế hoạch" type="date" value={date} onChange={event => setDate(event.target.value)} className="outline-none" /></label><button className="btn" onClick={copyPreviousDay}><Copy size={18} /> Sao chép hôm trước</button><button className="btn btn-primary" onClick={save}>{saved ? <Check size={18} /> : <Save size={18} />} {saved ? "Đã lưu" : "Lưu tất cả"}</button></div></div>
    <section className="section overflow-hidden"><div className="border-b bg-slate-50 px-4 py-3"><div className="flex items-center gap-2 font-extrabold"><Building2 size={20} className="text-[#176448]" /> Chọn căng tin để lập kế hoạch</div></div><div className="flex overflow-x-auto p-2">{canteens.map(canteen => <button key={canteen.id} onClick={() => setActiveId(canteen.id)} className={`min-w-max rounded-lg px-4 py-3 text-left ${activeId === canteen.id ? "bg-[#176448] text-white" : "hover:bg-slate-100"}`}><div className="font-extrabold">{canteen.name}</div><div className={`text-xs ${activeId === canteen.id ? "text-emerald-100" : "text-slate-500"}`}>{canteen.location}</div></button>)}</div></section>
    <div className="rounded-lg border-l-4 border-[#176448] bg-emerald-50 px-4 py-3"><b>Đang lập: {activeCanteen?.name}</b><span className="ml-2 text-sm text-emerald-800">Mỗi căng tin có quân số và thực đơn độc lập.</span></div>
    <section className="section p-3 sm:p-5"><h2 className="section-title mb-4 flex items-center gap-2"><Users className="text-[#176448]" /> A. QUÂN SỐ</h2><HeadcountGrid counts={plan.counts} setCounts={counts => updateActive({ counts })} unitRows={plan.unitRows} setUnitRows={unitRows => updateActive({ unitRows })} unitHistory={defaultUnits} /></section>
    <section className="section p-3 sm:p-5"><div className="mb-4 flex flex-wrap items-center gap-3"><h2 className="section-title flex items-center gap-2"><Utensils className="text-[#176448]" /> B. THỰC ĐƠN</h2><div className="ml-auto flex flex-wrap items-center gap-2"><span className="text-sm font-bold text-slate-600">Bữa ăn</span><select aria-label="Bữa ăn" className="field font-bold" value={plan.meal} onChange={event => updateActive({ meal: event.target.value })}><option>Sáng</option><option>Trưa</option><option>Chiều</option></select><span className="ml-1 text-sm font-bold text-slate-600">Mức ăn</span><select aria-label="Mức ăn" className="field font-bold" value={plan.table} onChange={event => updateActive({ table: event.target.value })}><option>72K</option><option>128K</option></select></div></div><div className="mb-3 rounded-lg bg-slate-50 px-3 py-2 text-sm"><b>{plan.meal} · {plan.table}</b><span className="ml-2 text-slate-500">{servings} suất</span></div><MenuEditor rows={rows} setRows={setRows} tableType={plan.table} servings={servings} dishNorms={plan.dishNorms} setDishNorms={dishNorms => updateActive({ dishNorms })} /></section>
    <section className="section p-3 sm:p-5"><h2 className="section-title mb-1 flex items-center gap-2"><ShoppingBasket className="text-[#176448]" /> C. TỔNG HỢP CẦN MUA</h2><p className="mb-3 text-sm text-slate-500">Đã gộp tất cả bữa ăn và mức ăn. Chọn các căng tin cần gộp vào danh sách.</p><div className="no-print mb-4 flex flex-wrap gap-2">{canteens.map(canteen => <label key={canteen.id} className={`flex cursor-pointer items-center gap-2 rounded-full border px-3 py-2 font-bold ${selectedIds.includes(canteen.id) ? "border-emerald-700 bg-emerald-50 text-emerald-900" : "bg-white text-slate-500"}`}><input type="checkbox" checked={selectedIds.includes(canteen.id)} onChange={() => setSelectedIds(current => current.includes(canteen.id) ? current.filter(id => id !== canteen.id) : [...current, canteen.id])} />{canteen.name}</label>)}</div><ShoppingList items={combinedItems} setItems={() => undefined} print={false} showBreakdown editable={false} /></section>
  </div>;
}
