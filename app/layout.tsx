import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AppShell } from "@/components/app-shell";
export const metadata: Metadata={title:"Bếp Việt - Kế hoạch bếp",description:"Lập thực đơn và danh sách mua hàng mỗi ngày",manifest:"/manifest.webmanifest",appleWebApp:{capable:true,title:"Bếp Việt"}};
export const viewport: Viewport={themeColor:"#176448",width:"device-width",initialScale:1};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="vi"><body><AppShell>{children}</AppShell></body></html>}
