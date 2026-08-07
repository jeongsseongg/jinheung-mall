"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "@/app/lib/supabase-browser";

type AuthResponse = { error: string | null; needsEmailConfirmation?: boolean };

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<AuthResponse>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<AuthResponse>;
  signUp: (input: { email: string; password: string; name: string; phone: string }) => Promise<AuthResponse>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (active) {
        setUser(data.session?.user ?? null);
        setLoading(false);
      }
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });
    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    loading,
    async signIn(email, password) {
      const identifier = email.trim().toLowerCase();
      const loginEmail = identifier.includes("@") ? identifier : `${identifier}@login.jinheung.local`;
      const { error } = await getSupabaseBrowserClient().auth.signInWithPassword({ email: loginEmail, password });
      return { error: error?.message ?? null };
    },
    async signUp({ email, password, name, phone }) {
      const { data, error } = await getSupabaseBrowserClient().auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/login?confirmed=1`,
          data: { name, phone },
        },
      });
      return { error: error?.message ?? null, needsEmailConfirmation: !error && !data.session };
    },
    async changePassword(currentPassword, newPassword) {
      if (!user?.email) return { error: "로그인 정보를 확인할 수 없습니다." };
      const supabase = getSupabaseBrowserClient();
      const { error: reauthError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });
      if (reauthError) return { error: "현재 비밀번호가 일치하지 않습니다." };
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      return { error: error?.message ?? null };
    },
    async signOut() {
      await getSupabaseBrowserClient().auth.signOut();
    },
  }), [loading, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
