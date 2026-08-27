"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useRouter } from "next/navigation";

import { getApiBase } from "@/lib/apiBase";

function getAdminApiBase(): string {
  const base = getApiBase();
  return base ? `${base}/api` : "/api";
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AdminPermissions {
  dashboard?: boolean;
  products?: boolean;
  orders?: boolean;
  users?: boolean;
  categories?: boolean;
  promoCodes?: boolean;
  notifications?: boolean;
  jobs?: boolean;
  messages?: boolean;
}

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "admin" | "sub-admin" | "sub_admin";
  adminRole?: "root_admin" | "sub_admin";
  permissions?: AdminPermissions;
}

interface AdminAuthContextType {
  token: string | null;
  admin: AdminUser | null;
  isLoading: boolean;
  isMobileSidebarOpen: boolean;
  toggleMobileSidebar: () => void;
  closeMobileSidebar: () => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  apiFetch: <T>(path: string, options?: RequestInit) => Promise<T>;
  updateAdmin: (updated: Partial<AdminUser>) => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(
  undefined
);

// ─── Provider ─────────────────────────────────────────────────────────────────

export const AdminAuthProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [token, setToken] = useState<string | null>(null);
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const router = useRouter();

  const toggleMobileSidebar = useCallback(() => {
    setIsMobileSidebarOpen((prev) => !prev);
  }, []);

  const closeMobileSidebar = useCallback(() => {
    setIsMobileSidebarOpen(false);
  }, []);

  // Rehydrate from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("admin_token");
    const storedAdmin = localStorage.getItem("admin_user");
    if (stored && storedAdmin) {
      setToken(stored);
      setAdmin(JSON.parse(storedAdmin) as AdminUser);
    }
    setIsLoading(false);
  }, []);

  // Authenticated fetch helper
  const apiFetch = useCallback(
    async <T,>(path: string, options: RequestInit = {}): Promise<T> => {
      const storedToken = localStorage.getItem("admin_token");
      const res = await fetch(`${getAdminApiBase()}${path}`, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...(storedToken ? { Authorization: `Bearer ${storedToken}` } : {}),
          ...(options.headers ?? {}),
        },
      });

      if (res.status === 401) {
        // Token expired — clear and redirect
        localStorage.removeItem("admin_token");
        localStorage.removeItem("admin_user");
        setToken(null);
        setAdmin(null);
        router.push("/admin/login");
        throw new Error("Session expired. Please log in again.");
      }

      const data = (await res.json()) as { success: boolean; message?: string } & T;
      if (!res.ok) {
        throw new Error(
          (data as { message?: string }).message ?? "Request failed"
        );
      }
      return data;
    },
    [router]
  );

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await fetch(`${getAdminApiBase()}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = (await res.json()) as {
        success: boolean;
        message?: string;
        token?: string;
        data?: { id: string; name: string; email: string; role: string };
      };

      if (!res.ok || !data.success) {
        throw new Error(data.message ?? "Login failed");
      }

      if (
        data.data?.role !== "admin" &&
        data.data?.role !== "sub-admin" &&
        data.data?.role !== "sub_admin"
      ) {
        throw new Error("Access denied — admin or sub-admin accounts only");
      }

      const adminUser: AdminUser = {
        id: data.data.id,
        name: data.data.name,
        email: data.data.email,
        role: data.data.role as "admin" | "sub-admin" | "sub_admin",
      };

      localStorage.setItem("admin_token", data.token!);
      localStorage.setItem("admin_user", JSON.stringify(adminUser));
      setToken(data.token!);
      setAdmin(adminUser);
      router.push("/admin/dashboard");
    },
    [router]
  );

  const logout = useCallback(() => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
    setToken(null);
    setAdmin(null);
    router.push("/admin/login");
  }, [router]);

  const updateAdmin = useCallback((updated: Partial<AdminUser>) => {
    setAdmin((prev) => {
      if (!prev) return null;
      const next = { ...prev, ...updated };
      localStorage.setItem("admin_user", JSON.stringify(next));
      return next;
    });
  }, []);

  return (
    <AdminAuthContext.Provider
      value={{
        token,
        admin,
        isLoading,
        isMobileSidebarOpen,
        toggleMobileSidebar,
        closeMobileSidebar,
        login,
        logout,
        apiFetch,
        updateAdmin,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export const useAdminAuth = (): AdminAuthContextType => {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth must be used inside AdminAuthProvider");
  return ctx;
};
