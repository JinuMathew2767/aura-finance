"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { getAuthUserId } from "@/lib/api-client";
import { Home, Wallet, CreditCard, ListOrdered, PlusCircle, LogOut, PieChart, Landmark, Car, Bell, FileText, Download, Phone } from "lucide-react";
import { cn } from "@/lib/utils";
import useSWR from "swr";
import { fetcher } from "@/lib/api-client";

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
  const [mounted, setMounted] = useState(false);

  const { data: notifications } = useSWR('/api/notifications', fetcher);
  const unreadCount = notifications?.filter((n: any) => !n.is_read)?.length || 0;

  useEffect(() => {
    setMounted(true);
    if (!getAuthUserId()) {
      router.push("/login");
    }
  }, [router]);

  if (!mounted || !getAuthUserId()) return null;

  return (
    <div className="flex bg-(--background) min-h-screen pb-20 md:pb-0">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex w-64 flex-col border-r border-(--border) bg-(--card) fixed h-full glass-dark z-50">
        <div className="p-6 md:p-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-(--primary) rounded-xl flex items-center justify-center text-white font-bold text-xs shadow-md">
              AF
            </div>
            <span className="font-bold tracking-tight text-(--foreground) text-xl">Aura</span>
          </div>
        </div>

        <nav className="flex flex-col gap-2 px-4 flex-1 overflow-y-auto no-scrollbar pb-6 shadow-inner ring-1 ring-inset ring-transparent">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center justify-between px-4 py-3 rounded-xl font-medium transition-colors duration-200",
                  isActive 
                    ? "bg-(--primary) text-(--primary-foreground) shadow-md"
                    : "text-(--muted-foreground) hover:bg-(--secondary) hover:text-(--foreground)"
                )}
              >
                <div className="flex items-center gap-3">
                  <item.icon size={20} />
                  {item.label}
                </div>
                {item.href === '/notifications' && unreadCount > 0 && (
                  <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full", isActive ? 'bg-white text-(--primary)' : 'bg-rose-500 text-white')}>
                    {unreadCount}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-(--border) space-y-2">
           <Link href="/transactions/new" className="flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-emerald-600 bg-emerald-500/10 hover:bg-emerald-500/20 transition-colors">
              <PlusCircle size={20} />
              Add Expense
           </Link>
           <button 
             onClick={() => { localStorage.clear(); router.push('/login'); }} 
             className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-(--muted-foreground) hover:bg-(--secondary) hover:text-(--foreground) transition-colors"
           >
              <LogOut size={20} />
              Sign Out
           </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 md:pl-64 min-w-0 flex flex-col pt-safe">
         {/* Mobile Header */}
         <header className="md:hidden flex h-14 items-center justify-between px-4 sticky top-0 bg-(--background)/80 backdrop-blur-md z-40 border-b border-(--border)">
            <div className="font-bold tracking-tight flex items-center gap-2">Aura Finance</div>
            <Link href="/transactions/new" className="h-8 w-8 bg-(--primary) text-white rounded-full flex items-center justify-center shadow-md">
              <PlusCircle size={18} />
            </Link>
         </header>
         
         <div className="flex-1 p-4 md:p-8 max-w-5xl mx-auto w-full">
           {children}
         </div>
      </main>

      {/* Mobile Bottom Tab Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-(--card)/90 backdrop-blur-xl border-t border-(--border) flex items-center justify-around px-1 z-50 pb-safe shadow-[0_-10px_40px_rgba(0,0,0,0.05)] overflow-x-auto no-scrollbar">
        {navItems.map((item) => {
          // Hide settings and heavy detail tabs on bottom nav to prevent extreme clutter on tiny screens
          if (["Accounts", "Cards", "WhatsApp", "Exports", "Loans", "Vehicles"].includes(item.label)) return null; 

          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex flex-col items-center justify-center w-full min-w-16 h-full gap-1 transition-colors",
                isActive ? "text-(--primary)" : "text-(--muted-foreground)"
              )}
            >
              <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[9px] font-medium tracking-tight">{item.label}</span>
              {item.href === '/notifications' && unreadCount > 0 && (
                <span className="absolute top-2 right-4 bg-rose-500 w-2 h-2 rounded-full border border-(--card)"></span>
              )}
            </Link>
          )
        })}
      </nav>
    </div>
  );
}
