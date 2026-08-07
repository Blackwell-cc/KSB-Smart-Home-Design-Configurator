import type { Metadata } from "next";
import "./globals.css";
import { notoSansThai } from "./fonts";

export const metadata: Metadata = {
  title: "KSB Architect | Smart Home Design Configurator",
  description: "วางแผนบ้านกับสถาปนิก และดู Preview ได้ก่อนเริ่มสร้าง",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="th" className={notoSansThai.variable}>
      <body>{children}</body>
    </html>
  );
}
