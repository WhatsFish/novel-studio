import type { Metadata } from "next";
import Script from "next/script";
import Link from "next/link";
import "./globals.css";

const UMAMI_SRC = process.env.NEXT_PUBLIC_UMAMI_SRC;
const UMAMI_ID = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;

export const metadata: Metadata = {
  title: "Novel Studio — ai-native",
  description: "长篇小说创作管理：大纲 / 细纲 / 设定 / 人物 / 伏笔 / 章节。",
};

const NAV = [
  { href: "/", label: "仪表盘" },
  { href: "/volumes", label: "卷 · 章" },
  { href: "/foreshadows", label: "伏笔" },
  { href: "/characters", label: "人物" },
  { href: "/settings", label: "设定" },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-neutral-50 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100 antialiased font-sans">
        {UMAMI_SRC && UMAMI_ID ? (
          <Script defer src={UMAMI_SRC} data-website-id={UMAMI_ID} strategy="afterInteractive" />
        ) : null}
        <div className="flex min-h-screen">
          <aside className="w-44 shrink-0 border-r border-neutral-200 dark:border-neutral-800 px-4 py-6">
            <Link href="/" className="block text-lg font-semibold mb-6">
              墨房 <span className="text-xs font-normal text-neutral-400">Studio</span>
            </Link>
            <nav className="space-y-1">
              {NAV.map((n) => (
                <Link
                  key={n.href}
                  href={n.href}
                  className="block rounded px-3 py-1.5 text-sm text-neutral-600 hover:bg-neutral-200 dark:text-neutral-300 dark:hover:bg-neutral-800"
                >
                  {n.label}
                </Link>
              ))}
            </nav>
          </aside>
          <main className="flex-1 px-8 py-6 max-w-5xl">{children}</main>
        </div>
      </body>
    </html>
  );
}
