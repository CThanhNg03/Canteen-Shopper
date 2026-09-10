import type { Metadata, Viewport } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/app-shell";

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ["vietnamese", "latin"],
  style: ["normal", "italic"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-be-vietnam-pro",
});
export const metadata: Metadata={title:"Bếp Việt - Kế hoạch bếp",description:"Lập thực đơn và danh sách mua hàng mỗi ngày",manifest:"/manifest.webmanifest",appleWebApp:{capable:true,title:"Bếp Việt"}};
export const viewport: Viewport={themeColor:"#176448",width:"device-width",initialScale:1};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="vi" className={`${beVietnamPro.variable} bg-[var(--cream)]`}><body><AppShell>{children}</AppShell></body></html>}
