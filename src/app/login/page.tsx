"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { setAuthUserId } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { User, Users, ArrowRight, Sparkles } from "lucide-react";

const JINU_ID = "11111111-1111-1111-1111-111111111111";
const WIFE_ID = "22222222-2222-2222-2222-222222222222";

export default function LoginPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const handleLogin = (id: string) => {
    setAuthUserId(id);
    router.push("/");
  };

  if (!mounted) return null;

  return (
    <div
      className="flex min-h-screen items-center justify-center p-6"
      style={{
        background: 'var(--background)',
        backgroundImage: `
          radial-gradient(ellipse 60% 40% at 50% 0%, rgba(var(--primary-rgb), 0.2) 0%, transparent 60%),
          radial-gradient(ellipse 40% 30% at 80% 100%, rgba(139, 92, 246, 0.12) 0%, transparent 50%)
        `,
      }}
    >
      <div className="w-full max-w-sm animate-in">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div
              className="h-20 w-20 rounded-3xl flex items-center justify-center text-white text-2xl font-bold shadow-2xl"
              style={{
                background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent-purple) 100%)',
                boxShadow: '0 20px 60px rgba(var(--primary-rgb), 0.4)',
              }}
            >
              AF
            </div>
            <div className="absolute -top-1 -right-1">
              <Sparkles size={18} style={{ color: 'var(--accent-amber)' }} />
            </div>
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold tracking-tight gradient-text mb-2">
            Welcome to Aura
          </h1>
          <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
            Select your account to get started
          </p>
        </div>

        {/* Account Cards */}
        <div className="space-y-3">
          <button
            onClick={() => handleLogin(JINU_ID)}
            className="w-full glass-card rounded-2xl p-5 flex items-center gap-4 text-left group cursor-pointer transition-all duration-200"
          >
            <div
              className="h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent-purple) 100%)' }}
            >
              <User size={22} className="text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-base" style={{ color: 'var(--foreground)' }}>Login as Jinu</h3>
              <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Primary household account</p>
            </div>
            <ArrowRight size={18} className="opacity-0 group-hover:opacity-60 transition-opacity" style={{ color: 'var(--muted-foreground)' }} />
          </button>

          <button
            onClick={() => handleLogin(WIFE_ID)}
            className="w-full glass-card rounded-2xl p-5 flex items-center gap-4 text-left group cursor-pointer transition-all duration-200"
          >
            <div
              className="h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, var(--accent-teal) 0%, #06b6d4 100%)' }}
            >
              <Users size={22} className="text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-base" style={{ color: 'var(--foreground)' }}>Login as Wife</h3>
              <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Secondary household account</p>
            </div>
            <ArrowRight size={18} className="opacity-0 group-hover:opacity-60 transition-opacity" style={{ color: 'var(--muted-foreground)' }} />
          </button>
        </div>

        {/* Footer */}
        <div className="mt-10 text-center">
          <p className="text-[11px] font-medium" style={{ color: 'var(--muted-foreground)' }}>
            Version 1.0 · Private Household Access
          </p>
        </div>
      </div>
    </div>
  );
}
