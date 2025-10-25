"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/template/ui/card";
import { Input } from "@/components/template/ui/input";
import { Label } from "@/components/template/ui/label";
import { Button } from "@/components/template/ui/button";
import Link from "next/link";

export function SignUpForm() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isMatching, setIsMatching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const checkPasswordsMatch = () => {
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return false;
    }
    return true;
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);
    if (!checkPasswordsMatch()) return;

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: username,
          },
          emailRedirectTo: `${window.location.origin}/protected`,
        },
      });

      if (error) throw error;
      router.push("/auth/sign-up-success");
    } catch (error: unknown) {
      setError(
        error instanceof Error ? error.message : "An Unknown error has occured"
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!password || !confirmPassword) {
      setIsMatching(true);
      return;
    }
    setIsMatching(password === confirmPassword);
  }, [password, confirmPassword]); // Eff

  return (
    <div className="flex flex-col gap-6">
      <Card className="bg-darkgray">
        <CardHeader>
          <CardTitle className="text-2xl">Sign Up</CardTitle>
          <CardDescription>Create a new account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignUp}>
            <div className="flex flex-col gap-5">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  type="text"
                  placeholder="Display Name"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="**********"
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                  }}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="**********"
                  required
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                  }}
                />
                <div className="text-sm text-red-500">
                  {!isMatching ? "Passwords do not match" : ""}
                </div>
                <div>
                  {error && <p className="text-sm text-red-500">{error}</p>}
                </div>
                <div>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Creating account...." : "Sign Up"}
                  </Button>
                </div>
                <div>
                  Already have an account? <Link href="/auth/login">Login</Link>
                </div>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
