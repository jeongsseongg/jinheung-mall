"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "@/app/lib/supabase-browser";

type AuthResponse = { error: string | null; needsEmailConfirmation?: boolean };

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  adminLoading: boolean;
  signIn: (email: string, password: string) => Promise<AuthResponse>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<AuthResponse>;
  signUp: (input: { email: string; password: string; name: string; phone: string }) => Promise<AuthResponse>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

type AdminRoleCacheEntry = { value: boolean; expiresAt: number };
type AdminStatus = { userId: string | null; value: boolean };
type AuthCacheGlobal = typeof globalThis & {
  __jinheungAdminRoleCache?: Map<string, AdminRoleCacheEntry>;
  __jinheungAdminRoleRequests?: Map<string, Promise<boolean>>;
};

const authCacheGlobal = globalThis as AuthCacheGlobal;
const adminRoleCache = authCacheGlobal.__jinheungAdminRoleCache ??= new Map();
const adminRoleRequests = authCacheGlobal.__jinheungAdminRoleRequests ??= new Map();
const adminRoleCacheTtl = 5 * 60 * 1000;
const authUnavailableMessage = "로그인 서비스에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요.";

async function checkAdminRole(userId: string): Promise<boolean> {
  const cached = adminRoleCache.get(userId);
  if (cached && cached.expiresAt > Date.now()) return cached.value;

  const pending = adminRoleRequests.get(userId);
  if (pending) return pending;

  const request = (async () => {
    const { data, error } = await getSupabaseBrowserClient().rpc("is_current_user_admin");
    if (error) throw error;
    const value = data === true;
    adminRoleCache.set(userId, { value, expiresAt: Date.now() + adminRoleCacheTtl });
    return value;
  })().finally(() => {
    adminRoleRequests.delete(userId);
  });

  adminRoleRequests.set(userId, request);
  return request;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [adminStatus, setAdminStatus] = useState<AdminStatus>({ userId: null, value: false });
  const userId = user?.id;
  const isAdmin = Boolean(userId && adminStatus.userId === userId && adminStatus.value);
  const adminLoading = loading || Boolean(userId && adminStatus.userId !== userId);

  useEffect(() => {
    let active = true;
    let unsubscribe: (() => void) | undefined;

    try {
      const supabase = getSupabaseBrowserClient();
      void supabase.auth.getSession()
        .then(({ data, error }) => {
          if (!active) return;
          setUser(error ? null : data.session?.user ?? null);
        })
        .catch(() => {
          if (active) setUser(null);
        })
        .finally(() => {
          if (active) setLoading(false);
        });

      const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
        if (!active) return;
        setUser(session?.user ?? null);
        setLoading(false);
      });
      unsubscribe = () => listener.subscription.unsubscribe();
    } catch {
      queueMicrotask(() => {
        if (!active) return;
        setUser(null);
        setLoading(false);
      });
    }

    return () => {
      active = false;
      unsubscribe?.();
    };
  }, []);

  useEffect(() => {
    if (loading || !userId) return;

    let active = true;
    void checkAdminRole(userId)
      .then((value) => {
        if (active) setAdminStatus({ userId, value });
      })
      .catch(() => {
        if (active) setAdminStatus({ userId, value: false });
      });

    return () => { active = false; };
  }, [loading, userId]);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    loading,
    isAdmin,
    adminLoading,
    async signIn(email, password) {
      try {
        const identifier = email.trim().toLowerCase();
        const loginEmail = identifier.includes("@") ? identifier : `${identifier}@login.jinheung.local`;
        const { error } = await getSupabaseBrowserClient().auth.signInWithPassword({ email: loginEmail, password });
        return { error: error?.message ?? null };
      } catch {
        return { error: authUnavailableMessage };
      }
    },
    async signUp({ email, password, name, phone }) {
      try {
        const { data, error } = await getSupabaseBrowserClient().auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/login?confirmed=1`,
            data: { name, phone },
          },
        });
        return { error: error?.message ?? null, needsEmailConfirmation: !error && !data.session };
      } catch {
        return { error: authUnavailableMessage };
      }
    },
    async changePassword(currentPassword, newPassword) {
      if (!user?.email) return { error: "로그인 정보를 확인할 수 없습니다." };
      try {
        const supabase = getSupabaseBrowserClient();
        const { error: reauthError } = await supabase.auth.signInWithPassword({
          email: user.email,
          password: currentPassword,
        });
        if (reauthError) return { error: "현재 비밀번호가 일치하지 않습니다." };
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        return { error: error?.message ?? null };
      } catch {
        return { error: authUnavailableMessage };
      }
    },
    async signOut() {
      try {
        await getSupabaseBrowserClient().auth.signOut({ scope: "local" });
      } catch {
        // Missing public configuration is already treated as an anonymous session.
      }
    },
  }), [adminLoading, isAdmin, loading, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
