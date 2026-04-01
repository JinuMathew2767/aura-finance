"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { clearAuthUserId, getAuthUserId } from "@/lib/api-client";
import {
  Home, Wallet, CreditCard, ListOrdered, PlusCircle, LogOut,
  PieChart, Landmark, Car, Bell, FileText, Download, Phone,
  Sun, Moon, ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import useSWR from "swr";
import { fetcher } from "@/lib/api-client";
import { useTheme } from "next-themes";

const navItems = [
  { label: "Dashboard", href: "/", icon: Home },
  { label: "Transactions", href: "/transactions", icon: ListOrdered },
  { label: "Accounts", href: "/accounts", icon: Wallet },
  { label: "Cards", href: "/cards", icon: CreditCard },
  { label: "Budgets", href: "/budgets", icon: PieChart },
  { label: "Loans", href: "/loans", icon: Landmark },
  { label: "Vehicles", href: "/vehicles", icon: Car },
  { label: "Alerts", href: "/notifications", icon: Bell },
  { label: "Reports", href: "/reports", icon: FileText },
  { label: "Exports", href: "/exports", icon: Download },
  { label: "WhatsApp", href: "/settings/whatsapp", icon: Phone },
];

export function Shell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const userId = getAuthUserId();

  const { data: notifications } = useSWR('/api/notifications', fetcher);
  const unreadCount = notifications?.filter((n: { is_read?: boolean }) => !n.is_read)?.length || 0;

  useEffect(() => {
    if (!userId) {
      router.push("/login");
    }
  }, [router, userId]);

  if (!userId) return null;

  return (
    <div className="flex min-h-screen md:pb-0" style={{ background: 'var(--background)' }}>

      {/* ── Sidebar Desktop ── */}
      <aside className="hidden md:flex w-64 flex-col fixed h-full z-50 glass-sidebar">

        {/* Logo */}
        <div className="px-6 py-7 flex items-center gap-3">
          <div
            className="h-9 w-9 rounded-xl flex items-center justify-center text-white text-xs font-bold shadow-lg flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent-purple) 100%)' }}
          >
            AF
          </div>
          <div>
            <span className="font-bold tracking-tight text-base" style={{ color: 'var(--foreground)' }}>Aura</span>
            <span className="block text-[10px] font-medium" style={{ color: 'var(--muted-foreground)' }}>Finance</span>
          </div>
        </div>

        {/* Nav divider */}
        <div className="divider mx-4 mb-3" />

        {/* Nav items */}
        <nav className="flex flex-col gap-1 px-3 flex-1 overflow-y-auto no-scrollbar pb-4">
          {navItems.map((item, i) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{ animationDelay: `${i * 30}ms` }}
                className={cn(
                  "animate-slide-left flex items-center justify-between px-3 py-2.5 rounded-xl font-medium transition-all duration-200 group",
                  isActive
                    ? "nav-active text-white"
                    : "hover:bg-(--muted) text-(--muted-foreground) hover:text-(--foreground)"
                )}
              >
                <div className="flex items-center gap-3">
                  <item.icon size={17} strokeWidth={isActive ? 2.5 : 2} />
                  <span className="text-sm">{item.label}</span>
                </div>
                <div className="flex items-center gap-1">
                  {item.href === '/notifications' && unreadCount > 0 && (
                    <span className={cn(
                      "text-[9px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center",
                      isActive ? 'bg-white/30 text-white' : 'bg-red-500 text-white'
                    )}>
                      {unreadCount}
                    </span>
                  )}
                  {!isActive && <ChevronRight size={12} className="opacity-0 group-hover:opacity-40 transition-opacity" />}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Bottom actions */}
        <div className="divider mx-4 mb-3" />
        <div className="px-3 pb-5 space-y-1">
          {/* Theme toggle */}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 hover:bg-(--muted)"
            style={{ color: 'var(--muted-foreground)' }}
          >
            {theme === 'dark'
              ? <><Sun size={17} /><span>Light Mode</span></>
              : <><Moon size={17} /><span>Dark Mode</span></>
            }
          </button>

          {/* Add Expense */}
          <Link
            href="/transactions/new"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200"
            style={{ color: 'var(--success)', background: 'rgba(16,185,129,0.08)' }}
          >
            <PlusCircle size={17} />
            Add Expense
          </Link>

          {/* Sign Out */}
          <button
            onClick={() => {
              clearAuthUserId();
              router.push('/login');
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 hover:bg-red-500/10 hover:text-red-500"
            style={{ color: 'var(--muted-foreground)' }}
          >
            <LogOut size={17} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main className="flex-1 md:pl-64 min-w-0 flex flex-col">
        {/* Mobile top header */}
        <header className="md:hidden sticky top-0 z-40 flex h-14 items-center justify-between px-4 glass-sidebar">
          <div className="font-bold tracking-tight text-sm flex items-center gap-2">
            <div
              className="h-7 w-7 rounded-lg flex items-center justify-center text-white text-[10px] font-bold"
              style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent-purple) 100%)' }}
            >AF</div>
            Aura Finance
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              className="h-8 w-8 rounded-full flex items-center justify-center shadow-md"
              style={{ color: 'var(--foreground)', background: 'var(--card)' }}
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <Link
              href="/transactions/new"
              className="h-8 w-8 rounded-full flex items-center justify-center text-white shadow-md"
              style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent-purple) 100%)' }}
            >
              <PlusCircle size={16} />
            </Link>
          </div>
        </header>

        <div className="flex-1 p-4 pb-28 md:p-8 max-w-5xl mx-auto w-full">
          {children}
        </div>
      </main>

      {/* ── Mobile Bottom Tab Nav ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-[calc(4rem+env(safe-area-inset-bottom))] pb-[env(safe-area-inset-bottom)] flex items-center justify-around px-2 z-50 glass-sidebar border-t border-(--border)">
        {navItems.map((item) => {
          if (["Accounts", "Cards", "WhatsApp", "Exports", "Loans", "Vehicles"].includes(item.label)) return null;
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative flex flex-col items-center justify-center w-full h-full gap-0.5 transition-all duration-200"
              style={{ color: isActive ? 'var(--primary)' : 'var(--muted-foreground)' }}
            >
              {isActive && (
                <span
                  className="absolute top-1.5 w-8 h-0.5 rounded-full"
                  style={{ background: 'var(--primary)' }}
                />
              )}
              <item.icon size={21} strokeWidth={isActive ? 2.5 : 1.8} />
              <span className="text-[9px] font-semibold tracking-tight">{item.label}</span>
              {item.href === '/notifications' && unreadCount > 0 && (
                <span className="absolute top-2 right-3 bg-red-500 w-2 h-2 rounded-full border-2 border-(--card)" />
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
