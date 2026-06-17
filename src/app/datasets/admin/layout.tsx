"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useUserInfor } from "@/lib/hooks/useAuth";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@radix-ui/react-icons";
import {
  Database,
  FolderKanban,
  PanelsTopLeft,
  ShieldCheck,
  Users,
} from "lucide-react";

const adminLinks = [
  {
    href: "/datasets/admin",
    label: "Requests",
    description: "Review data access decisions",
    icon: ShieldCheck,
    minRole: "admin",
  },
  {
    href: "/datasets/admin/models",
    label: "Models",
    description: "Maintain ML model metadata",
    icon: PanelsTopLeft,
    minRole: "admin",
  },
  {
    href: "/datasets/admin/users",
    label: "Users",
    description: "Manage admin privileges",
    icon: Users,
    minRole: "super_admin",
  },
  {
    href: "/datasets/admin/datasets",
    label: "Datasets",
    description: "Edit catalogue and datasheets",
    icon: FolderKanban,
    minRole: "super_admin",
  },
] as const;

export default function Layout({ children }: { children: React.ReactNode }) {
  const { data, isLoading, error } = useUserInfor();
  const [isMounted, setIsMounted] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const roles = data?.data?.user?.roles ?? [];
  const isSuperAdmin = roles.includes("super_admin");
  const isAdmin = isSuperAdmin || roles.includes("admin");

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (error) {
      router.replace("/authenticate");
    }
    if (!isLoading && !error && !isAdmin) {
      router.replace("/");
    }
  }, [error, isAdmin, isLoading, router]);

  const visibleLinks = useMemo(
    () =>
      adminLinks.filter((link) =>
        link.minRole === "super_admin" ? isSuperAdmin : isAdmin
      ),
    [isAdmin, isSuperAdmin]
  );

  const canAccessPath = useMemo(() => {
    const matchedLink = adminLinks.find((link) => pathname === link.href);
    if (!matchedLink) {
      return isAdmin;
    }
    return matchedLink.minRole === "super_admin" ? isSuperAdmin : isAdmin;
  }, [isAdmin, isSuperAdmin, pathname]);

  useEffect(() => {
    if (!isLoading && !error && isAdmin && !canAccessPath) {
      router.replace("/datasets/admin");
    }
  }, [canAccessPath, error, isAdmin, isLoading, router]);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  if (!isMounted || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,#edf7ff_0%,#dceeff_100%)] text-slate-900">
        <div className="flex items-center gap-3 rounded-2xl border border-sky-100 bg-white/95 px-5 py-4 shadow-lg">
          <div className="h-3 w-3 animate-pulse rounded-full bg-cyan-500" />
          <p className="text-sm font-medium">Loading admin workspace...</p>
        </div>
      </div>
    );
  }

  if (error || !isAdmin || !canAccessPath) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.2),_transparent_22%),radial-gradient(circle_at_right,_rgba(36,64,142,0.12),_transparent_26%),linear-gradient(180deg,_#edf7ff_0%,_#dbeafe_46%,_#eff6ff_100%)]">
      <div className="flex min-h-screen">
        <aside
          className={`sticky top-0 hidden h-screen shrink-0 border-r border-white/10 bg-slate-950/85 px-4 py-5 text-slate-100 backdrop-blur xl:flex xl:flex-col ${
            isCollapsed ? "w-24" : "w-80"
          } transition-all duration-300`}
        >
          <div className="mb-6 flex items-start justify-between gap-3">
            <div className={isCollapsed ? "hidden" : "block"}>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300/90">
                Dataset Admin
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-white">
                Control Panel
              </h2>
              <p className="mt-2 text-sm text-slate-400">
                Moderate requests and maintain the platform inventory.
              </p>
            </div>
            <button
              onClick={toggleSidebar}
              className="rounded-xl border border-white/10 bg-white/5 p-2 text-slate-200 transition hover:bg-white/10"
              aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isCollapsed ? (
                <ChevronRightIcon className="h-5 w-5" />
              ) : (
                <ChevronLeftIcon className="h-5 w-5" />
              )}
            </button>
          </div>

          {!isCollapsed && (
            <div className="mb-6 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-400/20 text-cyan-200">
                  <Database className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">
                    {isSuperAdmin ? "Super Admin" : "Admin"}
                  </p>
                  <p className="text-xs text-cyan-100/80">
                    {visibleLinks.length} active workspace sections
                  </p>
                </div>
              </div>
            </div>
          )}

          <nav className="flex-1 space-y-2">
            {visibleLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  title={isCollapsed ? link.label : undefined}
                  className={`group flex items-center gap-3 rounded-2xl px-3 py-3 transition ${
                    isActive
                      ? "bg-cyan-400 text-slate-950 shadow-[0_12px_30px_rgba(34,211,238,0.25)]"
                      : "text-slate-300 hover:bg-white/6 hover:text-white"
                  }`}
                >
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                      isActive
                        ? "bg-slate-950/10"
                        : "bg-white/5 text-cyan-200 group-hover:bg-white/10"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  {!isCollapsed && (
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold">
                        {link.label}
                      </span>
                      <span
                        className={`block truncate text-xs ${
                          isActive ? "text-slate-900/70" : "text-slate-400"
                        }`}
                      >
                        {link.description}
                      </span>
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </aside>

        <main className="flex-1">
          <div className="border-b border-slate-200 bg-white/85 px-3 py-3 backdrop-blur sm:px-6 sm:py-4 xl:hidden">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-cyan-600 sm:text-xs">
                  Dataset Admin
                </p>
                <h1 className="mt-1 text-base font-semibold text-slate-900 sm:text-lg">
                  {visibleLinks.find((link) => link.href === pathname)?.label ?? "Admin"}
                </h1>
              </div>
              <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-2.5 py-1 text-[10px] font-medium text-cyan-700 sm:px-3 sm:text-xs">
                {isSuperAdmin ? "Super Admin" : "Admin"}
              </span>
            </div>
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
              {visibleLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium transition sm:px-4 sm:py-2 sm:text-sm ${
                      isActive
                        ? "bg-cyan-400 text-slate-950"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-100 hover:text-cyan-700"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="px-2 py-3 sm:px-6 sm:py-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
