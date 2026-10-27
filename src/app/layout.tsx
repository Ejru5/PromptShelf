import type { Metadata, Viewport } from "next";
import { Caveat, Inter_Tight, JetBrains_Mono, Newsreader, Roboto_Mono } from "next/font/google";
import { Footer } from "@/components/site/footer";
import { SearchLauncher } from "@/components/search/search-launcher";
import { Header } from "@/components/site/header";
import { ToastProvider } from "@/components/ui/toast";
import { SITE } from "@/config/site";
import "./globals.css";

// Only the UI font is preloaded (it's most of the text above the fold). The others
// swap in when ready — preloading all of them delayed the largest paint on slow networks.
const sans = Inter_Tight({ variable: "--font-inter-tight", subsets: ["latin"] });
const serif = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  weight: ["400", "600"],
  style: ["normal", "italic"],
  preload: false,
});
const mono = JetBrains_Mono({ variable: "--font-jetbrains", subsets: ["latin"], preload: false });
const hand = Caveat({ variable: "--font-caveat", subsets: ["latin"], preload: false });
// Only for big numerals (slashed zero) — two weights keeps it light.
const numeric = Roboto_Mono({
  variable: "--font-roboto-mono",
  subsets: ["latin"],
  weight: ["500", "700"],
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: `${SITE.name} — AI prompts with real results`, template: `%s · ${SITE.name}` },
  description: SITE.description,
};

export const viewport: Viewport = {
  themeColor: "#f1f0ed",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${sans.variable} ${serif.variable} ${mono.variable} ${hand.variable} ${numeric.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <a
          href="#main"
          className="sr-only z-50 rounded-full bg-ink px-4 py-2 text-sm text-paper focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
        >
          Skip to content
        </a>
        <ToastProvider>
          <Header />
          <div id="main" className="flex flex-1 flex-col">
            {children}
          </div>
          <Footer />
          <SearchLauncher />
        </ToastProvider>
      </body>
    </html>
  );
}
