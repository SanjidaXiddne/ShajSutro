"use client";

import { AdminAuthProvider } from "@/context/AdminAuthContext";
import AdminHeader from "@/components/admin/AdminHeader";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminAuthProvider>
      <div
        className="flex h-screen w-screen overflow-hidden relative"
        style={{ background: "linear-gradient(135deg, #0a0a0f 0%, #0d0d1a 40%, #0a0f1a 70%, #060810 100%)" }}
      >
        {/* Ambient background orbs */}
        <div
          className="fixed top-[-15%] left-[-5%] w-[600px] h-[600px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)", zIndex: 0 }}
        />
        <div
          className="fixed bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)", zIndex: 0 }}
        />
        <div
          className="fixed top-[40%] right-[20%] w-[300px] h-[300px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(16,185,129,0.05) 0%, transparent 70%)", zIndex: 0 }}
        />

        <AdminSidebar />
        <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative" style={{ zIndex: 1 }}>
          <AdminHeader />
          <main className="flex-1 overflow-y-auto">{children}</main>
        </div>
      </div>
    </AdminAuthProvider>
  );
}
