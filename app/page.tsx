"use client";
import { useEffect, useState } from "react";
import { Calendar, Check, Copy, Save, ShoppingBasket, Users, Utensils } from "lucide-react";
import { HeadcountGrid, type Counts } from "@/components/headcount/headcount-grid";
import { MenuEditor, type MenuRow } from "@/components/menu/menu-editor";
import { ShoppingList, type ShoppingItem } from "@/components/shopping/shopping-list";
import { calculateShoppingItems } from "@/lib/planning";

const today = new Date().toISOString().slice(0, 10);
const storageKey = (date: string) => `bep-plan:${date}`;
const defaultRows: MenuRow[] = [
  { id: "1", category: "Món chính", name: "Gà nấu lá giang", note: "" },
  { id: "2", category: "Rau", name: "Rau muống luộc", note: "" },
  { id: "3", category: "Canh", name: "Canh bí xanh thịt", note: "" },
];
type StoredPlan = { counts: Counts; rows: MenuRow[]; items: ShoppingItem[]; meal?: string; table?: string };

export default function TodayPage() {
  const [date, setDate] = useState(today);
  const [counts, setCounts] = useState<Counts>({});
  const [rows, setRows] = useState<MenuRow[]>(defaultRows);
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [meal, setMeal] = useState("Trưa");
  const [table, setTable] = useState("72K");
  const [saved, setSaved] = useState(false);
  const [loadedDate, setLoadedDate] = useState<string | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem(storageKey(date));
    let plan: StoredPlan | null = null;
    if (raw) {
      try {
        plan = JSON.parse(raw) as StoredPlan;
      } catch {
        localStorage.removeItem(storageKey(date));
      }
    }
    setCounts(plan?.counts ?? {});
    setRows(plan?.rows ?? defaultRows);
    setItems(plan?.items ?? []);
    setMeal(plan?.meal ?? "Trưa");
    setTable(plan?.table ?? "72K");
    setSaved(false);
    setLoadedDate(date);
  }, [date]);

  useEffect(() => {
    if (loadedDate !== date) return;
    const calculated = calculateShoppingItems(counts, rows, table, meal);
    setItems(previous => calculated.map(item => {
      const old = previous.find(candidate => candidate.name === item.name);
      if (!old) return item;
      const oldSuggested = Math.max(old.required - old.available, 0);
      const adjustment = old.final - oldSuggested;
      const suggested = Math.max(item.required - old.available, 0);
      return { ...item, available: old.available, final: Math.max(Math.round((suggested + adjustment) * 1000) / 1000, 0) };
    }));
  }, [counts, rows, table, meal, loadedDate, date]);

  const copyPreviousDay = () => {
    const previous = new Date(`${date}T00:00:00Z`);
    previous.setUTCDate(previous.getUTCDate() - 1);
    const raw = localStorage.getItem(storageKey(previous.toISOString().slice(0, 10)));
    if (!raw) return;
    const plan: StoredPlan = JSON.parse(raw);
    setCounts(plan.counts);
    setRows(plan.rows);
    setItems(plan.items);
    setMeal(plan.meal ?? meal);
    setTable(plan.table ?? table);
  };

  const save = () => {
    localStorage.setItem(storageKey(date), JSON.stringify({ counts, rows, items, meal, table }));
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2000);
  };

  return <div className="space-y-5">
    <div className="flex flex-wrap items-center gap-3"><div><h1 className="text-2xl font-extrabold">Kế hoạch hôm nay</h1><p className="text-slate-500">Quân số → Thực đơn → Cần mua</p></div><div className="ml-auto flex flex-wrap gap-2"><label className="field flex items-center gap-2 font-bold"><Calendar size={19} /><input aria-label="Ngày lập kế hoạch" type="date" value={date} onChange={event => setDate(event.target.value)} className="outline-none" /></label><button className="btn" onClick={copyPreviousDay}><Copy size={18} /> Sao chép hôm trước</button><button className="btn btn-primary" onClick={save}>{saved ? <Check size={18} /> : <Save size={18} />} {saved ? "Đã lưu" : "Lưu kế hoạch"}</button></div></div>
    <section className="section p-3 sm:p-5"><h2 className="section-title mb-4 flex items-center gap-2"><Users className="text-[#176448]" /> A. QUÂN SỐ</h2><HeadcountGrid counts={counts} setCounts={setCounts} /></section>
    <section className="section p-3 sm:p-5"><div className="mb-4 flex flex-wrap items-center gap-3"><h2 className="section-title flex items-center gap-2"><Utensils className="text-[#176448]" /> B. THỰC ĐƠN</h2><div className="ml-auto flex gap-2"><select aria-label="Bữa ăn" className="field font-bold" value={meal} onChange={event => setMeal(event.target.value)}><option>Trưa</option><option>Sáng</option><option>Chiều</option></select><select aria-label="Loại suất" className="field font-bold" value={table} onChange={event => setTable(event.target.value)}><option>72K</option><option>128K</option></select></div></div><MenuEditor rows={rows} setRows={setRows} /></section>
    <section className="section p-3 sm:p-5"><h2 className="section-title mb-1 flex items-center gap-2"><ShoppingBasket className="text-[#176448]" /> C. NGUYÊN LIỆU / CẦN MUA</h2><p className="mb-4 text-sm text-slate-500">Số lượng cần được tính từ quân số và định mức món ăn. Ô nền vàng có thể sửa.</p><ShoppingList items={items} setItems={setItems} print={false} /></section>
  </div>;
}
