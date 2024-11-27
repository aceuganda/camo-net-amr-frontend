"use client";
import Link from "next/link";
import { useState, useEffect } from 'react';
import { usePathname } from "next/navigation";
import { useUserInfor } from "@/lib/hooks/useAuth";
import { useRouter } from "next/navigation";
import { ChevronLeftIcon, ChevronRightIcon } from "@radix-ui/react-icons";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { data, isLoading, error } = useUserInfor(); 
  const [roles, setRoles] = useState<string | null | undefined>(null);
  const [isCollapsed, setIsCollapsed] = useState(false); 
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (data?.data) {
      setRoles(data.data.user.roles);
    }
    if (error) {
      router.push("/authenticate");
    }
  }, [data, error, router]);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className="flex">
      <div className={`bg-gray-200 h-screen p-4 transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'}`}>
        <div className="flex justify-between items-center mb-4">
          <h2 className={`text-2xl font-bold ${isCollapsed ? 'hidden' : ''}`}>Admin</h2>
          <button onClick={toggleSidebar}>
            {isCollapsed ? <ChevronRightIcon className="h-5 w-5" /> : <ChevronLeftIcon className="h-5 w-5" />}
          </button>
        </div>
        <nav>
          <ul className={`transition-opacity ${isCollapsed ? 'opacity-0' : 'opacity-100'}`}>
            <li className={`mb-2 ${pathname === '/datasets/admin' ? 'text-[#24408E]' : ''}`}>
              <Link href="/datasets/admin">Requests</Link>
            </li>
            {roles?.includes("super_admin") && (
              <>
              <li className={`mb-2 ${pathname === '/datasets/admin/users' ? 'text-[#24408E]' : ''}`}>
                <Link href="/datasets/admin/users">Users</Link>
              </li>
              <li className={`mb-2 ${pathname === '/datasets/admin/datasets' ? 'text-[#24408E]' : ''}`}>
                <Link href="/datasets/admin/datasets">Datasets</Link>
              </li>
              </>
            )}
          </ul>
        </nav>
      </div>
      <div className="flex-1 overflow-y-auto max-h-screen">{children}</div>
    </div>
  );
}
