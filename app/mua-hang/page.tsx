"use client";
import { useState } from "react";import { ShoppingList,initialShopping,type ShoppingItem } from "@/components/shopping/shopping-list";
export default function ShoppingPage(){const [items,setItems]=useState<ShoppingItem[]>(initialShopping);return <div className="print-area section p-4 sm:p-6"><div className="mb-5"><h1 className="text-2xl font-extrabold">Danh sách mua hàng</h1><p className="text-slate-500">{new Intl.DateTimeFormat("vi-VN",{dateStyle:"full"}).format(new Date())}</p></div><ShoppingList items={items} setItems={setItems}/></div>}
