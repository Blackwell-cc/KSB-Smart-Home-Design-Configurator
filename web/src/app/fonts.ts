import { Noto_Sans_Thai } from "next/font/google";

export const thaiFont = Noto_Sans_Thai({
  subsets: ["thai", "latin"],
  variable: "--font-noto-thai",
  display: "swap",
});
