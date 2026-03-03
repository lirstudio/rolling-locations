import { Heebo } from "next/font/google"

// Hebrew-first font for both body and headings.
export const heebo = Heebo({
  subsets: ["hebrew", "latin"],
  display: "swap",
  variable: "--font-heebo",
})
