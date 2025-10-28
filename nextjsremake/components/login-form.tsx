"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      router.push("/posts");
    } catch (error: unknown) {
      setError(
        error instanceof Error ? error.message : "An unknown error has occured"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <Card className="bg-periwinkle">
        <CardHeader>
          <CardTitle className="text-2xl dark:text-black">Log in</CardTitle>
          <CardDescription className="text-black">
            Log in with your email and password
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin}>
            <div className="flex flex-col gap-5">
              <div className="grid gap-2">
                <Label htmlFor="email" className="dark:text-black">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@example.com"
                  className="placeholder:text-lightgray border-black text-black"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password" className="text-black">
                    Password
                  </Label>
                  <Link
                    href="/auth/forgot-password"
                    className="ml-auto dark:text-black inline-block text-sm underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="**********"
                  className="placeholder:text-lightgray border-black text-black"
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                  }}
                />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <div>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Finding account...." : "Log In"}
                </Button>
              </div>
              <div className="dark:text-black">
                Don&apos;t have an account?{" "}
                <Link
                  href="/auth/sign-up"
                  className="p-2 rounded-2xl bg-sunset text-black hover:underline"
                >
                  Sign Up Instead
                </Link>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
