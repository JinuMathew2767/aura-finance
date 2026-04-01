"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { setAuthUserId } from "@/lib/api-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Users } from "lucide-react";

// The hardcoded seeded UUIDs from Phase 1 / DB Seed
const JINU_ID = "11111111-1111-1111-1111-111111111111"; // John Doe inside seed data
const WIFE_ID = "22222222-2222-2222-2222-222222222222"; // Jane Doe inside seed data

export default function LoginPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogin = (id: string) => {
    setAuthUserId(id);
    router.push("/");
  };

  if (!mounted) return null;

  return (
    <div className="flex min-h-screen items-center justify-center p-6 bg-(--background)">
      <Card className="w-full max-w-md shadow-2xl glass border-0 border-t border-white/20">
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 bg-(--primary) rounded-[1.5rem] flex items-center justify-center shadow-lg shadow-blue-500/30">
              <span className="text-white font-bold text-2xl tracking-tighter">AF</span>
            </div>
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight text-(--foreground)">Welcome back</CardTitle>
          <CardDescription className="text-(--muted-foreground) text-base mt-2">
            Select an account to access Aura Finance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <Button
            variant="outline"
            className="w-full h-16 text-lg justify-start px-6 gap-4 font-semibold shadow-sm focus-visible:ring-(--primary)"
            onClick={() => handleLogin(JINU_ID)}
          >
            <div className="bg-(--primary)/10 p-2 rounded-full text-(--primary)">
              <User size={24} />
            </div>
            Login as Jinu
          </Button>

          <Button
            variant="outline"
            className="w-full h-16 text-lg justify-start px-6 gap-4 font-semibold shadow-sm focus-visible:ring-(--primary)"
            onClick={() => handleLogin(WIFE_ID)}
          >
            <div className="bg-pink-500/10 p-2 rounded-full text-pink-500">
              <Users size={24} />
            </div>
            Login as Wife
          </Button>
          
          <div className="mt-8 text-center">
            <p className="text-xs text-(--muted-foreground)">
              Development Build &bull; UUIDs are simulated
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
