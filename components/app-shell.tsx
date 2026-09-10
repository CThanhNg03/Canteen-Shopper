"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, CalendarRange, ClipboardList, History, Settings, ChefHat } from "lucide-react";

const links = [["/", "Hôm nay", CalendarDays], ["/tuan", "Kế hoạch tuần", CalendarRange], ["/mua-hang", "Danh sách mua", ClipboardList], ["/lich-su", "Lịch sử", History], ["/thiet-lap", "Thiết lập", Settings]] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  return <>
    <header className="no-print border-b border-[#d6ddd8] bg-white">
      <div className="mx-auto flex max-w-[1500px] flex-col gap-2 px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4">
        <Link href="/" className="flex items-center gap-3 font-extrabold text-xl text-[#176448]"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#176448] text-white"><ChefHat /></span><span>BẾP VIỆT</span></Link>
        <span className="text-sm text-slate-500">Kế hoạch bếp mỗi ngày</span>
      </div>
    </header>
    <nav className="no-print sticky top-0 z-30 border-b bg-white shadow-sm">
      <div className="mx-auto flex max-w-[1500px] overflow-x-auto px-1 sm:px-2">
        {links.map(([href, label, Icon]) => <Link key={href} href={href} className={`flex min-h-12 min-w-max items-center gap-2 border-b-3 px-3 py-3 text-sm font-bold sm:px-4 sm:text-base ${path === href ? "border-[#176448] text-[#176448]" : "border-transparent text-slate-600"}`}><Icon size={20} />{label}</Link>)}
      </div>
    </nav>
    <main className="mx-auto max-w-[1500px] p-3 sm:p-5">{children}</main>
  </>;
}
