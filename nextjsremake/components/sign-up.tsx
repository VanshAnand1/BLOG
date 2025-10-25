"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function SignUpForm() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // validate passwords match. returns true when valid
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
      // follow template behavior and send user to sign-up success page
      router.push("/auth/sign-up-success");
    } catch (error: unknown) {
      setError(
        error instanceof Error ? error.message : "An Unknown error has occured"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white">
      <h1>Sign up</h1>
      <p>Create a new account</p>
      <form onSubmit={handleSignUp}>
        <input
          id="email"
          type="email"
          placeholder="email@domain.com"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          id="username"
          type="text"
          placeholder="display name"
          required
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          id="password"
          type="password"
          placeholder="****"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <input
          id="confirmPassword"
          type="password"
          placeholder="****"
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
        <button type="submit" disabled={isLoading}>
          {isLoading ? "Creating account...." : "Sign Up"}
        </button>
      </form>
    </div>
  );
}
