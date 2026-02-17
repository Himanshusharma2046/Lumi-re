import type { Metadata } from "next";
import AdminSidebar from "@/components/admin/Sidebar";
import AdminTopbar from "@/components/admin/Topbar";
import AuthProvider from "@/components/providers/AuthProvider";

export const metadata: Metadata = {
  title: {
    default: "Admin | Jewelry Store",
    template: "%s | Jewelry Admin",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-slate-50">
        <AdminSidebar />

        {/* Main content — offset by sidebar width */}
        <div className="ml-18 lg:ml-64 transition-all duration-300 flex flex-col min-h-screen">
          <AdminTopbar />
          <main className="flex-1 p-6">{children}</main>
        </div>
      </div>
    </AuthProvider>
  );
}
