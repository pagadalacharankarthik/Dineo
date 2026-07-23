"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldCheck, Loader2, Eye, EyeOff } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Login failed");
      }

      toast.success("Welcome back, Administrator!");
      router.push("/admin");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-4 select-none relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-red-950/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-zinc-900/40 blur-[120px] pointer-events-none" />

      <Card className="w-full max-w-md bg-zinc-900/50 border-zinc-800/80 backdrop-blur-md shadow-2xl relative z-10">
        <CardHeader className="space-y-2 text-center pb-6 border-b border-zinc-850">
          <div className="mx-auto bg-red-950/40 border border-red-800/30 w-12 h-12 rounded-xl flex items-center justify-center mb-2 shadow-inner">
            <ShieldCheck className="w-6 h-6 text-red-500" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-zinc-100">Super Admin Panel</CardTitle>
          <CardDescription className="text-zinc-400 text-sm">
            Access credentials required. Unauthorized access is monitored.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-zinc-300 text-sm font-medium">Administrator Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@dineo.in"
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                className="bg-zinc-950/80 border-zinc-850 text-zinc-100 focus:border-red-500/50 focus:ring-red-500/20 placeholder:text-zinc-600 transition-all duration-200"
                disabled={isLoading}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-zinc-300 text-sm font-medium">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                  className="bg-zinc-950/80 border-zinc-850 text-zinc-100 focus:border-red-500/50 focus:ring-red-500/20 placeholder:text-zinc-600 transition-all duration-200 pr-10"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-350 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <Button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700 text-zinc-100 font-semibold shadow-lg hover:shadow-red-900/10 transition-all duration-200 mt-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Authenticating...
                </>
              ) : (
                "Access Terminal"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
